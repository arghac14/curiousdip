# CuriousDip — portfolio data template

Static HTML, CSS and JavaScript portfolio for Arghadip Chakraborty. Dark theme by default, with responsive layouts and a light-theme toggle.

## Run and refresh

- `npm run dev` — refresh the preset index/snapshot, then serve at http://127.0.0.1:4321/.
- `npm run photos` — rescan preset folders and refresh direct-file preview data after adding/removing images or editing JSON.
- `npm run check` — regenerate data and validate syntax, schema, mapping and both loading modes.
- Double-click `index.html` for a direct-file preview. It uses the generated snapshot. YouTube embeds require HTTP; direct-file mode links to YouTube instead.

The included local server rescans preset folders on every reload, so you can add, remove or rename photos and simply refresh. Other static servers, direct-file previews and GitHub Pages use the generated index: run `npm run photos` after folder changes and before sharing/deploying. Static browsers cannot enumerate asset directories; the generator does this locally. No runtime server API is required.

## Directory layout

```text
assets/
  preset/
    displaypictures/
      01-arghadip.png
      # Add 02-about.png and 03-about.png here later.
    homeBgSlideShows/
      01-festival-colours.png
  dynamic/
    sample-portrait.svg
    sample-landscape.svg
data/
  photoseries.json
  blog.json
  videos.json
  profile.json
  presets.json       # Generated folder index; do not edit.
  preview-data.js    # Generated direct-file snapshot; do not edit.
```

Preset images require no hand-written captions or JSON entries. Supported formats: JPG/JPEG, PNG, WebP, AVIF, GIF, SVG. The first image in natural alphabetical filename order becomes the DP; all remaining images supply About. Any filenames work; numeric prefixes are optional. The example names below are not required. Keep home backgrounds landscape. These are supplied assets, independent of content JSON.

`assets/dynamic/` contains local fallback/sample images. Dynamic content normally uses HTTPS image links from JSON, initially Cloudinary and later R2; local `assets/dynamic/...` paths also work. Broken or missing photos fall back to the local placeholder. The included Unsplash photos and YouTube films are sample content, not Arghadip's work.

## Page data mapping

| UI | Source and selection |
| --- | --- |
| Home DP and blog author avatar | First image in `displaypictures`, in filename order |
| About's three alternating rows | Remaining display pictures in filename order, cycling as needed; reuse the DP until more are supplied |
| Landing background | At initial load, randomly assign one `homeBgSlideShows` image to each page and preload/decode the chosen images. Reuse each page’s loaded background throughout navigation; reassign on full reload |
| Home foreground slideshow | First photo of each pinned photo series, in JSON array order; up to four; rotates every three seconds |
| Selected Stories: Photo Series | First three series with `isSelectedStories: true` |
| Selected Stories: Blogs | First three blogs with `isSelectedStories: true` |
| Selected Stories: Videos | First three videos with `isSelectedStories: true` |
| Series and blog indexes | All respective JSON entries; up to four pinned first, then remaining entries; search and visitor sorting |
| Series genre filters | `genres` array; a series can belong to multiple fixed genres |
| Series detail | `#/series/{id}`: title, subtext and photos in array order, four per desktop row |
| Blog detail | `#/blogs/{id}`: title, first three photos, text, fourth photo, text, fifth photo |
| Videos | All videos, one YouTube embed per row with title and subtext |
| About text and contact values | `profile.json` |

Every content file is a JSON **array of objects**. IDs are stable positive integers, unique within each file. Keep existing IDs when editing, because links use them. Optional pinOrder and selectedStoryOrder fields determine the order of active selections. The admin puts new selections first and renumbers the remaining selections. Array order is the fallback when these fields are absent. `isPinned` and `isSelectedStories` are independent booleans. Select no more than four pins per collection. Fewer than three selections show fewer cards.

The first photo is the thumbnail/cover. Frames are 4:5: portraits fill and crop centrally; landscapes fit on white. DP images use a circular crop. Plain text is escaped, never interpreted as HTML.

## Photo series template — data/photoseries.json

```json
[
  {
    "id": 1,
    "title": "A festival in colour",
    "subtext": "Small moments inside a day of celebration.",
    "photos": [
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1800&q=85",
      "assets/dynamic/sample-portrait.svg"
    ],
    "genres": ["Festival", "Documentary"],
    "isDeleted": false,
    "isPinned": true,
    "isSelectedStories": true,
    "createdAt": "2026-11-18T12:00:00Z"
  }
]
```

Fixed genres: `Festival`, `Street`, `Travel`, `Portraits`, `Documentary`. Preserve exact spelling; multiple values are supported.

## Blog template — data/blog.json

```json
[
  {
    "id": 9,
    "title": "The art of paying attention",
    "subtext": "Learning to look a little closer.",
    "content": "First paragraph.\n\nSecond paragraph.\n\nThird paragraph.\n\nFourth paragraph.",
    "photos": [
      "assets/dynamic/sample-portrait.svg",
      "assets/dynamic/sample-portrait.svg",
      "assets/dynamic/sample-portrait.svg",
      "assets/dynamic/sample-landscape.svg",
      "assets/dynamic/sample-portrait.svg"
    ],
    "isDeleted": false,
    "isPinned": true,
    "isSelectedStories": true,
    "createdAt": "2026-11-18T12:00:00Z"
  }
]
```

Blog `content` is plain text for now. Separate paragraphs with `\n\n`. The provisional renderer places the first three photos together, divides the paragraphs into two groups, inserts photo four between them and photo five after them. Additional photos follow. Final rich-text structure and automatic distribution will be designed during the CMS stage. Blogs have no genre field.

## Video template — data/videos.json

```json
[
  {
    "id": 1,
    "title": "Big Buck Bunny",
    "subtext": "A sample film for the video layout.",
    "video": "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    "isDeleted": false,
    "isPinned": true,
    "isSelectedStories": true,
    "createdAt": "2026-11-18T12:00:00Z"
  }
]
```

Use HTTPS YouTube watch, youtu.be, shorts or embed URLs. Only YouTube IDs are extracted; arbitrary embed HTML is not accepted. `isPinned` is retained for CMS consistency; the video page currently follows array order. This stage has no publishing integration or credentials.

## Other behavior

The contact form opens a prepared email draft; visitors review and send from their email app. It does not automatically send mail. Slideshow autoplay pauses when hidden or manually paused; reduced-motion users start paused. Search indexes title, overview, article text and series genres. Pinned items retain their array order while sorting applies to remaining matches.

See `ROADMAP.md` for GitHub Pages, the separate CMS, Cloudinary and the later Cloudflare R2 migration.


## Local admin and deployment

Cloudinary is the selected photo storage provider. A local-only authoring panel lives in the ignored admin/ directory. Start it with npm run admin and open http://127.0.0.1:4322/. It has forms for series, blogs and videos, browser compression, Cloudinary uploads and GitHub JSON commits. Its local README has connection instructions. The admin directory is deliberately absent from this public repository; back it up separately.

New blog HTML is converted to plain text with paragraph/newline breaks. Videos use validated YouTube URLs. Cloudinary credentials and optional upload-preset/folder settings are read from the ignored admin/secrets.json file; the helper never exposes them to the browser. GitHub may use the existing Git Credential Manager sign-in. After GitHub confirms a submission, the form resets and shows a receipt with deployment status. The helper also attempts a safe fast-forward pull and refreshes the local preview snapshot; a local sync failure is reported separately from a successful remote commit.

npm run build validates the portfolio, regenerates preset indexes/snapshots and copies only index.html, assets/ and data/ into dist/. The GitHub Pages workflow runs on pushes to main, including admin-generated JSON commits, and deploys dist/. GitHub repository settings must use GitHub Actions as the Pages source. No deployed backend is required for this local admin upload flow.


## Dashboard, flags and soft deletion

The ignored local admin includes a minimal dashboard that fetches all three collections from GitHub, previews entries, searches title/overview/blog content, sorts by date/title/selection order, and filters by type, pin, Selected Stories and deleted status. Quick actions edit, pin, select, soft-delete or restore an item.

Every record has isDeleted (false by default). Deleted records remain in their original JSON array with all text and photo URLs intact, but the public adapter excludes them from all listings, Home, videos and detail routes. Deleting clears its pin and Selected Stories flags; restoring leaves those flags off. Cloud media is never automatically deleted.

Limits are FOUR active pins and THREE active Selected Stories per content type. Pinning/selecting a new item gives it first priority. If full, the final item by saved pinOrder/selectedStoryOrder is automatically unflagged in the same GitHub commit. The review dialog names every replacement before confirmation, and file SHA checks prevent a stale preview from overwriting a newer change. The same rules apply to publishing through the editor.

## Conversations and unique views

Photo Series, Blogs and Videos show up to eight results per page. Search, genre filters and sorting apply to the entire collection before pagination. Changing these controls resets to page one; the `page` query parameter in the hash URL preserves the current page on reload. Pagination appears only when there is more than one page. Home's Selected Stories rows are unchanged.

Videos use the same thumbnail cards on Home and the Videos page, with three cards
per desktop row and responsive smaller grids. The Videos search matches titles
and overviews. Play buttons and titles open the YouTube watch URL directly;
phones can hand the link to the YouTube app when installed and permitted by the
device's link preferences, otherwise the web player opens.

Google sign-in, likes and comments use Firebase while the portfolio stays on GitHub Pages. Unique-browser view tracking remains active, but the public counter is disabled with `CURIOUSDIP_FEATURES.showViews: false` in `assets/firebase-config.js`. Do not enable it until requested. The local admin dashboard shows per-item views and likes; use Refresh content & counts for current totals. See [FIREBASE.md](FIREBASE.md) for setup, security rules, tracking behavior and tests.

The initial loading illustration uses an a6700-style mirrorless camera with an interchangeable lens that docks and twists into its mount. It follows light/dark themes and reduced-motion preferences.
