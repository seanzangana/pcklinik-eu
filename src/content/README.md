# News — how to write and publish a post

Posts are Markdown files in `src/content/news/`. Add a file, push, done —
Cloudflare Pages rebuilds and publishes. No CMS, no framework, and no build
dependency: `node build.mjs` reads the directory directly.

This mirrors the Nyheder setup on pcklinik.dk, so the two sites work the same
way. The only differences are the directory (`news` here, `nyheder` there) and
the language of the copy.

---

## Add a post

1. Create `src/content/news/<slug>.md`

   **The filename is the URL.** `how-to-choose-an-ssd.md` becomes
   `https://www.pcklinik.eu/news/how-to-choose-an-ssd/`. Lowercase letters,
   digits and hyphens only — no spaces, no accented characters. Never rename a
   file after it has been published; that breaks the link and any inbound
   traffic to it.

2. Start the file with frontmatter between two `---` lines:

```markdown
---
title: How to choose an SSD for your laptop
date: 2026-08-14
category: Guides
description: What actually matters when you upgrade — and what doesn't.
---

First paragraph goes here.

## A subheading

More text.
```

3. Preview locally with `npm run build`, then open `dist/news/<slug>/index.html`.

4. Commit and push to `main`. Cloudflare Pages builds and publishes automatically.

### Frontmatter fields

| Field | Required | Notes |
|---|---|---|
| `title` | yes | The headline. Also used in `<title>` and in the BlogPosting schema. |
| `date` | yes | `YYYY-MM-DD`. Controls ordering — newest first. |
| `category` | yes | Shown above the post, e.g. `Guides`. |
| `description` | yes | Meta description and the text on the index card. Keep it under ~155 characters, or Google truncates it. |
| `draft` | no | `draft: true` keeps the post off the site entirely — no page, no index card, no sitemap entry. |
| `image` | no | Path to a file in `public/`, e.g. `/images/macbook/air-m2-screen.jpg`. Rendered above the body and added to the schema. |

The build **fails** if a required field is missing or the date is malformed.
That is deliberate: a half-finished post should not be able to reach the site.

---

## Markdown that works

The renderer (`src/content/posts.mjs`) is a deliberately small, dependency-free
subset. Supported:

```markdown
## Heading 2             ### Heading 3
**bold**                 *italic*
`inline code`            [link text](/some-page/)

- bullet list            1. numbered list
> blockquote
```

Internal links take a leading and trailing slash: `[Mac Repair](/mac-repair/)`.

**Not supported:** tables, footnotes, nested lists, reference-style links,
fenced code blocks, images inside body text (use the `image` frontmatter field
for a header image instead).

Headings in the body start at `##`. The page `<h1>` is the frontmatter title,
so a `#` in the body would produce two h1s. A `#` heading is rendered as `<h2>`
for that reason rather than being rejected.

---

## How it fits together

```
src/content/news/*.md   ← the posts (normally the only thing you touch)
src/content/posts.mjs   ← frontmatter parser + Markdown → HTML + loader
build.mjs               ← unchanged renderers for /news/ and /news/<slug>/
```

`build.mjs` calls `loadNewsPosts(__dirname)` at the start of the build and uses
the result exactly as it used the old `src/data/news.js` array. Layout, internal
links, English UI and BlogPosting schema are unchanged — the three original
posts were migrated without touching a single slug, and the built pages are
content-identical to the pre-migration site.

If you outgrow the built-in renderer: `npm i marked` and replace the body of
`markdownToHtml()` with `return marked.parse(md)`. `loadNewsPosts()`'s return
shape is what `build.mjs` depends on, so nothing else changes.

**The Arabic section is unchanged.** `/ar/news/` is still driven by the
`AR_NEWS` array inside `build.mjs`. It was left alone deliberately — only the
English section moved to Markdown. If Arabic posts should move too, they need
their own directory (`src/content/ar-news/`) and a second `loadNewsPosts()`
call; until then, adding an Arabic post still means editing `build.mjs`.

---

## Later: n8n creating posts via the GitHub API

Because a post is just a file on `main`, any automation can publish by
committing one file. No webhook into the site, no API to maintain — Cloudflare
Pages builds on push.

In n8n, an **HTTP Request** node against GitHub's Contents API:

```
PUT https://api.github.com/repos/seanzangana/pcklinik-eu/contents/src/content/news/{{ $json.slug }}.md

Headers:
  Authorization: Bearer <GITHUB_TOKEN>
  Accept: application/vnd.github+json
  User-Agent: n8n

Body (JSON):
{
  "message": "New post: {{ $json.title }}",
  "branch": "main",
  "content": "<the whole file, base64-encoded>"
}
```

`content` must be the entire Markdown file — frontmatter and body — base64
encoded. In a Code node before the HTTP Request:

```js
const fm = [
  '---',
  `title: ${JSON.stringify($json.title)}`,
  `date: ${$json.date}`,
  `category: ${JSON.stringify($json.category || 'Guides')}`,
  `description: ${JSON.stringify($json.description)}`,
  '---',
  '',
].join('\n');
return [{ json: {
  slug: $json.slug,
  content: Buffer.from(fm + '\n' + $json.body, 'utf8').toString('base64'),
}}];
```

Practical notes:

- **Token:** a fine-grained personal access token with *Contents: read and
  write* on this repo only. Store it as an n8n credential, never inline.
- **Updating an existing post** needs the file's current `sha`. Fetch it with
  `GET .../contents/<path>` first and include it in the body. Without `sha`,
  GitHub rejects the call if the file exists — a useful guard against
  overwriting something by accident.
- **Have n8n write `draft: true`** if a human should read the post before it
  goes live. The site builds without it, and publishing is then a one-word edit.
- **Generate the slug in the Code node** rather than trusting the title:
  lowercase, hyphens, ASCII only.
- **Note the branch is `main`** on this repo, but `master` on pcklinik-dk. Easy
  thing to get wrong when copying a working n8n node between the two.
