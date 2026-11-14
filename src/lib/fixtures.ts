// Owner: P1. Loads demo fixtures and the captured Flashpoint run (server-side only).
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ZodType } from "zod";

const FIXTURE_DIR = path.join(process.cwd(), "fixtures");

export const isDemoMode = () => process.env.DEMO_MODE === "fixtures";

export async function loadFixture<T>(name: string, schema: ZodType<T>): Promise<T> {
  const raw = await readFile(path.join(FIXTURE_DIR, name), "utf8");
  return schema.parse(JSON.parse(raw));
}

export async function loadOptionalFixture<T>(name: string, schema: ZodType<T>): Promise<T | null> {
  try {
    return await loadFixture(name, schema);
  } catch {
    return null;
  }
}
