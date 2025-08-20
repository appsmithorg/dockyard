#!/bin/sh

DOCKYARD_URL="https://raw.githubusercontent.com/appsmithorg/dockyard/main/main.ts"
IMPORT_MAP_URL="https://raw.githubusercontent.com/appsmithorg/dockyard/main/deno.json"
DOCKYARD_TMP="$HOME/tmp"
DOCKYARD_COMPOSE_PATH="$DOCKYARD_TMP/dockyard/docker-compose.yml"

compose() {
  target="$1"

  docker run --rm -it \
    -v "$target:$target" \
    -v "$DOCKYARD_TMP:$DOCKYARD_TMP" \
    -v "$HOME/deno-cache:/deno-cache" \
    -e DENO_DIR=/deno-cache \
    -e HOST_HOME="$HOME" \
    -e ENV=local \
    denoland/deno:latest \
    deno run -A --import-map="$IMPORT_MAP_URL" "$DOCKYARD_URL" "$target"
}

dockyard() {
  target="$1"
  if [ -z "$target" ]; then
    echo "Usage: dockyard <path>"
    return 1
  fi

  mkdir -p "$(dirname "$DOCKYARD_COMPOSE_PATH")"

  compose "$target" || return 1

  docker compose -f "$DOCKYARD_COMPOSE_PATH" build --parallel
  docker compose -f "$DOCKYARD_COMPOSE_PATH" up
}
