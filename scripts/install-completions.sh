#!/bin/bash
# Installation script for catd shell completions

echo "Installing catd shell completions..."

# Detect shell (use SHELL environment variable since this script runs in bash)
case "$SHELL" in
    */zsh) SHELL_TYPE="zsh" ;;
    */bash) SHELL_TYPE="bash" ;;
    */fish) SHELL_TYPE="fish" ;;
    *) 
        # Try to detect from ps
        if ps -p $$ -o comm= | grep -q zsh; then
            SHELL_TYPE="zsh"
        elif ps -p $$ -o comm= | grep -q bash; then
            SHELL_TYPE="bash"
        else
            SHELL_TYPE="unknown"
        fi
        ;;
esac

echo "Detected shell: $SHELL_TYPE"

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
COMPLETION_DIR="$SCRIPT_DIR/../completions"

# Install based on shell type
case "$SHELL_TYPE" in
    zsh)
        echo "Installing Zsh completion..."
        
        # Create completions directory if it doesn't exist
        COMPLETION_TARGET="$HOME/.zsh/completions"
        mkdir -p "$COMPLETION_TARGET"
        
        # Copy completion file
        cp "$COMPLETION_DIR/catd.zsh" "$COMPLETION_TARGET/_catd"
        
        echo "✅ Zsh completion installed to $COMPLETION_TARGET/_catd"
        echo ""
        echo "To activate completions, add this to your ~/.zshrc:"
        echo "  fpath=(~/.zsh/completions \$fpath)"
        echo "  autoload -U compinit && compinit"
        echo ""
        echo "Then restart your shell or run: autoload -U compinit && compinit"
        ;;
        
    bash)
        echo "Installing Bash completion..."
        
        # Try to find bash completion directory
        if [[ -d "/usr/local/etc/bash_completion.d" && -w "/usr/local/etc/bash_completion.d" ]]; then
            # macOS with Homebrew (writable)
            cp "$COMPLETION_DIR/catd.bash" "/usr/local/etc/bash_completion.d/catd"
            echo "✅ Bash completion installed to /usr/local/etc/bash_completion.d/catd"
        elif [[ -d "/usr/local/etc/bash_completion.d" ]]; then
            # macOS with Homebrew (needs sudo)
            sudo cp "$COMPLETION_DIR/catd.bash" "/usr/local/etc/bash_completion.d/catd"
            echo "✅ Bash completion installed to /usr/local/etc/bash_completion.d/catd"
        elif [[ -d "/etc/bash_completion.d" && -w "/etc/bash_completion.d" ]]; then
            # Linux (writable)
            cp "$COMPLETION_DIR/catd.bash" "/etc/bash_completion.d/catd"
            echo "✅ Bash completion installed to /etc/bash_completion.d/catd"
        elif [[ -d "/etc/bash_completion.d" ]]; then
            # Linux (needs sudo)
            sudo cp "$COMPLETION_DIR/catd.bash" "/etc/bash_completion.d/catd"
            echo "✅ Bash completion installed to /etc/bash_completion.d/catd"
        else
            # Fallback: install to user's home directory
            cp "$COMPLETION_DIR/catd.bash" "$HOME/.catd-completion.bash"
            echo "✅ Bash completion installed to ~/.catd-completion.bash"
            echo ""
            echo "Add this to your ~/.bashrc:"
            echo "  source ~/.catd-completion.bash"
        fi
        
        echo ""
        echo "Restart your shell or run: source ~/.bashrc"
        ;;
        
    fish)
        echo "Installing Fish completion..."
        
        FISH_DIR="$HOME/.config/fish/completions"
        mkdir -p "$FISH_DIR"
        
        cp "$COMPLETION_DIR/catd.fish" "$FISH_DIR/"
        echo "✅ Fish completion installed to $FISH_DIR/catd.fish"
        echo ""
        echo "Fish completions are automatically loaded."
        ;;
        
    *)
        echo "❌ Unsupported shell: $SHELL_TYPE"
        echo "Manual installation required. See completions/ directory."
        exit 1
        ;;
esac

echo ""
echo "Installation complete! 🎉" 