export type WebSocketMessage = {
  messageID?: number;
  correlationID?: number;
  operation: string;
  args: unknown[];
};
