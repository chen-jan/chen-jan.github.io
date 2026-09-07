# chen-jan.github.io

Personal website of Jan Chen, published with GitHub Pages at https://chen-jan.github.io.

The site is plain static HTML. `index.html` is the live homepage (the Academic design).
`minimal.html` is an unlinked alternate design kept as a backup. Both are generated
files: edit the sources in `src/`, then rebuild.

## Editing the words

**`src/content/shared.html`** is the single source for research, experience, projects,
scholarship outreach, piano, and the support sentence. An edit here appears in both
designs. Find the block between `<!-- BEGIN research -->` and `<!-- END research -->`,
for example, and change the text inside the HTML tags. Keep those boundary comments.

Wording unique to one design lives in its template:

- Academic (the live site): `src/templates/academic.html`
- Minimal (backup): `src/templates/minimal.html`

Keep the `{{ research }}` and other `{{ ... }}` placeholders; they pull in shared copy.

| What you want to change | Where |
| --- | --- |
| Paper titles, authors, venues, links | `src/content/shared.html`, `BEGIN research` |
| Employers, roles, dates, Spring Weeks | same file, `BEGIN experience` |
| Project descriptions, images, demo link | same file, `BEGIN building` |
| Scholarship initiative story, totals | same file, `BEGIN scholarships` |
| Piano story, orchestra/masterclass links, YouTube URL | same file, `BEGIN music` |
| Scholarship support sentence | same file, `BEGIN support` |
| Academic bio, sidebar links, section titles, nav labels | `src/templates/academic.html` |
| Name, portrait, page title, search description | each template (`h1`, portrait `img`, `title`, description meta) |
| Fonts, spacing, colours, image sizes | `assets/portfolio.css` (Academic) or `assets/minimal.css` (Minimal) |
| Theme and collapse behaviour | `assets/portfolio.js` or `assets/minimal.js` |

Small HTML reminders: `<p>` is a paragraph, `<strong>` is bold,
`<a href="URL">label</a>` is a link, and `&amp;` is an ampersand inside URLs.
Keep tags balanced and keep IDs, `data-panel`, and `aria-controls` unchanged.
The internal section keys `building` and `music` mean Projects and Piano.

## Images

Site images live in `assets/`. To replace one, drop the new file in `assets/`, then
update the `src`, `width`, `height`, and `alt` in the shared content or template.
Use the image's real pixel dimensions; CSS sets the displayed size. Keep files small
so the page loads fast on mobile. Attribution for logos and icons is in
`src/content/ASSETS.md`.

## Preview, build, publish

From the repository root:

```sh
python3 src/serve.py       # preview at http://127.0.0.1:4173, re-renders on refresh
python3 src/build.py       # regenerate index.html and minimal.html, check local links
node --test src/tests/     # optional: behaviour tests for the Minimal design
```

Then commit and push to `main`. GitHub Pages serves the repository root, so the site
updates within a minute or two of the push. Always run the build before committing so
the generated pages match the sources.

## Layout

```
index.html        generated homepage (Academic)
minimal.html      generated backup design, not linked from the homepage
assets/           CSS, JS, images used by the site
src/content/      shared copy used by both designs
src/templates/    per-design page skeletons
src/*.py          render, build, and preview scripts
src/tests/        Minimal design tests
.nojekyll         tells GitHub Pages to serve the files as-is
_local/           gitignored: raw source material and old design notes (never published)
```
