import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "src", "data", "repositories.json");
const fallbackPath = path.join(root, "src", "data", "github-fallback.json");
const cacheDir = path.join(root, ".cache");
const outputPath = path.join(cacheDir, "github-repositories.json");

/** @type {{ owner: string; repositories: string[] }} */
const config = JSON.parse(await readFile(configPath, "utf8"));
/** @type {{ generatedAt: string | null; source: string; repositories: Record<string, unknown> }} */
const fallback = JSON.parse(await readFile(fallbackPath, "utf8"));
const offline = process.env.GITHUB_OFFLINE === "1";

await mkdir(cacheDir, { recursive: true });

if (offline || config.repositories.length === 0) {
  await writeFile(outputPath, `${JSON.stringify({ ...fallback, source: "fallback" }, null, 2)}\n`, "utf8");
  console.log(
    offline
      ? "GitHub sync: offline mode, using the tracked fallback snapshot."
      : "GitHub sync: no curated repositories configured, using the fallback snapshot."
  );
  process.exit(0);
}

/** @type {Record<string, string>} */
const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "Uronika-Personal-Site"
};

if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

/** @type {Record<string, unknown>} */
const repositories = {};
let usedFallback = false;

for (const repositoryName of config.repositories) {
  try {
    const response = await fetch(`https://api.github.com/repos/${config.owner}/${repositoryName}`, { headers });
    if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
    const repository = await response.json();
    repositories[repositoryName] = {
      name: repository.name,
      description: repository.description,
      language: repository.language,
      stars: repository.stargazers_count,
      forks: repository.forks_count,
      updatedAt: repository.updated_at,
      url: repository.html_url
    };
  } catch {
    const cached = fallback.repositories?.[repositoryName];
    if (cached) {
      repositories[repositoryName] = cached;
      usedFallback = true;
      console.warn(`GitHub sync: ${repositoryName} failed; fallback metadata was used.`);
    } else {
      console.warn(`GitHub sync: ${repositoryName} failed and has no fallback metadata.`);
    }
  }
}

const snapshot = {
  generatedAt: new Date().toISOString(),
  source: usedFallback ? "fallback" : "github",
  repositories
};

await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
console.log(`GitHub sync: prepared ${Object.keys(repositories).length} curated repository record(s).`);
