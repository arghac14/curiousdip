# CuriousDip search setup

The visible layouts stay the same. The About introduction now states that Arghadip is currently based in Bengaluru and originally from West Bengal.

## What the build does

`npm run build` renders the existing portfolio components into real HTML at `/`, `/series/`, `/blogs/`, `/videos/`, `/about/`, `/contact/`, and numeric story URLs such as `/series/4/`. Search engines can read the actual headings, writing, photographs and links before JavaScript runs. Existing `#/...` bookmarks still work, and normal clicks retain the SPA navigation.

Each page has a distinct search title, description, canonical URL, Open Graph and Twitter sharing metadata. JSON-LD describes Arghadip, CuriousDip, profile/contact pages, photo collections and blog articles. No fabricated reviews, business address, awards or search keywords hidden in the page are added. Deleted content is excluded. Every admin content commit triggers the same build, regenerating the pages and sitemap.

`data/seo.json` is the public configuration. The canonical base currently points to the active GitHub Pages site. When the custom domain is connected, change `siteUrl` to `https://curiousdip.in/` as part of that deployment. Do not point canonical URLs at a domain that is not serving the portfolio yet.

## After deployment

1. In Google Search Console, add the URL-prefix property `https://arghac14.github.io/curiousdip/`. Complete ownership verification using Google's supplied HTML file or verification meta tag. No ownership verification has been submitted by this code change.
2. Submit `https://arghac14.github.io/curiousdip/sitemap.xml`.
3. Inspect the home, About and a photo-series URL. Request indexing and check the rendered page. Validate structured data with Google's Rich Results Test; valid general schema does not imply eligibility for every rich-result format.
4. For local searches, set up an accurate Google Business Profile only if the photography business meets Google's eligibility requirements. Use the real Bengaluru location/service area and consistent name, website and contact details. Do not publish a home address just for SEO.

The build emits `robots.txt`, but a project site under `/curiousdip/` does not control the host's root `/robots.txt`; Google uses the root file. Submit the sitemap directly in Search Console. The generated file will be at the correct root when a custom domain serves the site.

SEO helps discovery and relevance; it cannot guarantee first position for a name, travel/festival photography or near-me searches. Local distance, competition, reputation and content also matter. Search Console is needed to observe indexing and real search queries over time.

## Verification

`npm run build` includes SEO checks for generated page content, unique canonical URLs, crawlable links, social metadata, schema, deleted entries, and blog article metadata. The browser preview should be served from `dist/` to exercise the generated URLs; the source development server continues to support the original hash routes.
