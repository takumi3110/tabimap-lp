# たびまっぷ LP

たびまっぷ（iOS アプリ）の紹介ページとサポートページ。Astro の静的サイト。

```
src/
├── layouts/Base.astro          head・フォント・テーマ
├── components/
│   ├── BrandMark.astro         アプリアイコンの SVG
│   └── SiteFooter.astro        フッター（サブスク注記は props で出し分け）
├── styles/tokens.css           配色トークン + ベース CSS
└── pages/
    ├── index.astro             LP
    └── support.astro           サポート（App Store のサポートURL枠に入れるページ）
```

## コマンド

```bash
yarn install
yarn dev      # http://localhost:4321
yarn build    # dist/ を作り、続けて artifact/ を生成する
yarn preview  # ビルド結果を確認
```

## 出力が2種類ある理由

| 出力 | 用途 |
|---|---|
| `dist/` | 通常の静的サイト。Cloudflare Pages / Netlify / GitHub Pages にそのまま置ける |
| `artifact/` | Claude Code の Artifact 公開用。`scripts/artifact.mjs` が `<!doctype>`・`<html>`・`<head>`・`<body>` を外し、サイト内リンクを Artifact の URL に貼り替える |

Artifact 側が外側の殻を付与する仕様なので、そのまま貼ると入れ子になる。CSS は
`astro.config.mjs` の `build.inlineStylesheets: 'always'` で全部インライン化してあるため、
どちらの出力も1ファイルで完結する（外部参照は Google Fonts のみ）。

公開済みの Artifact:

- LP: https://claude.ai/code/artifact/f650002f-f1e7-4bd2-be7c-af3b9dd49bdd
- サポート: https://claude.ai/code/artifact/d9e74a7a-161c-43d7-a8b4-d78d29d6bc29

URL は `scripts/artifact.mjs` の `ARTIFACT_URLS` にも書いてある。作り直したら両方直すこと。

## 差し替えが必要な箇所

- `src/pages/support.astro` の `support@example.com` → 実際の問い合わせ先
- `src/pages/index.astro` の `href="#download"` の2箇所 → App Store の実 URL
- 両ページの `footerLinks` にある `href: '#'` → プライバシーポリシー / 利用規約のページ
- 価格（¥500 / 月・¥3,800 / 年）は `docs/App Store 掲載情報.md` と揃えること
- スクリーンショットが撮れたら、CSS で組んだ画面再現を実画像に差し替える

## 画面再現の出典（本アプリの実装と一致させること）

LP 内の2つの画面モックは、たびまっぷの実画面を CSS で再現したもの。仕様を変えたらここも直す。

| LP の場所 | 元にした画面 / 実装 |
|---|---|
| ヒーローの `.device` | トリップ詳細（`TripDetailView.swift` のヘッダー・日付チップ・セグメント + `PlanTimelineRow.swift`） |
| 「The reason it works」の `.crop-frame` | 同画面の拡大クロップ。バナー文言は `TripDetailView.swift` の `MeasuredRouteUpsellBanner` |
| 表示データ | `SampleData.swift` の沖縄旅行（7/30–8/2・予算¥60,000） |
| 移動時間の表記 | `TravelTimeEstimator.swift` の `TravelEstimate.text` = 「車 約25分」形式。モードは徒歩と車のみ |

- 時刻レールは開始と終了の2段（`Plan.railStartTimeText` / `railEndTimeText`）
- トリップ詳細のセグメントは「タイムライン / 地図」。カレンダー切替はトップの一覧（`TripListView.swift`）
- サポートページの手順とエラー文言は `ListImportView.swift` / `ListImportModel.swift` から取っている

## 配色

`src/styles/tokens.css` の値は本体アプリの `tabimap/Assets.xcassets` から持ってきている。
色を変えるときはアプリ側と揃えること。
