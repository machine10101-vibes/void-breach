#!/usr/bin/env node
/**
 * Build Void Breach for GitHub Pages and push to the gh-pages branch.
 * Live URL: https://machine10101-vibes.github.io/void-breach/
 */
import { spawn } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const BASE = "/void-breach/";
const DIST = "/tmp/void-breach-pages";
const WORKTREE = "/tmp/void-gh-pages";
const PREVIEW = "http://127.0.0.1:8081";

function run(cmd, args, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: ROOT,
      stdio: "inherit",
      env: { ...process.env, ...env },
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(" ")} exited ${code}`));
    });
  });
}

function sh(cmd) {
  return run("bash", ["-lc", cmd]);
}

async function waitFor(url, tries = 40) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      if (res.status >= 200 && res.status < 500) return res;
    } catch {
      /* still booting */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Preview never answered ${url}`);
}

async function fetchHtml(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return await res.text();
}

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

await run("npm", ["run", "build"], { VITE_BASE: BASE });
await run("npm", ["run", "preview:restart"]);

const html =
  (await waitFor(`${PREVIEW}${BASE}`).then((r) => (r.status === 200 ? fetchHtml(`${PREVIEW}${BASE}`) : null))) ||
  (await fetchHtml(`${PREVIEW}/`));

if (!html.includes("<html")) throw new Error("Prerender did not return HTML");

const staticDir = join(ROOT, ".vercel/output/static");
if (!existsSync(staticDir)) throw new Error("Missing .vercel/output/static");
cpSync(staticDir, DIST, { recursive: true });

writeFileSync(join(DIST, "index.html"), html);
writeFileSync(join(DIST, "404.html"), html);
writeFileSync(join(DIST, ".nojekyll"), "");

const sha = await new Promise((resolve, reject) => {
  const child = spawn("git", ["rev-parse", "HEAD"], { cwd: ROOT });
  let out = "";
  child.stdout.on("data", (d) => (out += d));
  child.on("exit", (code) => (code === 0 ? resolve(out.trim()) : reject(new Error("rev-parse failed"))));
});

await sh(`git worktree remove --force ${WORKTREE} 2>/dev/null || true`);
await sh(`git fetch origin gh-pages`);
await sh(`git worktree add -B gh-pages ${WORKTREE} origin/gh-pages`);
await sh(`find ${WORKTREE} -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +`);
await sh(`cp -a ${DIST}/. ${WORKTREE}/`);
await sh(`git -C ${WORKTREE} add -A`);
await sh(
  `git -C ${WORKTREE} diff --cached --quiet && echo 'gh-pages already up to date' || git -C ${WORKTREE} commit -m "deploy: ${sha} landscape HUD + settings"`,
);
await sh(`git -C ${WORKTREE} push origin gh-pages`);
await sh(`git worktree remove --force ${WORKTREE}`);

console.log("Published https://machine10101-vibes.github.io/void-breach/");
