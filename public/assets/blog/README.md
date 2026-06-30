# Blog images

Drop image files here and reference them from your posts with a **rooted path**
that starts with `/assets/blog/`.

## Cover image (card + top of post)

Add a `cover` line to the post's frontmatter:

```markdown
---
title: My post
date: 2026-07-15
excerpt: ...
cover: /assets/blog/my-cover.png
---
```

The cover shows full-bleed on the blog card (16:9) and above the article body.
Posts without a `cover` simply render without one. Recommended size: **1200×675**.

## Inline images

Standard Markdown works anywhere in the body:

```markdown
![Alt text describing the image](/assets/blog/my-figure.png)
```

For an image with a caption, use a figure (HTML is allowed in posts):

```html
<figure>
  <img src="/assets/blog/my-figure.png" alt="Alt text" />
  <figcaption>Your caption.</figcaption>
</figure>
```

## Tips

- Keep files reasonably small (export at ~1200px wide, compress PNG/JPG, or use
  WebP) so posts stay fast.
- Always write meaningful `alt` text for accessibility (leave it empty `alt=""`
  only for purely decorative covers).
- Images are served as-is from `/public` — committing a file and deploying is
  the only way to publish, same as the posts themselves.
