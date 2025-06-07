#compdef catd

# Zsh completion for catd

_catd_tags() {
    local tags=()
    
    # Use the autocomplete-specific command for clean parsing
    if command -v catd >/dev/null 2>&1; then
        tags+=(${(f)"$(catd --list-tags-autocomplete 2>/dev/null)"})
    fi
    
    _describe 'tags' tags
}

_catd() {
    local context state line
    typeset -A opt_args
    
    _arguments -C \
        '(--help -h)'{--help,-h}'[Show help message]' \
        '(--version -v)'{--version,-v}'[Show version number]' \
        '(--tag -t)'{--tag,-t}'[Use predefined tag from config]:tag:_catd_tags' \
        '(--ignore -i)'{--ignore,-i}'[Ignore path pattern]:pattern:_files' \
        '(--git-changes -g)'{--git-changes,-g}'[Show only files with git changes]' \
        '(--full -f)'{--full,-f}'[Show full content of CSV/TSV files]' \
        '--tree[Force tree output mode]' \
        '--list-tags[List all available tags from config]' \
        '*:file or directory:_files' && return 0
    
    return 1
}

_catd "$@" 