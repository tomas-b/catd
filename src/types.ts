export interface TagConfig {
  paths: string[];
  path?: string; // Base directory for this tag (defaults to current working directory)
  tree_prefix?: string;
  tree_options?: string;
  context_prefix?: string;
  ignore?: string[];
}

export interface Config {
  tags: Record<string, TagConfig>;
  defaults?: {
    ignore?: string[];
    tree_options?: string;
    slice_rows?: number;
  };
}

export interface OutputStats {
  fileCount: number;
  totalChars: number;
  treeOutput: string;
  treeChars: number;
}

export interface ProcessOptions {
  ignorePatterns: string[];
  useTreeMode: boolean;
  showFullContent: boolean;
  showOnlyGitChanges: boolean;
  sliceRows: number;
}

export interface ParsedArguments {
  _: string[];
  ignore?: string | string[];
  tree?: boolean;
  full?: boolean;
  "git-changes"?: boolean;
  "list-tags"?: boolean;
  "list-tags-autocomplete"?: boolean;
  tag?: string;
  "tag-file"?: string;
  help?: boolean;
  version?: boolean;
}
