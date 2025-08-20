const HOST_HOME = Deno.env.get("HOST_HOME");
const HOME = HOST_HOME || Deno.env.get("HOME");
const ENV = Deno.env.get("ENV");
const OS = Deno.build.os;

export const IS_LOCAL = ENV === "local" || OS === "darwin";

const URL_LOCAL = "localhost";
const URL_SERVER = "sandbox.appsmith.com";

export const BASE_PORT = 5001;
export const CADDYFILE_PATH = `${HOME}/tmp/dockyard/Caddyfile`;
export const DOCKERFILE_NAME = "Dockerfile";
export const DOCKER_COMPOSE_PATH = `${HOME}/tmp/dockyard/docker-compose.yml`;
export const DOMAIN_SUFFIX = IS_LOCAL ? URL_LOCAL : URL_SERVER;
