import { execSync } from "child_process";
import { relative, dirname } from "path";
import { readdirSync, statSync } from "fs";
import { COLORS } from "./constants";

let gitChangedFiles: Set<string> | null = null;

export function getGitChangedFiles(): Set<string> {
  if (gitChangedFiles !== null) {
    return gitChangedFiles;
  }

  gitChangedFiles = new Set();

  try {
    // Get staged files
    const stagedFiles = execSync("git diff --cached --name-only", {
      encoding: "utf8",
    });
    stagedFiles
      .split("\n")
      .filter((f) => f.trim())
      .forEach((f) => gitChangedFiles!.add(f));

    // Get unstaged files
    const unstagedFiles = execSync("git diff --name-only", {
      encoding: "utf8",
    });
    unstagedFiles
      .split("\n")
      .filter((f) => f.trim())
      .forEach((f) => gitChangedFiles!.add(f));

    // Get untracked files
    const untrackedFiles = execSync(
      "git ls-files --others --exclude-standard",
      { encoding: "utf8" },
    );
    untrackedFiles
      .split("\n")
      .filter((f) => f.trim())
      .forEach((f) => gitChangedFiles!.add(f));
  } catch (err) {
    // Not in a git repository or git not available
    gitChangedFiles = new Set();
  }

  return gitChangedFiles;
}

export function hasGitChanges(
  filePath: string,
  showOnlyGitChanges: boolean,
): boolean {
  if (!showOnlyGitChanges) return true;

  const changedFiles = getGitChangedFiles();
  const relativePath = relative(process.cwd(), filePath);
  return changedFiles.has(relativePath);
}

export function getGitStatusIndicator(
  filePath: string,
  showOnlyGitChanges: boolean,
): string {
  if (!showOnlyGitChanges) return "";

  const changedFiles = getGitChangedFiles();
  const relativePath = relative(process.cwd(), filePath);

  if (changedFiles.has(relativePath)) {
    // Check if we're in a terminal that supports colors
    if (process.stdout.isTTY) {
      return ` ${COLORS.yellow}[GIT]${COLORS.reset}`;
    } else {
      return ` [GIT]`;
    }
  }

  return "";
}

export function directoryHasGitChanges(
  dirPath: string,
  showOnlyGitChanges: boolean,
): boolean {
  if (!showOnlyGitChanges) return true;

  const changedFiles = getGitChangedFiles();

  try {
    const files = readdirSync(dirPath);
    for (const file of files) {
      const filePath = `${dirPath}/${file}`;
      const stats = statSync(filePath);
      const relativePath = relative(process.cwd(), filePath);

      if (stats.isDirectory()) {
        if (directoryHasGitChanges(filePath, showOnlyGitChanges)) {
          return true;
        }
      } else if (changedFiles.has(relativePath)) {
        return true;
      }
    }
  } catch (err) {
    // Error reading directory
    return false;
  }

  return false;
}
