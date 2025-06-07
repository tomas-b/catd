#!/bin/bash
# Uninstall script for catd

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Uninstalling catd...${NC}"

# Remove binary
if [ -f "/usr/local/bin/catd" ]; then
    echo "Removing binary..."
    if [ -w "/usr/local/bin" ]; then
        rm -f /usr/local/bin/catd
    else
        sudo rm -f /usr/local/bin/catd
    fi
    echo -e "${GREEN}✓ Binary removed${NC}"
fi

# Remove completions
echo "Removing shell completions..."

# Zsh
if [ -f "$HOME/.zsh/completions/_catd" ]; then
    rm -f "$HOME/.zsh/completions/_catd"
    echo -e "${GREEN}✓ Zsh completions removed${NC}"
fi

# Bash - user directory
if [ -f "$HOME/.catd-completion.bash" ]; then
    rm -f "$HOME/.catd-completion.bash"
    echo -e "${GREEN}✓ Bash completions removed (user)${NC}"
    echo -e "${YELLOW}Note: Remove 'source ~/.catd-completion.bash' from your ~/.bashrc${NC}"
fi

# Bash - system directories
for dir in /usr/local/etc/bash_completion.d /etc/bash_completion.d; do
    if [ -f "$dir/catd" ]; then
        if [ -w "$dir" ]; then
            rm -f "$dir/catd"
        else
            sudo rm -f "$dir/catd"
        fi
        echo -e "${GREEN}✓ Bash completions removed (system)${NC}"
    fi
done

# Fish
if [ -f "$HOME/.config/fish/completions/catd.fish" ]; then
    rm -f "$HOME/.config/fish/completions/catd.fish"
    echo -e "${GREEN}✓ Fish completions removed${NC}"
fi

# Ask about config file
if [ -f "$HOME/.catd.yml" ] || [ -f "$HOME/.catd.yaml" ] || [ -f "$HOME/.catd.json" ]; then
    echo -e "\n${YELLOW}Configuration file found.${NC}"
    read -p "Remove configuration file? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -f "$HOME/.catd.yml" "$HOME/.catd.yaml" "$HOME/.catd.json"
        echo -e "${GREEN}✓ Configuration removed${NC}"
    else
        echo "Configuration file kept"
    fi
fi

echo -e "\n${GREEN}✅ catd uninstalled successfully${NC}"
echo -e "${YELLOW}Note: Restart your shell to complete the removal${NC}"