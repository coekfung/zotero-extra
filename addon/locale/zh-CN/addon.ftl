venue-alias-menuitem =
    .label = Zotero Extra: 获取期刊/会议别名
venue-alias-column-label = 期刊/会议别名
venue-alias-no-items = 未选择条目
venue-alias-no-update = 没有更新任何期刊/会议别名
venue-alias-updated =
    { $count ->
        [one] 已更新 { $count } 个期刊/会议别名
       *[other] 已更新 { $count } 个期刊/会议别名
    }
venue-alias-summary-updated =
    { $count ->
        [one] { $count } 个已更新
       *[other] { $count } 个已更新
    }
venue-alias-summary-uptodate =
    { $count ->
        [one] { $count } 个已是最新
       *[other] { $count } 个已是最新
    }
venue-alias-summary-missing-doi =
    { $count ->
        [one] { $count } 个缺少 DOI
       *[other] { $count } 个缺少 DOI
    }
venue-alias-summary-not-found =
    { $count ->
        [one] { $count } 个未找到
       *[other] { $count } 个未找到
    }
venue-alias-summary-failed =
    { $count ->
        [one] { $count } 个请求失败
       *[other] { $count } 个请求失败
    }
