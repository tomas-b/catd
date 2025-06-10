export class Stats {
  fileCount = 0;
  totalChars = 0;
  treeOutput = "";
  treeChars = 0;

  addFile(content: string): void {
    this.fileCount++;
    this.totalChars += content.length;
  }

  addTreeOutput(output: string): void {
    this.treeOutput = output;
    this.treeChars = output.length;
  }

  getTotalChars(): number {
    return this.totalChars + this.treeChars;
  }

  reset(): void {
    this.fileCount = 0;
    this.totalChars = 0;
    this.treeOutput = "";
    this.treeChars = 0;
  }
}

export function estimateTokens(text: string | number): number {
  const chars = typeof text === "string" ? text.length : text;
  // Rough estimate: 1 token ≈ 4 characters for English text
  return Math.ceil(chars / 4);
}

export function formatTokenCount(tokens: number): string {
  if (tokens < 1000) {
    return `${tokens} tokens`;
  } else if (tokens < 1000000) {
    return `${(tokens / 1000).toFixed(1)}K tokens`;
  } else {
    return `${(tokens / 1000000).toFixed(1)}M tokens`;
  }
}

export function printCopyStats(stats: Stats): void {
  if (process.stdout.isTTY) return;

  const tokens = estimateTokens(stats.getTotalChars());
  const tokenStr = formatTokenCount(tokens);
  process.stderr.write(`[copied] ${stats.fileCount} files, ${tokenStr}\n`);
}

// Silent version that just counts tokens without any output
export function countTokensForPath(path: string, options: any): number {
  const stats = new Stats();

  try {
    // Import these dynamically to avoid circular dependencies
    const fs = require("fs");
    const pathModule = require("path");
    const {
      shouldIgnorePath,
      isPlainText,
      isCsvOrTsv,
      sliceTabularContent,
    } = require("./files");
    const { hasGitChanges } = require("./git");

    if (!fs.existsSync(path)) {
      return 0;
    }

    const pathStats = fs.statSync(path);

    if (shouldIgnorePath(path, pathStats, options.ignorePatterns)) {
      return 0;
    }

    if (pathStats.isDirectory()) {
      const files = fs.readdirSync(path);
      for (const file of files) {
        const filePath = pathModule.join(path, file);
        const fileStats = fs.statSync(filePath);

        if (shouldIgnorePath(filePath, fileStats, options.ignorePatterns)) {
          continue;
        }

        if (fileStats.isDirectory()) {
          const subTokens = countTokensForPath(filePath, options);
          stats.totalChars += subTokens * 4; // Reverse estimate conversion
        } else if (
          isPlainText(filePath) &&
          hasGitChanges(filePath, options.showOnlyGitChanges)
        ) {
          let fileContent = fs.readFileSync(filePath, "utf-8");

          if (isCsvOrTsv(filePath) && !options.showFullContent) {
            fileContent = sliceTabularContent(fileContent, options.sliceRows);
          }

          stats.addFile(fileContent);
        }
      }
    } else if (
      isPlainText(path) &&
      hasGitChanges(path, options.showOnlyGitChanges)
    ) {
      let fileContent = fs.readFileSync(path, "utf-8");

      if (isCsvOrTsv(path) && !options.showFullContent) {
        fileContent = sliceTabularContent(fileContent, options.sliceRows);
      }

      stats.addFile(fileContent);
    }
  } catch (err) {
    // Silently ignore errors
  }

  return estimateTokens(stats.getTotalChars());
}
