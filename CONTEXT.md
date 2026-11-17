# CuriousDip — Project Context

Read this alongside ROADMAP.md and README.md. This file records the agreed direction and current implementation; update it when decisions change.

## Purpose and architecture

CuriousDip is Arghadip Chakraborty's personal photography portfolio and publishing platform for photo series, blogs, and short films, with a separate local CMS planned later.

- Author: Arghadip Chakraborty.
- Email: 01argha@gmail.com.
- Instagram: https://www.instagram.com/curious.dip/ (@curious.dip).
- Intended domain: curiousdip.in. Purchase, availability, and ownership have not been verified.
- Intended portfolio repository: curiousdip. No repository push, hosting setup, or deployment has occurred in this session.
- Production portfolio plan: Astro, TypeScript, HTML, CSS, structured JSON committed to GitHub, and YouTube embeds.
- Current deliverable: a plain HTML/CSS/JavaScript static UI prototype, built first at the user's request. No framework, installed dependencies, CMS, or cloud integrations yet.
- Keep infrastructure simple: no always-running backend, hosted content database, React/Vue/Angular CMS, unnecessary microservices, or queues. Prefer free/open-source dependencies and free service tiers, without assuming services remain free forever.
- Node tooling is allowed for development; it must not become a persistent production CMS backend.

## Agreed stages

1. Build and review the portfolio locally: pages, styling, sample content, JSON schema, and renderers.
2. Push to GitHub and host through GitHub Pages with automatic builds/deployments.
3. Build a separate local vanilla-JavaScript CMS with a free framework-independent block editor, IndexedDB drafts, previews, image optimization, and GitHub REST publishing. Use Cloudinary first, behind an image-provider interface/configuration flag.
4. Once stable, buy/configure the custom domain and integrate Cloudflare R2. Decide then whether to retain GitHub Pages or move to Cloudflare Pages. Secure R2 uploads through an authenticated Worker.

The staged plan supersedes the original brief's immediate Cloudflare Pages/R2 setup. Finish reviewing Stage 1 before moving to publishing or CMS work.

## Run and content model

- Entry point: index.html. Current routes use hash navigation for static/direct-file compatibility; migrate to real pre-rendered Astro routes later.
- npm run dev starts the local static preview at http://127.0.0.1:4321/.
- Double-clicking index.html also works. File mode reads data/preview-data.js; HTTP mode reads data/content.json.
- npm run photos refreshes the direct-file snapshot. The command name is retained, but it no longer scans Selected Photos directories.
- npm run check checks JavaScript syntax, content integrity, and HTTP/direct-file data loading.
- Node 14.17.3 is the default shell runtime; a newer bundled Node runtime is available. Select an Astro-supported version before the production migration.
- data/content.json holds profile information, content items, fixed series genres, home backgrounds, and videos. schemaVersion is 1.
- Both series and blogs use stable, unique positive integer IDs, not slugs, in routes. Current series IDs: 1–8; blog IDs: 9–16. Examples: #/series/1 and #/blogs/9. Keep IDs stable and never reuse them for unrelated content. Slugs remain descriptive metadata.
- Only published items render. Items include title, description/overview, cover, date, tags, status, featured/featureOrder, pinned/pinOrder, and structured blocks.
- Up to six ordered pins appear first in each series/blog listing. Search covers titles and content; sorting applies to other matching results. Query/filter state is reflected in the URL.
- Text is escaped when rendered. Do not accept arbitrary HTML/CSS as editorial content.
- Sample stories and stock photos are illustrative, not verified personal history or original photographs by the author.

## Visual direction and shared behavior

- Minimal editorial design. Outfit headings and DM Sans body text.
- Palette inspired by the author's supplied portrait: saffron/terracotta accents, warm ivory light surfaces, near-black dark surfaces.
- Dark is the first-use default, including when storage is unavailable. Respect explicit saved theme choices.
- Active pages: Home, Photo Series/index and numeric detail, Blogs/index and numeric detail, Videos, About, Contact.
- Selected Photos was removed from the navbar and active gallery routes. Its renderer and manifest-loading dependency are removed. Legacy asset/configuration files are preserved but unused.
- Photographs generally use 4:5 frames in the revised Home/listing/gallery designs. Portrait and square images fill with a centered cover crop; landscape images remain fully visible, centered on white. Orientation is detected from image dimensions. Some original generic styles remain 3:4; page-specific styles override them.
- Fullscreen photo viewing supports arrow keys, Escape, previous/next buttons, and focus return.
- Responsive layouts and reduced-motion behavior must remain supported.

## Home

- Desktop landing area is a 50/50 intro/slideshow layout.
- Left: enlarged circular DP with "A curious way of seeing" on its right. Name, introduction, and About link are below that row. The old PHOTOGRAPHS, STORIES / A LITTLE CURIOSITY tagline is removed.
- DP is 210px at the main desktop breakpoint and scales down responsively.
- Shared portrait: assets/displaypicture/arghadip.png, supplied by the user; configured through profile.portrait. Also used in author avatars.
- Right: 4:5 slideshow with rounded corners, raised shadows, and subtle edge highlights in both themes. Portrait images fill; landscapes are contained on white.
- Title and overview overlay the bottom of the photograph using a dark linear gradient, replacing the separate caption panel.
- Autoplay interval is three seconds. Hover and keyboard/arrow-button focus do not pause it. Explicit pause/play, hidden-tab behavior, and reduced-motion preference still apply.
- A full-width background spans the header and landing only, stopping before Selected Stories. Current image: assets/homebackground/festival-colours.png, supplied by the user. CSS blur is 0.5px with theme-aware readability overlays.
- Preset background images live in the homeBackgrounds array. There is currently one image, so visible background crossfades require adding more landscape entries. Background progression shares slideshow playback.
- Selected Stories has three named rows: Photo Series, Blogs, Videos. Up to three featured items per row, in feature order, with fewer columns on smaller screens.
- Blog cards reuse the editorial Blogs-page design. Home genre/category labels are omitted, while author/date/read-time and read/view links remain. Videos omit sample/genre/credit labels.
- Removed the standalone "The person behind the frame / Led by curiosity" Home section. Keep "Let's make a connection / A story to share? I'm all ears".

## Photo Series

- Fixed genres, in order: Festival, Street, Travel, Portraits, Documentary; also show All. Keep every genre button visible even when empty.
- Each series has a genres array and can appear under every assigned genre. Genres are distinct from optional keyword tags. Filtering checks membership, not only the first genre.
- Index: compact four-column desktop grid, responsive three/two/one columns. Borderless 4:5 thumbnails; only landscapes get white fitting space.
- Numeric detail page: title, overview, and the ordered photos array only. Four photo tiles per desktop row, fewer on smaller screens. No visible genres, dates, byline, captions, article prose, or related-content section in the page body.
- Photos remain clickable for fullscreen viewing. Original sample blocks are retained in JSON but do not render on series detail pages.

## Blogs

- Index uses two editorial cards per desktop row: author/date/read-time, title, excerpt, and image strips beside the text. Pin status remains visible.
- No genre/category labels such as Field notes, and no genre/topic filter buttons. Keep search and sorting.
- Thumbnails are 4:5, with portrait/square cover fitting and landscape containment on white.
- Numeric detail template: title, three side-by-side opening photos, text, one photo, text, one photo.
- openingImages contains exactly three image objects. blocks defines the subsequent sequence explicitly. The sample uses two paragraphs, image, two paragraphs, image. Automatic splitting logic is deferred.
- No surrounding byline/category/date/caption/related-article sections in the current detail template. Fullscreen viewing remains available.

## Videos

- videos array in data/content.json: id, youtubeId, title, overview, credit, status, demo, featured, featureOrder.
- One embedded YouTube video per row on Videos; cards have a 1120px maximum content width and stack on mobile.
- Visible card copy is title and overview, plus player/watch link. Removed sample/genre labels and credit/disclaimer lines as requested. Attribution remains in JSON and README.
- Three sample links: Big Buck Bunny, Sintel, Tears of Steel (Blender Foundation). They are placeholders, not the author's work.
- Embeds use youtube-nocookie.com, lazy loading, descriptive titles, fullscreen support, and strict-origin-when-cross-origin referrers.
- YouTube requires HTTP referrer identification. File mode shows thumbnails/watch links instead of broken embeds; use the local server for inline playback.

## About and Contact

- About has three photo/text rows: photo left/text right, text left/photo right, photo left/text right. On mobile each photo precedes its text.
- profile.aboutSections contains image, title, and paragraphs for each row. All copy is draft. The supplied portrait is reused in three slots until more author images are provided. Photos are borderless and fill 4:5 frames.
- Removed "Photographs are a way of paying attention. This is where I share what catches mine."
- Removed the entire "A few things I come back to / A practice of noticing" principles section.
- Moved the complete "A Conversation Starts Here" message form from About to Contact.
- Contact retains email, copy-email action, Instagram, and the form. Removed the decorative photo and "A moment of quiet, before the next conversation" caption.
- Contact headings, email/Instagram typography, and spacing are slightly smaller for a minimal layout. Intro invites a story, a collaboration idea, or a photography question.
- Form opens a prepared mailto draft; visitors review/send in their email app. The website does not send or store messages. Preserve required fields and honest status messages.

## Later CMS, storage, and security requirements

- Local vanilla-JavaScript authoring app with framework-independent rich-text editor; editor library not selected.
- Create/edit/delete/preview series, blogs, and films. Structured blocks support headings, paragraphs, bold/italic, quotes, links, lists, images, captions, alt text, layouts, galleries, and reordering.
- IndexedDB drafts and recovery; browser resizing/WebP conversion with configurable quality/dimensions; multiple uploads, progress, actionable errors, stable image identities, safe retries.
- GitHub REST Contents API publishes JSON to curiousdip. Handle SHAs, conflicts, authentication/API failures, interrupted requests, and retries.
- Runtime fine-grained repository-restricted GitHub token; no committed credentials or unnecessary persistence.
- Distinguish local draft, committed, and deployed states. A successful commit does not prove that content is live.
- Cloudinary first; secure upload design still to be chosen. Never embed its API secret in browser code.
- Later R2: authenticated Worker with bindings or short-lived presigned URLs; validate authorization, file type/size, object keys, and allowed local origins.
- Preserve provider-aware references, old image URLs, and images on article edits/deletion. Migrate deliberately; no automatic asset deletion.
- Validate content, links, embeds, and uploads; render safely. No cloud accounts or resources have been connected yet.

## Current operational note

Drive E: became full during development. The application changes and checks were saved, but a preview screenshot could not be written. Avoid adding large artifacts until space is available. This context file was restored from the established session decisions after a context-note write failed due to lack of space.


## Current data mapping — 2026-11-18 (supersedes earlier content.json references)

Source arrays are data/photoseries.json, data/blog.json and data/videos.json, with numeric IDs, title, subtext, photos/content/video, isPinned, isSelectedStories and createdAt. Series also retain multi-value genres. Profile copy/contact values are in data/profile.json. assets/data.js adapts these arrays to existing renderers. Array order determines pins and first-three selected stories per type. Home slides use pinned series covers (up to six).

Preset images live in assets/preset/displaypictures and assets/preset/homeBgSlideShows. npm run photos scans filenames into generated data/presets.json and creates data/preview-data.js for direct-file use. First portrait is DP; remaining portraits cycle through About rows (DP reused if none). One landscape background is randomly selected per full load and remains fixed during SPA navigation. assets/dynamic contains fallback SVG samples. Dynamic photos use HTTPS URLs or local dynamic paths. Current sample remote links remain placeholders.

README.md documents exact JSON templates, page mappings and update commands. Blog content remains plain text with provisional three-opening-photos/text/photo/text/photo layout; final rich-text formatting is deferred. npm run check validates syntax, data mapping and both loaders.

Preset folder discovery clarification: no image filename is hardcoded in selection logic. scripts/presets.cjs scans image files in natural alphabetical order; first is DP, remainder cycle through About. The local server serves a freshly scanned /data/presets.json on every load without caching. Background selection is random once per full reload (repeats are possible). Static hosting/direct-file previews still require npm run photos after folder changes.

Photo Series and Blogs index introductions now share the preset landscape background with Home, using the same 0.5px blur and theme overlays. The background stops before search, filters and cards; detail pages are unchanged.

Videos and Contact now share the same preset blurred intro background. Videos background stops before video entries; Contact background covers the introduction and contact methods, stopping before the message form.

About now uses the preset blurred landscape background across its complete landing content: headline and all three alternating portrait/text rows. It stops before the shared footer.

Correction: About background covers only the headline and FIRST portrait/text row. Rows two and three have the normal page background; their alternating layout is preserved. This supersedes the full About coverage note.

Background selection now runs on every page navigation, not only reload: each page independently chooses a random image from the discovered homeBgSlideShows presets. The chosen background stays still during that page visit. Random repeats are possible.

Background behavior correction: select all six page backgrounds once on initial app load. Preload and decode each unique selected image before first render; retain Image elements and reattach them on navigation, keeping each page background fixed until full reload. Failed selections reuse a loaded image or local fallback. Videos now have 48px space above the first tile (30px mobile). This supersedes per-navigation randomization.

The blurred introduction backgrounds on Series, Blogs, Videos, About and Contact extend behind the shared navbar, with desktop/mobile header offsets. They still stop at each introductory section boundary.

Darkroom reveal trial: foreground photo cards, About portraits and detail photographs develop from dim/desaturated to full colour on first viewport entry (~1.15 seconds, slight staggering). It waits for image load, clears filters on completion, remembers developed image URLs during navigation/filtering, and honors reduced motion. Backgrounds, slideshow, small avatars, videos and lightbox are excluded. Implementation: assets/darkroom.js and assets/darkroom.css.

Theme toggle design changed from shutter aperture to a miniature CSS camera with a flash burst localized to the button. Flash peaks when the theme switches (270ms), ends at 600ms, and respects reduced motion.

Phase 1 approved complete on 2026-11-18. Phase 2 begins with Git initialization and publishing to a new GitHub repository named curiousdip. The approved HTML/CSS/JS implementation will be retained; Astro migration is deferred. GitHub account available through Git Credential Manager: arghac14.

Current CMS decision (2026-11-18): R2 only, replacing Cloudinary. Local admin/ folder is ignored and never deployed. Separate series/blog/video forms write the corresponding remote JSON arrays through GitHub Contents API. New photos are resized/compressed in browser, uploaded to R2 using server-side S3 signing, and public URLs are verified. Runtime credentials are memory-only; optional GitHub token or existing GCM sign-in. Blog HTML converts to plain text, preserving paragraphs/newlines. Drafts/blobs use IndexedDB. File SHA conflicts and publishId metadata support safe publishing/retries. A Pages workflow and allowlisted dist build are included. No live R2 credentials have been supplied or upload verified yet. Local JSON must be pulled after API commits.

R2 connection setup explicitly deferred by the user. Do not request or configure bucket credentials in this stage. GitHub Pages has been configured to use Actions. Admin tests pass with mocked remote writes; existing GitHub collection reads were verified. No sample content was published and no R2 upload was performed.

Dashboard added to the ignored local admin: auto-fetch all three remote JSON arrays, minimal previews, search, type/pin/Selected Stories/deleted filters, date/title/priority sorting, edit and quick flag/delete/restore actions. isDeleted is now a boolean in every sample row; deleted rows remain stored but are filtered before public rendering or numeric detail lookup. Selection limits supersede earlier values: 4 pins and 3 Selected Stories per type. pinOrder and selectedStoryOrder persist priority, new selections go first, the last selection is evicted if full, and exact evictions are reviewed before an atomic SHA-checked GitHub commit. Soft delete clears flags; restore leaves flags off. Initial sample arrays retain their first four pins and first three selections; all records and photos are retained. R2 configuration remains deferred.
