import {
  isHidden,
  pathToUrl,
  safeServiceName,
  stripDotSlash,
} from "./utils.ts";
import { Service } from "./types.ts";
import { BASE_PORT, DOCKERFILE_NAME } from "./constants.ts";

function isDockerfile(entry: Deno.DirEntry): boolean {
  return entry.isFile && entry.name === DOCKERFILE_NAME;
}

function isDir(entry: Deno.DirEntry): boolean {
  return entry.isDirectory;
}

function buildService(dir: string, index: number): Service {
  const folderPath = stripDotSlash(dir);
  return {
    url: pathToUrl(folderPath),
    path: folderPath,
    host: safeServiceName(folderPath),
    port: BASE_PORT + index,
    name: safeServiceName(folderPath),
  };
}

function shouldProcessEntry(entry: Deno.DirEntry): boolean {
  return !isHidden(entry.name);
}

function processDirectoryEntry(
  entry: Deno.DirEntry,
  currentDir: string,
  queue: string[],
): void {
  const fullPath = `${currentDir}/${entry.name}`;
  queue.push(fullPath);
}

function processFileEntry(
  entry: Deno.DirEntry,
  currentDir: string,
  results: Service[],
  indexRef: { i: number },
): void {
  if (isDockerfile(entry)) {
    results.push(buildService(currentDir, indexRef.i++));
  }
}

function processEntry(
  entry: Deno.DirEntry,
  currentDir: string,
  queue: string[],
  results: Service[],
  indexRef: { i: number },
): void {
  if (!shouldProcessEntry(entry)) {
    return;
  }

  if (isDir(entry)) {
    processDirectoryEntry(entry, currentDir, queue);
  } else {
    processFileEntry(entry, currentDir, results, indexRef);
  }
}

function processDirectory(
  currentDir: string,
  queue: string[],
  results: Service[],
  indexRef: { i: number },
): void {
  const entries = Array.from(Deno.readDirSync(currentDir));

  for (const entry of entries) {
    processEntry(entry, currentDir, queue, results, indexRef);
  }
}

function findDockerfiles(
  rootDir: string,
  indexRef: { i: number },
): Service[] {
  const results: Service[] = [];
  const queue: string[] = [rootDir];

  while (queue.length > 0) {
    const currentDir = queue.shift()!;
    processDirectory(currentDir, queue, results, indexRef);
  }

  return results;
}

export function discoverServices(rootDir: string): Service[] {
  const indexRef = { i: 0 };
  return findDockerfiles(rootDir, indexRef);
}
