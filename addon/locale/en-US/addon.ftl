venue-alias-menuitem =
    .label = Zotero Extra: Fetch Venue Alias
venue-alias-column-label = Venue Alias
venue-alias-no-items = No items selected
venue-alias-no-update = No venue aliases were updated
venue-alias-updated =
    { $count ->
        [one] Updated { $count } venue alias
       *[other] Updated { $count } venue aliases
    }
venue-alias-summary-updated =
    { $count ->
        [one] { $count } updated
       *[other] { $count } updated
    }
venue-alias-summary-uptodate =
    { $count ->
        [one] { $count } already up to date
       *[other] { $count } already up to date
    }
venue-alias-summary-missing-doi =
    { $count ->
        [one] { $count } missing DOI
       *[other] { $count } missing DOI
    }
venue-alias-summary-not-found =
    { $count ->
        [one] { $count } not found
       *[other] { $count } not found
    }
venue-alias-summary-failed =
    { $count ->
        [one] { $count } failed
       *[other] { $count } failed
    }
