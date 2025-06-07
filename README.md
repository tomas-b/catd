# catd

Cat for directories. Shows file contents in a format optimized for sharing with AI.

## Features

- 🌳 **Smart Tree View** - Visual directory structure in terminal, flat text when piped
- 🏷️ **Tag System** - Predefined file collections via YAML/JSON config
- 🔍 **Git Integration** - Show only files with git changes
- 📊 **CSV/TSV Slicing** - Automatically truncate large tabular files
- 🚫 **Smart Filtering** - Ignores common files (node_modules, .git, build files)
- 🎯 **AI Optimized** - Token counting and copy-friendly output
- 🔧 **Shell Completions** - Tab completion for tags and options
- ⚡ **Fast** - Built with Bun for optimal performance

## Quick Install

```bash
git clone https://github.com/yourusername/catd
cd catd
./install.sh
```

The installer will:
- Build the binary from source
- Install to `/usr/local/bin/catd`
- Set up shell completions for your shell
- Create example configuration

## Usage

### Basic Usage
```bash
# Show all files in current directory
catd

# Show specific directory  
catd src/

# Show files matching pattern
catd **/*.json

# Copy to clipboard for AI
catd | pbcopy
```

### Advanced Usage with Tags
```bash
# List available tags
catd --list-tags

# Use a predefined tag
catd -t backend | pbcopy

# Show only git changes
catd --git-changes

# Show full CSV content (not sliced)
catd --full data.csv
```

## Configuration

Create `~/.catd.yml` or `.catd.yml` in your project:

```yaml
# Global defaults
defaults:
  ignore:
    - "*.log"
    - ".env*"
  slice_rows: 5

# Tag definitions
tags:
  backend:
    paths:
      - "src/server"
      - "src/api"
      - "package.json"
    ignore:
      - "*.test.js"

  config:
    paths:
      - "package.json"
      - "tsconfig.json"
      - "*.config.js"
```

See `examples/.catd.yml` for more examples.

## Options

```bash
catd [folder|pattern] [options]

Options:
  -t, --tag <name>            Use predefined tag from config
  -i, --ignore <pattern>      Ignore files/folders (can be used multiple times)
  -g, --git-changes           Show only files with git changes
  -f, --full                  Show full CSV/TSV content (not sliced)
      --tree                  Force tree view when piping
      --list-tags             List available tags
  -h, --help                  Show help
  -v, --version               Show version
```

## Development

```bash
# Install dependencies
bun install

# Build from source
bun run build

# Run tests
bun test

# Development mode
bun run dev --help
```

## Requirements

- [Bun](https://bun.sh) runtime

## Shell Completions

Completions are automatically installed by the installer. To install manually:

```bash
./scripts/install-completions.sh
```

Supports Bash, Zsh, and Fish with intelligent tag completion.

## Uninstall

```bash
./uninstall.sh
```

## License

MIT License - see [LICENSE](LICENSE) file.
