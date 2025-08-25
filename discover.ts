import {
  isHidden,
  pathToUrl,
  safeServiceName,
  stripDotSlash,
} from "./utils.ts";
import { Service } from "./types.ts";
import { BASE_PORT, DOCKERFILE_NAME } from "./constants.ts";

function buildService(dir: string, index: number): Service {
  const folderPath = stripDotSlash(dir);
  const serviceName = safeServiceName(folderPath);
  return {
    dir,
    url: pathToUrl(folderPath),
    path: folderPath,
    host: serviceName,
    port: BASE_PORT + index,
    name: serviceName,
  };
}

async function scanDirectory(dir: string): Promise<string[]> {
  const result: string[] = [];

  for await (const entry of Deno.readDir(dir)) {
    if (entry.isDirectory && !isHidden(entry.name)) {
      const dockerfilePath = `${dir}/${entry.name}/${DOCKERFILE_NAME}`;
      try {
        if ((await Deno.stat(dockerfilePath)).isFile) {
          result.push(`${dir}/${entry.name}`);
        }
      } catch {
        // ignored
      }
    }
  }

  return result.sort((a, b) => a.localeCompare(b));
}

export async function discoverServices(
  rootDir: string,
  services: Service[] = [],
): Promise<Service[]> {
  const dirs = await scanDirectory(rootDir);
  return services.map((service) => service.dir).concat(dirs).map(buildService);
}
