import { dirname } from "std/path/dirname.ts";
import { DOMAIN_SUFFIX, IS_LOCAL } from "./constants.ts";

export function stripDotSlash(path: string): string {
  return path.replace(/^\.\//, "");
}

export function pathToUrl(path: string): string {
  const parts = path.split("/");
  const serviceName = parts[parts.length - 1];
  const domain = `${serviceName}.${DOMAIN_SUFFIX}`;
  return IS_LOCAL ? `http://${domain}` : domain;
}

export function safeServiceName(path: string): string {
  const parts = path.split("/").filter((part) => part.length > 0);
  const relevantParts = parts.slice(-2);
  return relevantParts.join("_").toLowerCase();
}

export function isHidden(name: string): boolean {
  return name.startsWith(".");
}

function parseContent<T>(content: string, defaultValue: T): T {
  if (!content.trim()) return defaultValue;

  switch (typeof defaultValue) {
    case "number":
      return Number(content) as T;
    case "string":
    case "object":
      return JSON.parse(content) as T;
    default:
      return defaultValue;
  }
}

export async function readFileData<T>(
  filepath: string,
  defaultValue: T,
): Promise<T> {
  try {
    const content = await Deno.readTextFile(filepath);
    return parseContent(content, defaultValue);
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      await writeFileData(filepath, defaultValue);
      return defaultValue;
    }
    throw err;
  }
}

export async function writeFileData<T>(
  filepath: string,
  data: T,
): Promise<void> {
  const serialized = typeof data === "number" || typeof data === "string"
    ? String(data)
    : JSON.stringify(data, null, 2);

  await Deno.mkdir(dirname(filepath), { recursive: true });
  await Deno.writeTextFile(filepath, serialized, { create: true });
}
