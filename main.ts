import { resolve } from "std/path/mod.ts";

import { discoverServices } from "./discover.ts";
import { buildCompose, printYaml, writeYamlToFile } from "./compose.ts";
import { generateCaddyfile } from "./caddy.ts";
import {
  CADDYFILE_PATH,
  DOCKER_COMPOSE_PATH,
  EMPTY_STRING,
  SERVICES_PATH,
} from "./constants.ts";
import { readFileData, writeFileData } from "./utils.ts";
import { Service } from "./types.ts";

const folder = Deno.args[0] ?? ".";
const ifAppend = Deno.args.includes("--append");
const ifDebug = Deno.args.includes("--debug");
const rootDir = resolve(folder);

await writeFileData(CADDYFILE_PATH, EMPTY_STRING);
await writeFileData(DOCKER_COMPOSE_PATH, EMPTY_STRING);

let services: Service[] = ifAppend ? await readFileData(SERVICES_PATH, []) : [];
services = await discoverServices(rootDir, services);
await writeFileData(SERVICES_PATH, services);

const composeObj = buildCompose(services);
writeYamlToFile(DOCKER_COMPOSE_PATH, composeObj);

await generateCaddyfile(services);
const caddyfileContent = await Deno.readTextFile(CADDYFILE_PATH);

if (ifDebug) {
  console.log(services);
  printYaml(composeObj);
  console.log(caddyfileContent);
}

console.table(services);
