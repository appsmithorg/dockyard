export interface Service {
  dir: string;
  url: string;
  path: string;
  host: string;
  port: number;
  name: string;
}

export interface ComposeService {
  build?: { context: string; dockerfile: string };
  container_name?: string;
  image?: string;
  ports?: string[];
  restart?: string;
  environment?: Record<string, string>;
  volumes?: string[];
  networks?: string[];
}

export interface Compose {
  services: Record<string, ComposeService>;
  volumes?: Record<string, unknown>;
  networks?: Record<string, { driver: string }>;
}
