import { DOMAIN_SUFFIX } from "./constants.ts";

export function stripDotSlash(path: string): string {
  return path.replace(/^\.\//, "");
}

export function pathToUrl(path: string): string {
  const parts = path.split("/");
  const serviceName = parts[parts.length - 1];
  return `${serviceName}.${DOMAIN_SUFFIX}`;
}

export function safeServiceName(path: string): string {
  const parts = path.split("/").filter((part) => part.length > 0);
  const relevantParts = parts.slice(-2);
  return relevantParts.join("_").toLowerCase();
}

export function isHidden(name: string): boolean {
  return name.startsWith(".");
}

export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await Deno.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if ((error as Error).name !== "AlreadyExists") {
      throw error;
    }
  }
}
