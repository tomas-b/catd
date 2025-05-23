# catd

Cat for directories. Shows file contents in a format good for sharing with AI.

## Install

```bash
# Copy to your PATH
sudo cp catd.ts /usr/local/bin/catd
sudo chmod +x /usr/local/bin/catd
```

## Usage

```bash
# Show all files in current directory
catd

# Show specific directory  
catd src/

# Show files matching pattern
catd *.js

# Copy to clipboard for AI
catd | pbcopy
```

## What it does

- Shows file tree in terminal, flat text when piped
- Ignores common stuff (node_modules, .git, build files)
- Slices CSV/TSV files to first/last 5 rows
- Skips binary files

## Options

```bash
catd --ignore pattern    # Ignore files/folders
catd --tree             # Force tree view when piping  
catd --full             # Show full CSV content
catd --help             # Show help
```

Requires Bun to run.
