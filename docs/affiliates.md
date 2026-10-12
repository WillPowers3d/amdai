# Affiliate links

This site uses **three** affiliate programs only:

| Program | Env var | What it wraps |
| --- | --- | --- |
| Amazon Associates | `AMAZON_ASSOCIATE_TAG` (optional override) | amazon.com links (`?tag=`). Public default in YAML: `amdainet-20` |
| Rakuten Advertising | `RAKUTEN_PUBLISHER_ID` plus a per-merchant MID | Newegg today (`RAKUTEN_MID_NEWEGG`) |
| B&H | `BHPHOTO_AFFILIATE_ID` | bhphotovideo.com, via template or query param |

There is **no** `MICROCENTER_AFFILIATE_ID` or `AMD_AFFILIATE_ID`. Micro Center and the AMD Store stay as plain “also available at” links with tracking parameters stripped.

Never commit IDs. Put them in the environment (or a local `.env` that is gitignored) and rebuild. If an ID is missing, the `/go/…` route still works — it sends the visitor to the plain retailer URL.

## Amazon Associates

1. Join [Amazon Associates](https://affiliate-program.amazon.com/).
2. The public default tag is **`amdainet-20`** in `src/data/retailers.yaml` (`default_id`). It is not a secret.
3. Set `AMAZON_ASSOCIATE_TAG` only if you need to override that default at build time.
4. Required public wording — **As an Amazon Associate I earn from qualifying purchases.** — lives on `/disclosure`, next to every buy-button group, and in the footer. Do not shorten it away.
5. Amazon links use `rel="sponsored nofollow noopener"`. Never display a live or stale price (Amazon Operating Agreement). Buttons say “Check price.”

## Rakuten Advertising (Newegg, and later merchants)

Newegg is a Rakuten merchant. We do **not** use a Newegg-native affiliate id.

1. Join [Rakuten Advertising](https://rakutenadvertising.com/) and apply to Newegg (and any later merchant).
2. Set `RAKUTEN_PUBLISHER_ID` to your publisher / site id (the `id=` on a LinkSynergy deep link).
3. Set `RAKUTEN_MID_NEWEGG` to Newegg’s merchant id from the Rakuten dashboard. Do not guess a MID.
4. When both are set, destination URLs become:

   `https://click.linksynergy.com/deeplink?id={RAKUTEN_PUBLISHER_ID}&mid={RAKUTEN_MID_NEWEGG}&murl={encoded destination}`

The builder in `src/lib/affiliates.ts` (`buildRakutenDeepLink`) is generic. To add another Rakuten advertiser later:

1. Add a retailer row in `src/data/retailers.yaml` with `program: rakuten` and a new `rakuten_mid_env` (for example `RAKUTEN_MID_EXAMPLE`).
2. Add destination URLs on products.
3. Set that MID in the environment.

If the publisher id or the MID is unset, Newegg (or that merchant) falls back to a plain `newegg.com` link.

## B&H

B&H has run its own program and has also paid through networks. Keep the wrapper configurable.

1. Join the current B&H affiliate program (or the network they point you to).
2. Set `BHPHOTO_AFFILIATE_ID`.
3. Prefer `BHPHOTO_LINK_TEMPLATE` if the program gives you a wrapper URL. Placeholders: `{url}`, `{murl}` (URL-encoded destination), `{id}`.
4. If no template is set, we append `BHPHOTO_QUERY_PARAM` (default `BI`) `= BHPHOTO_AFFILIATE_ID`. Override the param name when the program docs say to.

## What we do not use

- Impact/CJ/ShareASale IDs except insofar as you encode one inside `BHPHOTO_LINK_TEMPLATE`.
- Micro Center affiliate tags.
- AMD Store affiliate tags.
- Anything below the three programs above.

## Files

| File | Role |
| --- | --- |
| `src/data/retailers.yaml` | Retailer list + Rakuten deeplink base |
| `src/data/products.yaml` | Search / official URLs, no prices |
| `src/lib/affiliates.ts` | Wrappers + `/go` resolver |
| `src/pages/go/[retailer]/[product].astro` | Static redirect |
| `src/components/BuyButtons.astro` | “Check price” buttons |
| `src/pages/disclosure.astro` | Public disclosure |
| `.env.example` | Env names only |

Buy buttons use `rel="sponsored nofollow noopener"` on affiliate programs and `rel="noopener"` on plain links. Optional click ping: `AFFILIATE_CLICK_BEACON` (POST JSON `{ retailer, product, t }`). Unset means no tracking.

## Public disclosure

`/disclosure` must keep:

- The Amazon Services LLC Associates Program paragraph (required Associates wording).
- A general FTC note that we may earn a commission from Amazon, Rakuten (Newegg), and B&H.
- An explicit statement that Micro Center and AMD Store are not affiliate links.
