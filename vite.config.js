// Source - https://stackoverflow.com/q/79959017
// Posted by Yousef Tag, modified by community. See post 'Timeline' for change history
// Retrieved 2026-06-15, License - CC BY-SA 4.0

import { defineConfig } from 'vite'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'

export default defineConfig({
  plugins: [
    viteCommonjs()
  ],

  optimizeDeps: {
    include: ['dicom-parser'],
    exclude: ['@cornerstonejs/dicom-image-loader']
  }
})
