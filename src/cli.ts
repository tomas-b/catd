import minimist from "minimist";
import type { ParsedArguments } from "./types";

export function parseArguments(): ParsedArguments {
  return minimist(process.argv.slice(2), {
    string: ["ignore", "tag"],
    boolean: ["tree", "full", "git-changes", "list-tags", "list-tags-autocomplete", "help", "version"],
    alias: {
      i: "ignore",
      t: "tag",
      f: "full",
      g: "git-changes",
      h: "help",
      v: "version",
    },
  }) as ParsedArguments;
}

export function showHelp(): void {
  console.log("Usage: catd [folder|pattern] [options]");
  console.log("");
  console.log(
    "Cat for directories. Shows file contents in a format good for sharing with AI.",
  );
  console.log("");
  console.log("Examples:");
  console.log(
    "  catd                        # Show all files in current directory",
  );
  console.log(
    "  catd src                    # Show all files in src directory",
  );
  console.log(
    "  catd *.sql                  # Show all SQL files in current directory",
  );
  console.log(
    "  catd src/*.js               # Show all JS files in src directory",
  );
  console.log("  catd -t backend | pbcopy    # Copy tagged files to clipboard");
  console.log("  catd --git-changes          # Show only git-changed files");
  console.log("");
  console.log("Options:");
  console.log(
    "  -i, --ignore <pattern>      Specify path pattern to ignore (can be used multiple times)",
  );
  console.log(
    "  -t, --tag <name>            Use predefined tag from config file",
  );
  console.log("  -g, --git-changes           Show only files with git changes");
  console.log(
    "  -f, --full                  Show full content of CSV/TSV files (not sliced)",
  );
  console.log(
    "      --tree                  Force tree output mode even when piping",
  );
  console.log(
    "      --list-tags             List all available tags from config",
  );
  console.log(
    "      --list-tags-autocomplete Simple tag list for shell completion",
  );
  console.log("  -h, --help                  Show this help message");
  console.log("  -v, --version               Show version number");
  console.log("");
  console.log("Config:");
  console.log(
    "  Create ~/.catd.yml or .catd.yml in your project with predefined tags.",
  );
  console.log("  See examples/ directory for sample configurations.");
}

export function showVersion(): void {
  try {
    const pkg = require("../package.json");
    console.log(`catd v${pkg.version}`);
  } catch (err) {
    console.log("catd v1.0.0");
  }
}
