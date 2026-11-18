# CuriousDip conversations

Public comments appear on photo series and blog detail pages. Videos use a
compact like/sign-in row without a comment section; unique view tracking still
applies to all three types.

The portfolio stays on GitHub Pages. Firebase Authentication handles Google sign-in;
Firestore Standard stores likes, comments and unique views. No Cloud Functions, Cloud Storage,
or paid billing account is needed for this integration.

## Project

The existing project `curiousdip-59217` is connected. The registered web app is
`CuriousDip Portfolio`, and the `(default)` Firestore Standard database is in
Mumbai (`asia-south1`). Google sign-in, anonymous visitor sessions and the restrictive rules are deployed.
Billing was verified unlinked; the database reports `freeTier: true` and PITR
disabled. Google Analytics is not loaded by the portfolio.

The CLI and isolated Node runtime are in the ignored `admin/tools/` directory.
Run the CLI with:

```powershell
& 'admin/tools/node-v22.23.5-win-x64/node.exe' 'admin/tools/firebase-cli/node_modules/firebase-tools/lib/bin/firebase.js' --help
```

Authorized domains include `arghac14.github.io`, `localhost`, and `127.0.0.1`,
plus Firebase's project domains. Add the eventual custom domain to Authentication
authorized domains before using sign-in there. Web configuration is in
`assets/firebase-config.js`. Keep Spark billing, PITR disabled and billing
unlinked. Deploy Auth/Firestore only; portfolio hosting stays on GitHub Pages.

```powershell
& 'admin/tools/node-v22.23.5-win-x64/node.exe' 'admin/tools/firebase-cli/node_modules/firebase-tools/lib/bin/firebase.js' deploy --only firestore --project curiousdip-59217
```

## Data

- `stories/series-<numeric id>/likes/<firebase uid>`
- `stories/blog-<numeric id>/likes/<firebase uid>`
- `stories/video-<numeric id>/likes/<firebase uid>`
- Comments use the corresponding `stories/<key>/comments/<generated id>` path.
- Unique views use `stories/<key>/views/<anonymous browser uid>`, containing only
  a server timestamp. Each browser can create its record once; updates and
  deletion are denied. No Google login is needed to count a view.
- Likes store only a server timestamp. Comments store uid, Google display name,
  plain text (maximum 2,000 characters) and a server timestamp. No emails are
  stored in public documents.
- Public readers can view likes and comment pages (20 comments per request).
  Only verified Google users can create comments or their own like document.
  Comments are deletable by their author or the verified portfolio owner
  `01argha@gmail.com`, after inline confirmation. Other writes are denied.
- Names and comments are rendered with `textContent`, never as HTML.
- Interaction data is independent of GitHub JSON: deleting a story does not erase
  its Firebase discussion. Never reuse a published numeric ID for another story,
  or its old discussion would be attached to the replacement.

## Unique views

`CURIOUSDIP_FEATURES.showViews` in `assets/firebase-config.js` is **false**:
public view counts are hidden until the owner asks to enable them. This only
controls display; tracking remains active. The local admin dashboard always
shows views and likes independently of this flag.

The `curiousdip-views` Firebase app uses its own anonymous session with local
persistence, separate from Google sign-in for likes and comments. One browser
counts once per series, blog or video, regardless of reloads or Google sign-out.
Series/blog detail pages count on entry; video tiles count after at least 25% of
the tile enters the viewport. Homepage cards and listing thumbnails do not count.
Local HTTP previews only read counts and never create visitor accounts or views.
No device fingerprint or IP address is stored in view documents. Another browser,
cleared browser storage or a fresh private session can count as another visitor;
this is unique-browser measurement, not identification of a physical device.

## Loading and testing

The SDK loads asynchronously on a detail page or when a video is visible. Comment
pages load when a discussion approaches the viewport. Likes and views use
aggregation queries. There are no ongoing realtime listeners.
Visitors must use HTTP/HTTPS, not double-click `index.html`, for Google sign-in.
`node scripts/check-social.cjs` exercises account-bound like toggles, anonymous
restrictions, comment text safety, retained drafts on failure, deletion and cleanup
with a mocked backend. The official Firestore emulator tests in
`admin/check-firebase-rules.cjs` verify authorization and validation independently.
`node scripts/check-views.cjs` checks repeat/reload deduplication, independent
browser identities, per-story counters, visibility and read-only previews.
Live browser verification passed Google login, like/unlike, comment creation,
persistence after reload and deletion; the test comment and like were removed.
Run `npm run build` for the portfolio checks.

Firebase web config is public. Never include service-account keys, CLI tokens or
Cloudinary secrets in public assets. Restrictive deployed Firestore rules enforce
permissions; hiding configuration does not provide access control.
