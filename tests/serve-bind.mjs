import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const tempDir = mkdtempSync(join(tmpdir(), "zmr-serve-test-"));
const fakePython = join(tempDir, "python3");
writeFileSync(fakePython, "#!/usr/bin/env node\nprocess.stdout.write(JSON.stringify(process.argv.slice(2)));\n");
chmodSync(fakePython, 0o755);

function runServe(args) {
  const output = execFileSync("bash", ["scripts/serve.sh", ...args], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, PATH: `${tempDir}:${process.env.PATH}` },
  });
  return {
    output,
    serverArgs: JSON.parse(output.trim().split(/\r?\n/).at(-1)),
  };
}

try {
  const local = runServe([]);
  assert.deepEqual(local.serverArgs, ["-m", "http.server", "8000", "--bind", "127.0.0.1"]);
  assert.match(local.output, /http:\/\/127\.0\.0\.1:8000\//);
  assert.doesNotMatch(local.output, /WARNING/);

  const lan = runServe(["--lan", "8123"]);
  assert.deepEqual(lan.serverArgs, ["-m", "http.server", "8123", "--bind", "0.0.0.0"]);
  assert.match(lan.output, /trusted, firewalled LAN/);
  assert.match(lan.output, /without authentication/);
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}

console.log("ok    development server bind modes");
