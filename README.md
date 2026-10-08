# Viral Prajapati | Batman's Batcave Computer Terminal Portfolio

A responsive React, TypeScript, and Vite portfolio presented as an interactive Bat cave Comupter-inspired terminal. Tailwind CSS is integrated through the Vite plugin; feature styles remain colocated with their modules.

## Run locally

```sh
npm install
cp .env.example .env.local
# Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM in .env.local.
npm run dev
```

`npm run dev` runs Vite and the Node mail API together. Create a production build with `npm run build`, then launch the Node server with `npm start`. Run Oxlint with `npm run lint`.

## Search indexing and deployment domain

Set `SITE_URL` in the production build environment to the site's public origin, with no path, for example `https://portfolio.example.com`. Then run `npm run build`. The build generates `dist/robots.txt` and `dist/sitemap.xml` with the configured domain and adds the matching canonical and Open Graph URL to the generated HTML. If `SITE_URL` is absent, the build warns and writes a reserved placeholder domain; do not deploy that output as-is.

The sitemap intentionally lists the portfolio's single real page. The countries and regions in the profile are remote service coverage on that page, not separate local-office landing pages. After deployment, verify domain ownership in Google Search Console and Bing Webmaster Tools, then submit `https://YOUR_DOMAIN/sitemap.xml`. No analytics or search API keys are needed for indexing.

For Gmail SMTP, use an app password generated for the receiving Gmail account and keep it only in `.env.local`; never commit real credentials. Production must supply the same SMTP variables through its server environment. The server sends directly over SMTP, sets the visitor email as `Reply-To`, and never accepts a client-selected recipient.

## Personalize

- Add a portrait image at `public/profile.png`. The ASCII portrait renders a built-in fallback if the image is absent or cannot be decoded.
- Set `VITE_LINKEDIN_URL`, `VITE_LEETCODE_URL`, and `VITE_HACKERRANK_URL` in `.env.local` to your public profile URLs.
- Contact form messages are sent server-to-server through SMTP to `viral.prajapati.nmims@gmail.com`. The SMTP credentials remain server-side. Configure a provider mailbox and verified sender via the `SMTP_*` variables before deploying.
- Adjust indicative INR prices in `src/features/services-catalog/services.ts`.
- Update project destinations and career details in `src/features/terminal/commandRegistry.ts`.

## Feature layout

- `src/features/ascii-portrait/` owns image sampling, fallback rendering, and portrait styles.
- `src/features/matrix-rain/` owns the animated canvas and its styles.
- `src/features/terminal/` owns the command contract, registry, state hook, window, prompt, output, and styles.
- `src/features/contact/` owns the email composer; `server/index.ts` validates and rate-limits direct SMTP delivery.
- `src/features/boot-screen/`, `profiles/`, `system-resources/`, and `services-catalog/` own their named user-facing modules.
- `src/styles/` contains page-level shell styling only.

System resource values are browser sandbox metrics, not operating-system-wide CPU or memory readings. Prices are indicative estimates and should be reviewed before quoting a client.
