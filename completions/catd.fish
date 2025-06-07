# Fish completion for catd

# Use the autocomplete-specific command
function __catd_tags
    set -l tags
    
    if command -v catd >/dev/null 2>&1
        set tags (catd --list-tags-autocomplete 2>/dev/null)
    end
    
    for tag in $tags
        echo $tag
    end
end

# Command options
complete -c catd -s h -l help -d "Show help message"
complete -c catd -s v -l version -d "Show version number"
complete -c catd -s t -l tag -d "Use predefined tag from config" -xa "(__catd_tags)"
complete -c catd -s i -l ignore -d "Ignore path pattern" -r
complete -c catd -s g -l git-changes -d "Show only files with git changes"
complete -c catd -s f -l full -d "Show full content of CSV/TSV files"
complete -c catd -l tree -d "Force tree output mode"
complete -c catd -l list-tags -d "List all available tags from config" 