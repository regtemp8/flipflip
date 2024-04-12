export type ServerSettings = {
  [key: string]: string | number | undefined;

  host?: string;
  port?: number;
};

export const initialServerSettings: ServerSettings = {
  host: '0.0.0.0',
  port: 59779,
};
