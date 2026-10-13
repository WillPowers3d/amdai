# Deploy notes — amdai.net

Static `dist/` on a Vultr VPS behind Caddy. This file is cache-header guidance only. Do not change DNS from here.

Hashed files under `/_astro/` and self-hosted fonts are content-addressed. They can live at the browser for a year. HTML must revalidate so a new build is visible the same day.

```caddy
amdai.net {
	root * /var/www/amdai/dist
	encode gzip zstd
	file_server

	@hashed path /_astro/*
	header @hashed Cache-Control "public, max-age=31536000, immutable"

	@fonts path /fonts/*
	header @fonts Cache-Control "public, max-age=31536000, immutable"

	@og path /og/*
	header @og Cache-Control "public, max-age=86400"

	@html path *.html /
	header @html Cache-Control "public, max-age=0, must-revalidate"
}
```

`/pagefind/` can use a one-day cache. Do not put a year-long cache on `/index.html` or sitemap files.

OG images stay PNG for social crawlers. In-page images, when added, must ship AVIF/WebP with a PNG/JPEG fallback, explicit `width`/`height`, and `loading="lazy"` below the fold.
