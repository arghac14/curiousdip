# CuriousDip Roadmap

CuriousDip is a photography portfolio with a separate, local publishing app. Build and review each stage before moving to the next. This roadmap records the agreed sequence; it does not start implementation.

## Stage 1 — Build the portfolio locally (complete)

The user approved Phase 1 on 2026-11-18. The delivered portfolio uses plain HTML, CSS and JavaScript, with JSON-driven Home, Photo Series and numeric detail pages, Blogs and numeric detail pages, Videos, About and Contact. It includes responsive layouts, dark/light themes, six ordered pins per index, multi-genre series filters, search, photo viewing and the approved animations.

Preset folders supply display pictures and page backgrounds. Content arrays are in data/photoseries.json, data/blog.json and data/videos.json. README.md describes their current schema. The earlier Astro/TypeScript proposal is deferred; the approved static site is ready for the GitHub stage.

## Stage 2 — Push to GitHub and host on GitHub Pages

**Goal:** Make the portfolio available online with automatic deployment from its repository.

- [ ] Create or connect the `curiousdip` GitHub repository and push the portfolio source.
- [ ] Verify relative asset/data paths work at the selected GitHub Pages URL.
- [ ] Configure GitHub Actions to build and deploy the static site to GitHub Pages.
- [ ] Verify navigation, images, assets, and story URLs on the hosted site.
- [ ] Verify that a JSON content commit triggers a new build and deployment.
- [ ] Document local development, content locations, and deployment troubleshooting.

**Complete when:** The portfolio is accessible through GitHub Pages and repository changes deploy automatically.

## Stage 3 — Build the local CMS with Cloudinary first

**Goal:** Publish content through a separate local application without manually editing portfolio JSON files.

### Authoring

- [ ] Build an independent CMS using vanilla HTML, CSS, and JavaScript, served through a lightweight local static HTTP server.
- [ ] Add a free, framework-independent rich-text block editor that produces structured JSON compatible with the portfolio schema.
- [ ] Support creating, editing, deleting, and previewing photo essays, blogs, and films.
- [ ] Support headings, paragraphs, bold, italic, links, quotes, and lists.
- [ ] Support photographs between paragraphs, captions, alt text, image layouts, and single-image or multi-image galleries.
- [ ] Allow content blocks to be rearranged.
- [ ] Save and recover local drafts using IndexedDB.

### Images

- [ ] Use Cloudinary as the initial image upload and delivery provider.
- [ ] Choose and document a secure Cloudinary upload flow; never embed a Cloudinary API secret in browser code.
- [ ] Support multiple-image selection, browser-side resizing, and WebP conversion with configurable dimensions and quality.
- [ ] Add upload progress, actionable errors, and retries that reuse stable image identities to avoid duplicate uploads.
- [ ] Isolate upload and image URL handling behind a storage-provider interface.
- [ ] Add an explicit provider configuration flag, initially set to Cloudinary. Add R2 support in Stage 4.
- [ ] Preserve provider information on existing image references so changing the flag does not break older posts.
- [ ] Keep images when articles are updated or deleted; do not automatically delete stored assets.

### GitHub publishing

- [ ] Connect the CMS to the GitHub REST Contents API for `curiousdip-portfolio`.
- [ ] Load existing published JSON content for editing.
- [ ] Create, update, and delete content files using the required file SHAs.
- [ ] Handle authentication failures, conflicts, API errors, and interrupted publishing attempts.
- [ ] Accept a fine-grained GitHub token at runtime, restricted to the portfolio repository, without committing or unnecessarily persisting it.
- [ ] Show distinct states for local drafts, GitHub commits, and deployment outcomes. Do not claim content is live solely because a commit succeeded.
- [ ] Verify that CMS commits trigger the existing GitHub Pages deployment workflow.

**Complete when:** An article can be drafted, previewed, illustrated through Cloudinary, committed through the CMS, and deployed automatically. Editing, deletion, recovery, and failure handling have also been verified.

## Stage 4 — Add the custom domain and Cloudflare R2

**Goal:** Move to the intended long-term domain and image infrastructure after the publishing workflow is stable.

- [ ] Buy and configure the custom domain, intended to be `curiousdip.in`, subject to availability.
- [ ] Decide whether to retain GitHub Pages or move the portfolio to Cloudflare Pages.
- [ ] Configure DNS, HTTPS, canonical URLs, redirects where needed, and the site's deployment settings.
- [ ] Create an R2 bucket and configure its public image delivery domain.
- [ ] Implement an authenticated Cloudflare Worker upload endpoint using R2 bindings or short-lived presigned URLs.
- [ ] Validate authorization, file type, file size, object keys, and allowed local origins.
- [ ] Implement the R2 provider in the CMS with upload progress, stable keys, and safe retries.
- [ ] Switch the provider configuration to R2 after testing; preserve existing Cloudinary references until migrated.
- [ ] Plan and perform any migration of existing Cloudinary images, updating JSON references only after the replacement assets are verified.
- [ ] Verify end-to-end publishing, old and new image URLs, and the custom domain.
- [ ] Document setup, credential rotation, backups, storage usage, and maintenance.

**Complete when:** The portfolio works on the custom domain, new uploads use R2 securely, and previously published content remains intact.

## Principles across all stages

- Keep the portfolio independently deployable and the CMS usable locally.
- Prefer static output, minimal dependencies, and no always-running application backend.
- Use structured, validated JSON as the published content source of truth.
- Keep credentials out of source control and permanent service secrets out of frontend code.
- Render content safely and validate external links and embeds.
- Aim for free service tiers and minimal recurring costs; monitor usage rather than assuming services will always be free.
- Test the relevant workflow and review each stage before expanding scope.

## Current status

- Phase 1 is approved and complete.
- Phase 2 is in progress: initialize Git and create/push the new curiousdip repository, then configure GitHub Pages deployment.
- No live deployment has been verified yet.
- Phase 3 (local CMS) and Phase 4 (custom domain/R2) remain planned.
