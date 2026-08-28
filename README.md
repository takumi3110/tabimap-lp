# たびまっぷ LP

たびまっぷ（iOS アプリ）の紹介ページとサポートページ。Astro の静的サイト。

```
src/
├── layouts/Base.astro          head・フォント・テーマ
├── components/
│   ├── BrandMark.astro         アプリアイコンの SVG
│   └── SiteFooter.astro        フッター（サブスク注記は props で出し分け）
├── styles/tokens.css           配色トークン + ベース CSS
├── consts.ts                   Apple 標準 EULA の URL
└── pages/
    ├── index.astro             LP
    ├── support.astro           サポート（App Store のサポートURL枠）
    ├── privacy.astro           プライバシーポリシー（App Store のプライバシーURL枠）
    └── 404.astro               404

src/layouts/DocPage.astro は support / privacy 共通の読み物ページ。
上部ヘッダー・目次・本文スタイル・フッターを持つので、ページ側は中身だけ書けばいい。
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
- プライバシーポリシー: https://claude.ai/code/artifact/47220076-ae48-4944-b297-ed9cbae66d94
- 404: https://claude.ai/code/artifact/56d23355-0df9-429f-bf47-bfc1f9034362

URL は `scripts/artifact.mjs` の `ARTIFACT_URLS` にも書いてある。作り直したら両方直すこと。

## デプロイ（Cloudflare Workers）

Pages ではなく Workers を使う。Cloudflare が新規プロジェクトに Workers を推奨しており、
今後の機能追加も Workers 側にしか入らないため。設定は `wrangler.jsonc`。
静的サイトなので Worker のスクリプトは持たない（`main` を書かない）。

```bash
yarn build
yarn dlx wrangler deploy    # 初回はブラウザで Cloudflare のログインが開く
```

`yarn dlx` を使えば wrangler を依存に入れずに済む。頻繁に叩くなら
`yarn add -D wrangler` して `yarn wrangler deploy` にしてもいい。

GitHub に push して自動デプロイにする場合は、Cloudflare ダッシュボードの
Workers & Pages からリポジトリを接続し、ビルドコマンド `yarn build` /
出力ディレクトリ `dist` を指定する。

`wrangler.jsonc` の `not_found_handling: "404-page"` は `src/pages/404.astro` から
生成される `dist/404.html` を返す。

## 差し替えが必要な箇所

- `support@example.com` → 実際の問い合わせ先（`support.astro` と `privacy.astro` の2箇所）
- `src/pages/index.astro` の `href="#download"` の2箇所 → App Store の実 URL
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

## 利用規約について

独自の利用規約は作らず、Apple の標準 EULA（Licensed Application End User License Agreement）
にリンクしている。App Store Connect で独自 EULA を登録しなければ、これが自動的に適用される。
URL は `src/consts.ts` の `APPLE_STANDARD_EULA`。

https://www.apple.com/legal/internet-services/itunes/dev/stdeula/

ガイドライン 3.1.2 が求める「利用規約(EULA)へのリンク」は、この URL で満たせる。
アプリに独自のサービス条件（ユーザー間の共有、投稿機能など）を足したら、
そのときは自前の規約が必要になる。
