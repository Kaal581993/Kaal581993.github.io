import { config } from 'dotenv'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

config({ path: '.env.local' })

const projectRoot = process.cwd()
const publicDirectory = resolve(projectRoot, 'public')
const distDirectory = resolve(projectRoot, 'dist')
const rawSiteUrl = process.env.SITE_URL || process.env.VITE_SITE_URL
const siteUrl = rawSiteUrl?.replace(/\/+$/, '')

if (siteUrl) {
  let parsedUrl
  try {
    parsedUrl = new URL(siteUrl)
  } catch {
    throw new Error('SITE_URL must be a valid absolute URL, for example https://example.com')
  }
  if (!['https:', 'http:'].includes(parsedUrl.protocol) || parsedUrl.pathname !== '/' || parsedUrl.search || parsedUrl.hash) {
    throw new Error('SITE_URL must contain only the production origin, for example https://example.com')
  }
}

const sourceToken = '__SITE_URL__'
const replacement = siteUrl || 'https://your-production-domain.example'

for (const fileName of ['robots.txt', 'sitemap.xml']) {
  const template = await readFile(resolve(publicDirectory, fileName), 'utf8')
  await writeFile(resolve(distDirectory, fileName), template.replaceAll(sourceToken, replacement))
}

const htmlPath = resolve(distDirectory, 'index.html')
const html = await readFile(htmlPath, 'utf8')
const canonicalUrl = `${replacement}/`
const withCanonical = html
  .replaceAll(sourceToken, replacement)
  .replace('</head>', `    <meta property="og:url" content="${canonicalUrl}" />\n  </head>`)
await writeFile(htmlPath, withCanonical)

if (!siteUrl) {
  console.warn('SITE_URL is unset; generated SEO URLs use a placeholder. Set SITE_URL before deploying.')
} else {
  console.log(`Generated sitemap, robots rules, and canonical metadata for ${siteUrl}`)
}
