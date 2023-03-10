import { getEnv, needEnv } from "./env.ts";
import { join, resolve } from "https://deno.land/std@0.170.0/path/mod.ts";
import { exists } from "./exists.ts";

const { os } = Deno.build;

export let backupPaths: string[] = [];

function tryEnv(key: string) {
  const value = getEnv(key);
  if (value) add(value);
}

function add(path: string) {
  backupPaths.push(path);
}

async function tryPath(path: string, file?: string) {
  const tryPath = file ? join(path, file) : path;
  if (await exists(tryPath)) add(path);
}

tryEnv("MINECRAFT_DIR");
tryEnv("MULTIMC_DIR");
tryEnv("PRISM_DIR");

await tryPath(resolve("."), "instances");
await tryPath(resolve("."), "libraries");
await tryPath(resolve("."), "saves");

// In case the repo is cloned to the launcher folder
await tryPath(resolve(".."), "instances");
await tryPath(resolve(".."), "libraries");
await tryPath(resolve(".."), "saves");

if (os == "windows") {
  const appData = needEnv("APPDATA");

  await tryPath(join(appData, ".minecraft"));
  await tryPath(join(appData, "PrismLauncher"));
}

// TODO: Mac and Linux support

backupPaths = backupPaths.map((v) => resolve(v));
backupPaths = [...new Set(backupPaths)];

if (import.meta.main) {
  console.log(backupPaths);
  alert();
}
