import { readFile } from "node:fs/promises";
import path from "node:path";

export type GithubRepositoryMetadata = {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  updatedAt: string;
  url: string;
};

type GithubSnapshot = {
  generatedAt: string | null;
  source: "github" | "fallback";
  repositories: Record<string, GithubRepositoryMetadata>;
};

async function readSnapshot(filePath: string): Promise<GithubSnapshot | null> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as GithubSnapshot;
  } catch {
    return null;
  }
}

export async function getGithubSnapshot(): Promise<GithubSnapshot> {
  const livePath = path.join(process.cwd(), ".cache", "github-repositories.json");
  const fallbackPath = path.join(process.cwd(), "src", "data", "github-fallback.json");

  return (
    (await readSnapshot(livePath)) ??
    (await readSnapshot(fallbackPath)) ?? {
      generatedAt: null,
      source: "fallback",
      repositories: {}
    }
  );
}

