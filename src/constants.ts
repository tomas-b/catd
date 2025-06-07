// Array of files and patterns to ignore
export const IGNORED_FILES = [
  "uv.lock",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
];

export const IGNORED_DIRECTORIES = [
  "node_modules",
  "venv",
  "env",
  "dist",
  "build",
  "__pycache__",
];

// ANSI color codes for terminal output
export const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  folder: "\x1b[34m",
  file: "\x1b[36m",
  gray: "\x1b[90m",
  yellow: "\x1b[33m",
  orange: "\x1b[91m", // bright red for orange effect
  green: "\x1b[32m",
  red: "\x1b[31m",
};

// Default slice settings for CSV/TSV files
export const DEFAULT_SLICE_ROWS = 5;

// Configuration file paths
export const CONFIG_PATHS = [
  "~/.catd.yml",
  "~/.catd.yaml",
  "~/.catd.json",
  ".catd.yml",
  ".catd.yaml",
  ".catd.json",
];
