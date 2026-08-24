// @ts-check
import { defineConfig } from 'astro/config'

export default defineConfig({
  // Artifact 公開は1ファイル完結が前提。外部 CSS を作らせず全部インラインにする。
  build: {
    inlineStylesheets: 'always'
  }
})
