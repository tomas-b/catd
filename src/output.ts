import { readdirSync, readFileSync, statSync, existsSync } from "fs";
import { join, relative } from "path";
import { Stats } from "./stats";
import { COLORS } from "./constants";
import {
  shouldIgnorePath,
  isPlainText,
  isCsvOrTsv,
  matchesPattern,
  sliceTabularContent,
} from "./files";
import {
  hasGitChanges,
  getGitStatusIndicator,
  directoryHasGitChanges,
} from "./git";
import type { ProcessOptions } from "./types";

// Standard pipe-friendly output
export function printFilesInDirectory(
  dirPath: string,
  options: ProcessOptions,
  stats: Stats,
  patternFilter?: string,
): void {
  try {
    // If this is a direct file path and not a directory
    if (existsSync(dirPath) && !statSync(dirPath).isDirectory()) {
      if (
        isPlainText(dirPath) &&
        hasGitChanges(dirPath, options.showOnlyGitChanges)
      ) {
        const relativePath = relative(process.cwd(), dirPath);
        let fileContent = readFileSync(dirPath, "utf-8");

        console.log(`./${relativePath}`);

        // Handle CSV/TSV files differently
        if (isCsvOrTsv(dirPath) && !options.showFullContent) {
          // Check if we're in a terminal that supports colors
          if (process.stdout.isTTY) {
            console.log(`${COLORS.yellow}[ SLICED ]${COLORS.reset}`);
          } else {
            console.log(`[ SLICED ]`);
          }
          fileContent = sliceTabularContent(fileContent, options.sliceRows);
        }

        console.log("```");
        console.log(fileContent);
        console.log("```");
        stats.addFile(fileContent);
      }
      return;
    }

    // Process directory
    const files = readdirSync(dirPath);
    for (const file of files) {
      const filePath = join(dirPath, file);
      const statsInfo = statSync(filePath);

      if (shouldIgnorePath(filePath, statsInfo, options.ignorePatterns)) {
        continue;
      }

      if (statsInfo.isDirectory()) {
        printFilesInDirectory(filePath, options, stats, patternFilter);
      } else if (
        isPlainText(filePath) &&
        (!patternFilter || matchesPattern(file, patternFilter)) &&
        hasGitChanges(filePath, options.showOnlyGitChanges)
      ) {
        const relativePath = relative(process.cwd(), filePath);
        let fileContent = readFileSync(filePath, "utf-8");

        console.log(`./${relativePath}`);

        // Handle CSV/TSV files differently
        if (isCsvOrTsv(filePath) && !options.showFullContent) {
          // Check if we're in a terminal that supports colors
          if (process.stdout.isTTY) {
            console.log(`${COLORS.yellow}[ SLICED ]${COLORS.reset}`);
          } else {
            console.log(`[ SLICED ]`);
          }
          fileContent = sliceTabularContent(fileContent, options.sliceRows);
        }

        console.log("```");
        console.log(fileContent);
        console.log("```");
        stats.addFile(fileContent);
      }
    }
  } catch (err) {
    console.error(`Error reading path ${dirPath}:`, err);
  }
}

// Tree-based terminal output with optional pattern filtering
export function generateFileTree(
  dirPath: string,
  options: ProcessOptions,
  prefix = "",
  patternFilter?: string,
): string {
  let output = "";

  try {
    // If this is a direct file path and not a directory
    if (existsSync(dirPath) && !statSync(dirPath).isDirectory()) {
      const file = dirPath.split("/").pop() || "";
      // If no pattern filter or file matches the pattern
      if (
        (!patternFilter || matchesPattern(file, patternFilter)) &&
        hasGitChanges(dirPath, options.showOnlyGitChanges)
      ) {
        const statsInfo = statSync(dirPath);

        // Print file name with color
        output += `${prefix}└── ${COLORS.file}${file}${COLORS.reset}`;
        output += getGitStatusIndicator(dirPath, options.showOnlyGitChanges);
        output += "\n";

        // Show file size
        const fileSize = statsInfo.size;
        const sizeStr =
          fileSize < 1024
            ? `${fileSize} bytes`
            : `${(fileSize / 1024).toFixed(1)} KB`;

        // Indicate if it's a CSV/TSV file that would be sliced in content view
        if (isCsvOrTsv(dirPath) && !options.showFullContent) {
          output += `${prefix}    ${COLORS.gray}${sizeStr} ${COLORS.yellow}[ SLICED in content view ]${COLORS.reset}\n`;
        } else {
          output += `${prefix}    ${COLORS.gray}${sizeStr}${COLORS.reset}\n`;
        }
      }
      return output;
    }

    // Process directory
    const files = readdirSync(dirPath);

    // Sort so directories come first, then files
    const sorted = files.sort((a, b) => {
      const aPath = join(dirPath, a);
      const bPath = join(dirPath, b);
      const aIsDir = statSync(aPath).isDirectory();
      const bIsDir = statSync(bPath).isDirectory();

      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;
      return a.localeCompare(b);
    });

    // If we have a pattern filter, only show matching files at this level
    const filteredSorted = patternFilter
      ? sorted.filter((file) => {
          const filePath = join(dirPath, file);
          const statsInfo = statSync(filePath);
          return statsInfo.isDirectory() || matchesPattern(file, patternFilter);
        })
      : sorted;

    filteredSorted.forEach((file, index) => {
      const filePath = join(dirPath, file);
      const statsInfo = statSync(filePath);

      if (shouldIgnorePath(filePath, statsInfo, options.ignorePatterns)) {
        return;
      }

      const isLast = index === filteredSorted.length - 1;

      // Determine branch characters for the tree
      const branch = isLast ? "└── " : "├── ";
      const newPrefix = prefix + (isLast ? "    " : "│   ");

      if (statsInfo.isDirectory()) {
        // Only show directory if it has relevant content
        if (directoryHasGitChanges(filePath, options.showOnlyGitChanges)) {
          // Print directory with color
          output += `${prefix}${branch}${COLORS.bright}${COLORS.folder}${file}/${COLORS.reset}\n`;
          output += generateFileTree(
            filePath,
            options,
            newPrefix,
            patternFilter,
          );
        }
      } else if (
        isPlainText(filePath) &&
        (!patternFilter || matchesPattern(file, patternFilter)) &&
        hasGitChanges(filePath, options.showOnlyGitChanges)
      ) {
        // Print file name with color
        output += `${prefix}${branch}${COLORS.file}${file}${COLORS.reset}`;
        output += getGitStatusIndicator(filePath, options.showOnlyGitChanges);
        output += "\n";

        // Show file size info
        const fileSize = statsInfo.size;
        const sizeStr =
          fileSize < 1024
            ? `${fileSize} bytes`
            : `${(fileSize / 1024).toFixed(1)} KB`;

        // Indicate if it's a CSV/TSV file that would be sliced in content view
        if (isCsvOrTsv(filePath) && !options.showFullContent) {
          output += `${newPrefix}${COLORS.gray}${sizeStr} ${COLORS.yellow}[ SLICED in content view ]${COLORS.reset}\n`;
        } else {
          output += `${newPrefix}${COLORS.gray}${sizeStr}${COLORS.reset}\n`;
        }
      }
    });
  } catch (err) {
    console.error(`Error reading path ${dirPath}:`, err);
  }

  return output;
}

// Process arguments that could be patterns or directories
export function processArgument(
  arg: string,
  options: ProcessOptions,
  stats: Stats,
): void {
  // Check if the argument contains glob pattern characters
  const hasPattern = arg.includes("*") || arg.includes("?");

  if (hasPattern) {
    // Split the path to separate the directory and pattern
    const lastSlashIndex = arg.lastIndexOf("/");
    let dirPath = ".";
    let pattern = arg;

    if (lastSlashIndex !== -1) {
      dirPath = arg.substring(0, lastSlashIndex) || ".";
      pattern = arg.substring(lastSlashIndex + 1);
    }

    // Choose output style based on detection and flags
    if (options.useTreeMode) {
      if (!existsSync(dirPath)) {
        console.error(`Directory not found: ${dirPath}`);
        return;
      }

      console.log(
        `${COLORS.bright}File Tree (pattern: ${pattern}):${COLORS.reset}`,
      );
      const treeOutput = generateFileTree(dirPath, options, "", pattern);
      console.log(treeOutput);
      stats.addTreeOutput(treeOutput);
    } else {
      printFilesInDirectory(dirPath, options, stats, pattern);
    }
  } else {
    // Regular file or directory path
    if (!existsSync(arg)) {
      console.error(`Path not found: ${arg}`);
      return;
    }

    // Choose output style based on detection and flags
    if (options.useTreeMode) {
      console.log(`${COLORS.bright}File Tree:${COLORS.reset}`);
      const treeOutput = generateFileTree(arg, options);
      console.log(treeOutput);
      stats.addTreeOutput(treeOutput);
    } else {
      printFilesInDirectory(arg, options, stats);
    }
  }
}
