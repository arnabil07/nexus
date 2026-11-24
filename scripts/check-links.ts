/**
 * Checks every external link in the content (resources, project repos, feeds).
 * Run with:  npm run check:links
 *
 * Results:
 *   OK       – the link responded successfully
 *   BLOCKED  – the site refused an automated request (401/403/429); check it in a browser
 *   BROKEN   – 404/410, other errors, or no response: fix or remove the link
 */
import { feedSources } from "../config/feeds";
import { projects } from "../data/projects";
import { resources } from "../data/resources";

interface Target {
  label: string;
  url: string;
}

const targets: Target[] = [
  ...resources.map((r) => ({ label: `resource:${r.id}`, url: r.url })),
  ...projects.filter((p) => p.githubUrl).map((p) => ({ label: `project:${p.slug}`, url: p.githubUrl! })),
  ...feedSources.map((f) => ({ label: `feed:${f.id}`, url: f.url })),
];

const HEADERS = { "User-Agent": "Mozilla/5.0 (NEXUS link checker)", Accept: "*/*" };

async function check(target: Target): Promise<{ target: Target; status: "OK" | "BLOCKED" | "BROKEN"; detail: string }> {
  for (const method of ["HEAD", "GET"] as const) {
    try {
      const res = await fetch(target.url, { method, headers: HEADERS, redirect: "follow", signal: AbortSignal.timeout(15000) });
      if (res.ok) return { target, status: "OK", detail: String(res.status) };
      if (method === "HEAD" && [403, 405, 400, 501].includes(res.status)) continue; // some servers reject HEAD
      if ([401, 403, 429].includes(res.status)) return { target, status: "BLOCKED", detail: String(res.status) };
      return { target, status: "BROKEN", detail: String(res.status) };
    } catch (error) {
      if (method === "HEAD") continue;
      return { target, status: "BROKEN", detail: error instanceof Error ? error.message : "request failed" };
    }
  }
  return { target, status: "BROKEN", detail: "no response" };
}

async function main() {
  console.log(`Checking ${targets.length} links…\n`);
  const results: Awaited<ReturnType<typeof check>>[] = [];
  const queue = [...targets];
  const workers = Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const next = queue.shift();
      if (next) results.push(await check(next));
    }
  });
  await Promise.all(workers);

  const problems = results.filter((r) => r.status !== "OK");
  for (const r of problems.sort((a, b) => a.status.localeCompare(b.status))) {
    console.log(`${r.status.padEnd(8)} ${r.detail.padEnd(6)} ${r.target.label}  ${r.target.url}`);
  }
  const broken = problems.filter((r) => r.status === "BROKEN").length;
  console.log(`\n${results.length - problems.length} OK · ${problems.length - broken} blocked · ${broken} broken`);
  process.exit(broken > 0 ? 1 : 0);
}

void main();
