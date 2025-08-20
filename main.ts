import { dirname, resolve } from "std/path/mod.ts";

import { discoverServices } from "./discover.ts";
import { buildCompose, printYaml, writeYamlToFile } from "./compose.ts";
import { generateCaddyfile } from "./caddy.ts";
import { CADDYFILE_PATH, DOCKER_COMPOSE_PATH } from "./constants.ts";
import { ensureDirectoryExists } from "./utils.ts";

const folder = Deno.args[0] ?? ".";
const rootDir = resolve(folder);

const caddyfileDir = dirname(CADDYFILE_PATH);
const composeDir = dirname(DOCKER_COMPOSE_PATH);

await ensureDirectoryExists(caddyfileDir);
await ensureDirectoryExists(composeDir);

const services = discoverServices(rootDir);

const composeObj = buildCompose(services);
writeYamlToFile(DOCKER_COMPOSE_PATH, composeObj);

await generateCaddyfile(services);

const caddyfileContent = await Deno.readTextFile(CADDYFILE_PATH);

console.log(services);
printYaml(composeObj);
console.log(caddyfileContent);
