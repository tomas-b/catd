#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Installation directories
INSTALL_DIR="/usr/local/bin"
COMPLETION_DIR_ZSH="$HOME/.zsh/completions"
COMPLETION_DIR_BASH_LINUX="/etc/bash_completion.d"
COMPLETION_DIR_BASH_MAC="/usr/local/etc/bash_completion.d"

# Functions
print_banner() {
    echo -e "${BLUE}"
    echo "┌─────────────────────────────┐"
    echo "│   catd Installer v1.0.0     │"
    echo "└─────────────────────────────┘"
    echo -e "${NC}"
}

check_dependencies() {
    echo "Checking dependencies..."
    
    # Check for bun
    if ! command -v bun &> /dev/null; then
        echo -e "${RED}✗ bun is required but not installed.${NC}"
        echo "  Install from: https://bun.sh"
        echo "  Run: curl -fsSL https://bun.sh/install | bash"
        exit 1
    else
        echo -e "${GREEN}✓ bun found$(NC)"
    fi
    
    # Check for git (optional but recommended)
    if ! command -v git &> /dev/null; then
        echo -e "${YELLOW}⚠ git not found. Git integration features will not work.${NC}"
    else
        echo -e "${GREEN}✓ git found${NC}"
    fi
}

build_project() {
    echo -e "\n${BLUE}Building catd...${NC}"
    
    # Install dependencies
    echo "Installing dependencies..."
    bun install
    
    # Build the binary
    echo "Compiling binary..."
    bun build src/catd.ts --compile --outfile dist/catd
    
    # Make it executable
    chmod +x dist/catd
    
    echo -e "${GREEN}✓ Build complete${NC}"
}

install_binary() {
    echo -e "\n${BLUE}Installing binary...${NC}"
    
    # Check if we need sudo
    if [ -w "$INSTALL_DIR" ]; then
        cp dist/catd "$INSTALL_DIR/"
    else
        echo "Need sudo permission to install to $INSTALL_DIR"
        sudo cp dist/catd "$INSTALL_DIR/"
    fi
    
    echo -e "${GREEN}✓ Binary installed to $INSTALL_DIR/catd${NC}"
}

detect_shell() {
    # Detect user's shell
    if [ -n "$ZSH_VERSION" ]; then
        echo "zsh"
    elif [ -n "$BASH_VERSION" ]; then
        echo "bash"
    elif [ -n "$FISH_VERSION" ]; then
        echo "fish"
    else
        # Fall back to checking SHELL variable
        case "$SHELL" in
            */zsh) echo "zsh" ;;
            */bash) echo "bash" ;;
            */fish) echo "fish" ;;
            *) echo "unknown" ;;
        esac
    fi
}

install_completions() {
    echo -e "\n${BLUE}Installing shell completions...${NC}"
    
    local shell=$(detect_shell)
    echo "Detected shell: $shell"
    
    # Install based on shell
    case "$shell" in
        zsh)
            install_zsh_completions
            ;;
        bash)
            install_bash_completions
            ;;
        fish)
            install_fish_completions
            ;;
        *)
            echo -e "${YELLOW}⚠ Unknown shell. Attempting to install for common shells...${NC}"
            install_zsh_completions
            install_bash_completions
            ;;
    esac
}

install_zsh_completions() {
    echo "Installing Zsh completions..."
    
    # Create directory if it doesn't exist
    mkdir -p "$COMPLETION_DIR_ZSH"
    
    # Copy completion file
    cp completions/catd.zsh "$COMPLETION_DIR_ZSH/_catd"
    
    # Check if fpath is set up correctly
    if ! grep -q "fpath=(.*$COMPLETION_DIR_ZSH" "$HOME/.zshrc" 2>/dev/null; then
        echo -e "${YELLOW}Note: Add this to your ~/.zshrc:${NC}"
        echo "  fpath=($COMPLETION_DIR_ZSH \$fpath)"
        echo "  autoload -U compinit && compinit"
    fi
    
    echo -e "${GREEN}✓ Zsh completions installed${NC}"
}

install_bash_completions() {
    echo "Installing Bash completions..."
    
    local completion_dir=""
    
    # Determine the correct directory
    if [[ "$OSTYPE" == "darwin"* ]] && [ -d "$COMPLETION_DIR_BASH_MAC" ]; then
        completion_dir="$COMPLETION_DIR_BASH_MAC"
    elif [ -d "$COMPLETION_DIR_BASH_LINUX" ]; then
        completion_dir="$COMPLETION_DIR_BASH_LINUX"
    else
        # Fallback to user directory
        cp completions/catd.bash "$HOME/.catd-completion.bash"
        echo -e "${YELLOW}Note: Add this to your ~/.bashrc:${NC}"
        echo "  source ~/.catd-completion.bash"
        echo -e "${GREEN}✓ Bash completions installed (user directory)${NC}"
        return
    fi
    
    # Install to system directory
    if [ -w "$completion_dir" ]; then
        cp completions/catd.bash "$completion_dir/catd"
    else
        sudo cp completions/catd.bash "$completion_dir/catd"
    fi
    
    echo -e "${GREEN}✓ Bash completions installed${NC}"
}

install_fish_completions() {
    echo "Installing Fish completions..."
    
    local fish_dir="$HOME/.config/fish/completions"
    mkdir -p "$fish_dir"
    
    if [ -f "completions/catd.fish" ]; then
        cp completions/catd.fish "$fish_dir/"
        echo -e "${GREEN}✓ Fish completions installed${NC}"
    else
        echo -e "${YELLOW}⚠ Fish completions not found${NC}"
    fi
}

create_example_config() {
    echo -e "\n${BLUE}Creating example configuration...${NC}"
    
    if [ ! -f "$HOME/.catd.yml" ]; then
        cp examples/.catd.yml "$HOME/.catd.yml.example"
        echo -e "${GREEN}✓ Example config created at ~/.catd.yml.example${NC}"
        echo -e "${YELLOW}  Rename to ~/.catd.yml and customize for your projects${NC}"
    else
        echo -e "${GREEN}✓ Config file already exists at ~/.catd.yml${NC}"
    fi
}

print_success() {
    echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ catd installed successfully!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo
    echo "To get started:"
    echo "  catd --help              Show help"
    echo "  catd --list-tags         List configured tags" 
    echo "  catd -t <tag> | pbcopy   Copy tagged files"
    echo
    echo "Shell completion:"
    echo "  Restart your shell or run:"
    
    local shell=$(detect_shell)
    case "$shell" in
        zsh)
            echo "  autoload -U compinit && compinit"
            ;;
        bash)
            echo "  source ~/.bashrc"
            ;;
    esac
    
    echo
    echo "Documentation: https://github.com/yourusername/catd"
}

# Main installation flow
main() {
    print_banner
    check_dependencies
    build_project
    install_binary
    install_completions
    create_example_config
    print_success
}

# Run main installation
main