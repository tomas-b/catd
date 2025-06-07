import { readFileSync, readdirSync, statSync } from "fs";
import { extname, join } from "path";
import {
  IGNORED_FILES,
  IGNORED_DIRECTORIES,
  DEFAULT_SLICE_ROWS,
} from "./constants";

export function shouldIgnorePath(
  path: string,
  stats: ReturnType<typeof statSync>,
  ignorePatterns: string[],
): boolean {
  const baseName = path.split("/").pop() || "";

  // Check if it's a hidden file/directory
  if (baseName.startsWith(".")) {
    return true;
  }

  // Check if it's in the ignored files list
  if (IGNORED_FILES.includes(baseName)) {
    return true;
  }

  // Check if it's an ignored directory
  if (stats?.isDirectory() && IGNORED_DIRECTORIES.includes(baseName)) {
    return true;
  }

  // Check user-specified patterns to ignore
  for (const pattern of ignorePatterns) {
    // Normalize paths by removing leading ./
    const normalizedPath = path.replace(/^\.\//, "");
    const normalizedPattern = pattern.replace(/^\.\//, "");

    if (
      normalizedPath === normalizedPattern ||
      normalizedPath.startsWith(normalizedPattern + "/")
    ) {
      return true;
    }
  }

  return false;
}

export function isPlainText(filePath: string): boolean {
  try {
    const content = readFileSync(filePath, "utf-8");
    return !/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(content);
  } catch (err) {
    return false;
  }
}

// Function to identify if a file is CSV or TSV
export function isCsvOrTsv(filePath: string): boolean {
  const ext = extname(filePath).toLowerCase();
  return ext === ".csv" || ext === ".tsv";
}

// Function to match a filename against a glob pattern
export function matchesPattern(filename: string, pattern: string): boolean {
  // Basic glob pattern matching for * and ? characters
  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/\./g, "\\.") // Escape dots
    .replace(/\*/g, ".*") // * becomes .*
    .replace(/\?/g, "."); // ? becomes .

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(filename);
}

// Function to slice CSV/TSV content
export function sliceTabularContent(
  content: string,
  sliceRows: number = DEFAULT_SLICE_ROWS,
): string {
  const rows = content.split("\n").filter((row) => row.trim() !== "");

  // If the file is small enough, return the full content
  if (rows.length <= sliceRows * 2 + 1) {
    return content;
  }

  // Get header row (first row)
  const header = rows[0];

  // Get first N rows (excluding header)
  const firstRows = rows.slice(1, sliceRows + 1);

  // Get last N rows
  const lastRows = rows.slice(-sliceRows);

  // Combine with ellipsis in the middle
  return [header, ...firstRows, "...", ...lastRows].join("\n");
}

// Get all files matching a pattern in a directory
export function getFilesMatchingPattern(
  dirPath: string,
  pattern: string,
): string[] {
  try {
    const files = readdirSync(dirPath);
    return files
      .filter((file) => matchesPattern(file, pattern))
      .map((file) => join(dirPath, file));
  } catch (err) {
    console.error(`Error reading directory ${dirPath}:`, err);
    return [];
  }
}
