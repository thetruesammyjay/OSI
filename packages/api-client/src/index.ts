export type ApiConfig = { baseUrl: string; token?: string };

export function apiUrl(config: ApiConfig, path: string): string {
  return `${config.baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
