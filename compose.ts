import yaml from "js-yaml";
import { Compose, ComposeService, Service } from "./types.ts";
import { CADDYFILE_PATH, DOCKERFILE_NAME } from "./constants.ts";

function serviceToCompose(service: Service): ComposeService {
  return {
    build: {
      context: service.path,
      dockerfile: DOCKERFILE_NAME,
    },
    container_name: service.name,
    restart: "unless-stopped",
    environment: {
      PORT: service.port.toString(),
    },
    networks: ["dockyard-net"],
  };
}

function addServicesToCompose(
  services: Service[],
  serviceDefs: Record<string, ComposeService>,
): void {
  for (const s of services) {
    serviceDefs[s.name] = serviceToCompose(s);
  }
}

function addDefaultCaddy(
  serviceDefs: Record<string, ComposeService>,
  volumeDefs: Record<string, unknown>,
): void {
  serviceDefs["caddy"] = {
    image: "caddy:latest",
    container_name: "caddy",
    restart: "unless-stopped",
    ports: ["80:80", "443:443"],
    volumes: [
      `${CADDYFILE_PATH}:/etc/caddy/Caddyfile`,
      "caddy_data:/data",
      "caddy_config:/config",
    ],
    networks: ["dockyard-net"],
  };

  volumeDefs["caddy_data"] = {};
  volumeDefs["caddy_config"] = {};
}

export function buildCompose(services: Service[]): Compose {
  const serviceDefs: Record<string, ComposeService> = {};
  const volumeDefs: Record<string, unknown> = {};

  addServicesToCompose(services, serviceDefs);
  addDefaultCaddy(serviceDefs, volumeDefs);

  return {
    services: serviceDefs,
    volumes: volumeDefs,
    networks: { "dockyard-net": { driver: "bridge" } },
  };
}

export function printYaml(obj: unknown): void {
  console.log(yaml.dump(obj, { noRefs: true }));
}

export function writeYamlToFile(filename: string, obj: unknown): void {
  const yamlContent = yaml.dump(obj, { noRefs: true });
  Deno.writeTextFileSync(filename, yamlContent);
}
