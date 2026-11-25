import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ── DeWhitt Fit page shell ─────────────────────────────────────────────────
// The site is one React app, so every URL gets index.html and its head (the
// DeWhitt Designs title/description). Search engines and link previews (which
// don't run JavaScript) need /fit to describe the fitness app instead, so the
// build also writes fit.html: the same app shell with Fit's own head tags.
// public/.htaccess serves it for /fit.
const SITE = 'https://dewhittdesigns.com'
const FIT_TITLE = 'DeWhitt Fit — The Lift Journal with real coach form checks'
const FIT_DESC = 'Log workouts, food, sleep and water one page a day, see your calorie balance, and send a filmed set to a real coach for a form check. Free to start.'
const FIT_HEAD = `
    <title>${FIT_TITLE}</title>
    <meta name="description" content="${FIT_DESC}" />
    <link rel="canonical" href="${SITE}/fit" />
    <link rel="icon" type="image/svg+xml" href="/fit-icon.svg" />
    <meta name="theme-color" content="#211b15" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="DeWhitt Fit" />
    <meta property="og:title" content="${FIT_TITLE}" />
    <meta property="og:description" content="${FIT_DESC}" />
    <meta property="og:url" content="${SITE}/fit" />
    <meta property="og:image" content="${SITE}/fit-og.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="DeWhitt Fit: the lift journal, with a stick-figure squat form check" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${FIT_TITLE}" />
    <meta name="twitter:description" content="${FIT_DESC}" />
    <meta name="twitter:image" content="${SITE}/fit-og.png" />
    <script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'DeWhitt Fit',
      url: `${SITE}/fit`,
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Web, Android',
      description: FIT_DESC,
    })}</script>`

function fitPageShell() {
  return {
    name: 'fit-page-shell',
    apply: 'build',
    enforce: 'post', // run after Vite has emitted index.html
    generateBundle(_, bundle) {
      const main = bundle['index.html']
      if (!main) return
      const html = String(main.source)
      const fit = html
        .replace(/<title>[\s\S]*?<\/title>\s*/, '')
        .replace(/<meta name="description"[^>]*>\s*/, '')
        .replace(/<link rel="icon"[^>]*>\s*/, '')
        .replace('</head>', `${FIT_HEAD}\n  </head>`)
      if (fit === html || !fit.includes(FIT_TITLE)) throw new Error('fit-page-shell: could not rewrite index.html head')
      this.emitFile({ type: 'asset', fileName: 'fit.html', source: fit })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), fitPageShell()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].${Date.now()}.js`,
        chunkFileNames: `assets/[name].${Date.now()}.js`,
        assetFileNames: `assets/[name].${Date.now()}.[ext]`
      }
    }
  }
})
