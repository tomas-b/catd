#!/usr/bin/env bun
import { parseArguments, showHelp, showVersion } from "./cli";
import {
  loadConfig,
  getTagConfig,
  listTags,
  isTagInScope,
  resolveTagPaths,
} from "./config";
import {
  Stats,
  printCopyStats,
  estimateTokens,
  formatTokenCount,
  countTokensForPath,
} from "./stats";
import { processArgument } from "./output";
import { DEFAULT_SLICE_ROWS, COLORS } from "./constants";
import type { ProcessOptions } from "./types";

// Get color for token count based on percentage of total tokens
function getTokenCountColor(percentage: number): string {
  if (!process.stdout.isTTY) return ""; // No color if output is piped

  if (percentage >= 70) return COLORS.red;
  if (percentage >= 40) return COLORS.orange;
  if (percentage >= 15) return COLORS.yellow;
  return COLORS.green;
}

async function main() {
  const argv = parseArguments();
  const stats = new Stats();

  // Handle help and version
  if (argv.help) {
    showHelp();
    process.exit(0);
  }

  if (argv.version) {
    showVersion();
    process.exit(0);
  }

  // Load configuration
  const config = loadConfig();

  // Handle list-tags-autocomplete (simple output for shell completion)
  if (argv["list-tags-autocomplete"]) {
    const tags = listTags(config);
    tags.forEach((tag) => console.log(tag));
    process.exit(0);
  }

  // Handle list-tags (detailed output with token counts)
  if (argv["list-tags"]) {
    const tags = listTags(config);
    if (tags.length === 0) {
      console.log("No tags found in configuration.");
      console.log(
        "Create ~/.catd.yml or .catd.yml in your project with tag definitions.",
      );
    } else {
      console.log("Available tags:");
      for (const tagName of tags) {
        const tagConfig = getTagConfig(config!, tagName);
        if (tagConfig) {
          const tempOptions = {
            ignorePatterns: [
              ...(config?.defaults?.ignore || []),
              ...(tagConfig.ignore || []),
            ],
            useTreeMode: false,
            showFullContent: false,
            showOnlyGitChanges: false,
            sliceRows: config?.defaults?.slice_rows || DEFAULT_SLICE_ROWS,
          };

          const resolvedPaths = resolveTagPaths(tagConfig);
          const pathTokens: Array<{ path: string; tokens: number }> = [];
          let totalTokens = 0;

          // Count tokens for each path individually
          for (const path of resolvedPaths) {
            const tokens = countTokensForPath(path, tempOptions);
            pathTokens.push({ path, tokens });
            totalTokens += tokens;
          }

          console.log(`  ${tagName} [${formatTokenCount(totalTokens)} total]`);

          // Show individual path token counts with color coding
          for (const { path, tokens } of pathTokens) {
            if (tokens > 0) {
              // Make path relative to current directory for cleaner display
              const relativePath = path.startsWith(process.cwd())
                ? path.substring(process.cwd().length + 1)
                : path;

              // Calculate percentage and get color
              const percentage =
                totalTokens > 0 ? (tokens / totalTokens) * 100 : 0;
              const color = getTokenCountColor(percentage);
              const reset = process.stdout.isTTY ? COLORS.reset : "";

              console.log(
                `    ${relativePath} [${color}${formatTokenCount(tokens)}${reset}] (${percentage.toFixed(1)}%)`,
              );
            }
          }

          console.log(); // Empty line between tags
        }
      }
    }
    process.exit(0);
  }

  // Convert ignore option to array
  const ignorePatterns = Array.isArray(argv.ignore)
    ? argv.ignore
    : argv.ignore
      ? [argv.ignore]
      : [];

  // Add default ignores from config
  if (config?.defaults?.ignore) {
    ignorePatterns.push(...config.defaults.ignore);
  }

  // Check if output is to a terminal or being piped
  const isOutputPiped = !process.stdout.isTTY;
  // Force tree mode if requested, otherwise use terminal detection
  const useTreeMode = argv.tree || !isOutputPiped;

  // Get slice rows from config or use default
  const sliceRows = config?.defaults?.slice_rows || DEFAULT_SLICE_ROWS;

  // Build process options
  const options: ProcessOptions = {
    ignorePatterns,
    useTreeMode,
    showFullContent: argv.full || false,
    showOnlyGitChanges: argv["git-changes"] || false,
    sliceRows,
  };

  // Handle tag processing
  if (argv.tag) {
    if (!config) {
      console.error(
        "No configuration file found. Create ~/.catd.yml or .catd.yml to define tags.",
      );
      process.exit(1);
    }

    const tagConfig = getTagConfig(config, argv.tag);
    if (!tagConfig) {
      console.error(`Tag '${argv.tag}' not found in configuration.`);
      console.error("Available tags:", listTags(config).join(", "));
      process.exit(1);
    }

    // Add tag-specific ignore patterns
    if (tagConfig.ignore) {
      options.ignorePatterns.push(...tagConfig.ignore);
    }

    // Process tag paths (resolved relative to tag's base directory)
    const resolvedPaths = resolveTagPaths(tagConfig);
    for (const path of resolvedPaths) {
      processArgument(path, options, stats);
    }
  } else {
    // Get all non-flag arguments (these could be folders or patterns)
    const args = argv._.length ? argv._ : ["."];

    // Process each argument
    for (const arg of args) {
      processArgument(arg, options, stats);
    }
  }

  // Print copy stats if output is piped (for AI context awareness)
  printCopyStats(stats);
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
