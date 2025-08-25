import { resolve } from "std/path/mod.ts";
import { Service } from "./types.ts";
import { CADDYFILE_PATH, IS_LOCAL } from "./constants.ts";

const INDENT = " ".repeat(4);

function generateHeader(): string {
  return IS_LOCAL ? `{\n${INDENT}auto_https off\n}\n\n` : "";
}

function formatService(service: Service): string {
  return `${service.name}:${service.port}`;
}

function formatBlock(service: Service): string {
  return `${service.url} ` +
    `{\n${INDENT}reverse_proxy ` +
    `${formatService(service)}\n}`;
}

function generateBlocks(services: Service[]): string {
  return services.map(formatBlock).join("\n\n");
}

export async function generateCaddyfile(services: Service[]) {
  const header = generateHeader();
  const blocks = generateBlocks(services);
  const caddyfile = header + blocks + "\n";
  const filePath = resolve(CADDYFILE_PATH);

  await Deno.writeTextFile(filePath, caddyfile.trim() + "\n");
}
