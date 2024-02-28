import { LC, WebSocketMessage } from "flipflip-common";

export class LoginService {
  private static instance: LoginService;
  private readonly ws: WebSocket;
  private nextMessageID: number;

  private constructor() {
    const origin = window.location.origin.replace("http", "ws");
    this.ws = new WebSocket(`${origin}/login`);
    this.nextMessageID = 1;
  }

  public addListener(
    operation: string,
    handler: (...args: any[]) => void,
    controller: AbortController,
  ): void {
    this.ws.addEventListener(
      "message",
      (ev: MessageEvent<any>) => {
        const message = JSON.parse(ev.data) as WebSocketMessage;
        if (message.operation === operation) {
          handler(message.args);
        }
      },
      { signal: controller.signal },
    );
  }

  public async getLoginCode(): Promise<string | undefined> {
    return await this.invoke(LC.code).then((args: any[] | undefined) =>
      args != null ? (args[0] as string) : undefined,
    );
  }

  private invoke(
    operation: string,
    ...args: any[]
  ): Promise<any[] | undefined> {
    return new Promise((resolve, reject) => {
      const request = this.createMessage(operation, args);

      // TODO add timeout and call reject
      const controller = new AbortController();
      this.ws.addEventListener(
        "message",
        (ev: MessageEvent<any>) => {
          const response = JSON.parse(ev.data) as WebSocketMessage;
          if (response.correlationID === request.messageID) {
            resolve(response.args);
            controller.abort();
          }
        },
        { signal: controller.signal },
      );

      this.sendMessage(request);
    });
  }

  private createMessage(operation: string, args: any[]): WebSocketMessage {
    const messageID = this.nextMessageID++;
    return { messageID, operation, args };
  }

  private sendMessage(message: WebSocketMessage) {
    this.getConnection().then(() => this.ws.send(JSON.stringify(message)));
  }

  private getConnection(): Promise<void> {
    return this.ws.readyState === this.ws.OPEN
      ? Promise.resolve()
      : new Promise((resolve) => {
          const controller = new AbortController();
          this.ws.addEventListener(
            "open",
            () => {
              controller.abort();
              resolve(undefined);
            },
            { signal: controller.signal },
          );
        });
  }

  public static getInstance(): LoginService {
    if (!LoginService.instance) {
      LoginService.instance = new LoginService();
    }

    return LoginService.instance;
  }
}

export default function login() {
  return LoginService.getInstance();
}
