/*
  Claude Code の Artifact 公開用に、dist の HTML から外側の殻を外して artifact/ に出す。

  Artifact 側が <!doctype html><head>…</head><body> を付与する仕様なので、
  こちらが同じタグを持っていると入れ子になる。head の中身（title/meta/link）は
  そのまま残さないと題名とフォントが失われるため、head と body を結合して出力する。
*/

import { mkdir, readdir, readFile, writeFile, rm } from 'node:fs/promises'
import { join } from 'node:path'

const DIST = 'dist'
const OUT = 'artifact'

/*
  Artifact はページごとに別 URL で公開されるので、サイト内リンク（/、/support）が
  そのままだと claude.ai の同名パスに飛んでしまう。プレビュー用に貼り替える。
  実際のデプロイでは dist/ をそのまま使うので、この置換は関係しない。
*/
const ARTIFACT_URLS = {
  '/': 'https://claude.ai/code/artifact/f650002f-f1e7-4bd2-be7c-af3b9dd49bdd',
  '/support': 'https://claude.ai/code/artifact/d9e74a7a-161c-43d7-a8b4-d78d29d6bc29',
  '/privacy': 'https://claude.ai/code/artifact/47220076-ae48-4944-b297-ed9cbae66d94'
}

function rewriteInternalLinks(html) {
  return html.replaceAll(/href="(\/[^"#]*)"/g, (match, path) => {
    const url = ARTIFACT_URLS[path]
    return url ? `href="${url}"` : match
  })
}

/** dist 以下の .html を再帰的に集める。パスは dist からの相対。 */
async function htmlFiles(dir = '') {
  const entries = await readdir(join(DIST, dir), { withFileTypes: true })
  const found = []
  for (const entry of entries) {
    const path = dir ? `${dir}/${entry.name}` : entry.name
    if (entry.isDirectory()) found.push(...(await htmlFiles(path)))
    else if (entry.name.endsWith('.html')) found.push(path)
  }
  return found
}

/** dist/support/index.html → support.html、dist/index.html → index.html */
function outputName(path) {
  const withoutIndex = path.replace(/\/?index\.html$/, '')
  return withoutIndex ? `${withoutIndex.replaceAll('/', '-')}.html` : 'index.html'
}

function unwrap(html) {
  const head = html.match(/<head>([\s\S]*?)<\/head>/)
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)
  if (!head || !body) {
    throw new Error('head か body が見つからなかった。Astro の出力形式が変わった可能性がある')
  }
  // Artifact 側が付ける分と重複するタグだけ落とす
  const headInner = head[1]
    .replace(/<meta charset="[^"]*"\s*\/?>/g, '')
    .replace(/<meta name="viewport"[^>]*\/?>/g, '')
    .trim()
  return `${headInner}\n${body[1].trim()}\n`
}

await rm(OUT, { recursive: true, force: true })
await mkdir(OUT, { recursive: true })

const files = await htmlFiles()
for (const file of files) {
  const name = outputName(file)
  const html = rewriteInternalLinks(unwrap(await readFile(join(DIST, file), 'utf8')))
  await writeFile(join(OUT, name), html)
  console.log(`${DIST}/${file} → ${OUT}/${name}`)
}
