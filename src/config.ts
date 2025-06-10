import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { homedir } from "os";
import { join, resolve, relative, extname, basename } from "path";
import * as yaml from "js-yaml";
import type { Config, TagConfig } from "./types";

export function loadConfig(): Config | null {
  // First, try to load from directory-based configuration
  const catdDir = join(homedir(), ".catd");
  if (existsSync(catdDir) && statSync(catdDir).isDirectory()) {
    return loadConfigFromDirectory(catdDir);
  }

  // Fall back to the legacy single-file configuration
  return loadLegacyConfig();
}

function loadConfigFromDirectory(catdDir: string): Config | null {
  const config: Config = { tags: {} };

  try {
    const files = readdirSync(catdDir);

    for (const file of files) {
      const filePath = join(catdDir, file);

      // Skip directories and non-YAML files
      if (!statSync(filePath).isFile()) {
        continue;
      }

      const ext = extname(file).toLowerCase();
      if (ext !== ".yml" && ext !== ".yaml") {
        continue;
      }

      const fileBaseName = basename(file, ext);

      // Handle special defaults/config file
      if (fileBaseName === "_defaults" || fileBaseName === "config") {
        try {
          const content = readFileSync(filePath, "utf-8");
          const defaults = yaml.load(content) as any;
          if (defaults && typeof defaults === "object") {
            config.defaults = defaults.defaults || defaults;
          }
        } catch (err) {
          console.error(
            `Warning: Could not load defaults from ${file}:`,
            err instanceof Error ? err.message : String(err),
          );
        }
        continue;
      }

      // Load regular tag file
      try {
        const content = readFileSync(filePath, "utf-8");
        const tagConfig = yaml.load(content) as TagConfig;

        if (tagConfig && typeof tagConfig === "object" && tagConfig.paths) {
          config.tags[fileBaseName] = tagConfig;
        } else {
          console.error(
            `Warning: Invalid tag configuration in ${file}: missing 'paths' field`,
          );
        }
      } catch (err) {
        console.error(
          `Warning: Could not load tag from ${file}:`,
          err instanceof Error ? err.message : String(err),
        );
      }
    }

    return config;
  } catch (err) {
    console.error(
      `Error reading directory ${catdDir}:`,
      err instanceof Error ? err.message : String(err),
    );
    return null;
  }
}

function loadLegacyConfig(): Config | null {
  const configPaths = [
    join(homedir(), ".catd.yml"),
    join(homedir(), ".catd.yaml"),
    join(homedir(), ".catd.json"),
    join(process.cwd(), ".catd.yml"), // Also check local directory
    join(process.cwd(), ".catd.yaml"),
    join(process.cwd(), ".catd.json"),
  ];

  for (const configPath of configPaths) {
    if (existsSync(configPath)) {
      try {
        const content = readFileSync(configPath, "utf-8");
        if (configPath.endsWith(".json")) {
          return JSON.parse(content) as Config;
        } else {
          return yaml.load(content) as Config;
        }
      } catch (err) {
        console.error(`Error loading config from ${configPath}:`, err);
      }
    }
  }

  return null;
}

export function getTagConfig(
  config: Config,
  tagName: string,
): TagConfig | null {
  if (!config.tags) {
    return null;
  }

  return config.tags[tagName] || null;
}

export function listTags(
  config: Config | null,
  currentDir: string = process.cwd(),
): string[] {
  if (!config || !config.tags) {
    return [];
  }

  // Filter tags that are in scope for the current directory
  return Object.keys(config.tags).filter((tagName) => {
    const tagConfig = config.tags[tagName];
    return tagConfig && isTagInScope(tagConfig, currentDir);
  });
}

export function getConfigPaths(): string[] {
  return [
    join(homedir(), ".catd.yml"),
    join(homedir(), ".catd.yaml"),
    join(homedir(), ".catd.json"),
    join(process.cwd(), ".catd.yml"),
    join(process.cwd(), ".catd.yaml"),
    join(process.cwd(), ".catd.json"),
  ];
}

// Check if current directory is within the scope of a tag's path
export function isTagInScope(
  tagConfig: TagConfig,
  currentDir: string = process.cwd(),
): boolean {
  if (!tagConfig.path) {
    return true; // No path restriction, tag is always in scope
  }

  const tagBasePath = resolve(expandPath(tagConfig.path));
  const currentPath = resolve(currentDir);

  // Check if current directory is the same as or a subdirectory of the tag's base path
  return (
    currentPath === tagBasePath || currentPath.startsWith(tagBasePath + "/")
  );
}

// Get the base directory for a tag (with path expansion)
export function getTagBasePath(tagConfig: TagConfig): string {
  if (!tagConfig.path) {
    return process.cwd();
  }
  return resolve(expandPath(tagConfig.path));
}

// Expand ~ in paths
function expandPath(path: string): string {
  if (path.startsWith("~/")) {
    return join(homedir(), path.slice(2));
  }
  return path;
}

// Resolve tag paths relative to the tag's base directory
export function resolveTagPaths(tagConfig: TagConfig): string[] {
  const basePath = getTagBasePath(tagConfig);
  return tagConfig.paths.map((path) => {
    if (resolve(path) === path) {
      // Already absolute path
      return path;
    }
    // Resolve relative to tag's base path
    return join(basePath, path);
  });
}
