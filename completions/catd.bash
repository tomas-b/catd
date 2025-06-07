#!/bin/bash
# Bash completion for catd

_catd_complete() {
    local cur prev opts
    COMPREPLY=()
    cur="${COMP_WORDS[COMP_CWORD]}"
    prev="${COMP_WORDS[COMP_CWORD-1]}"
    
    # Command line options
    opts="--ignore --tag --git-changes --full --tree --list-tags --help --version -i -t -g -f -h -v"
    
    # Handle option arguments
    case "${prev}" in
        --tag|-t)
            # Use the autocomplete-specific command
            local tags
            if command -v catd >/dev/null 2>&1; then
                tags=$(catd --list-tags-autocomplete 2>/dev/null)
            fi
            COMPREPLY=( $(compgen -W "${tags}" -- ${cur}) )
            return 0
            ;;
        --ignore|-i)
            # Complete file patterns
            COMPREPLY=( $(compgen -f -- ${cur}) )
            return 0
            ;;
    esac
    
    # If current word starts with -, complete options
    if [[ ${cur} == -* ]]; then
        COMPREPLY=( $(compgen -W "${opts}" -- ${cur}) )
        return 0
    fi
    
    # Default to file/directory completion
    COMPREPLY=( $(compgen -f -- ${cur}) )
    return 0
}

# Register the completion function
complete -F _catd_complete catd 