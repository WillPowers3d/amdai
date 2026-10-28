# Affiliate links

This site uses **three** affiliate programs only:

| Program | Env var | What it wraps |
| --- | --- | --- |
| Amazon Associates | `AMAZON_ASSOCIATE_TAG` (optional override) | amazon.com links (`?tag=`). Public default in YAML: `amdainet-20` |
| Rakuten Advertising | `RAKUTEN_PUBLISHER_ID` (Link Locator token) plus a per-merchant MID | Newegg today (`RAKUTEN_MID_NEWEGG`) |
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

Public account values live in `src/data/retailers.yaml` under `rakuten`:

| Field | Value | What it is |
| --- | --- | --- |
| `rakuten.site_name` | `amdainet` | Rakuten Advertising account / site name |
| `rakuten.sid` | `4763021` | Public Site ID (SID) |

Those two are **not** enough to wrap a Newegg URL.

Rakuten deep links look like:

`https://click.linksynergy.com/deeplink?id=…&mid=…&murl=…`

- `id` is an **encrypted publisher token** from the Rakuten Link Locator. It is not the SID. Store that token in `RAKUTEN_PUBLISHER_ID` when you have it. Do not put SID `4763021` in `id=`. The wrapper refuses that swap if someone tries it.
- `mid` is the advertiser merchant ID. For Newegg that is `RAKUTEN_MID_NEWEGG`, filled only after Newegg approves the site. Do not guess a MID.

Until both env vars are set, Newegg buttons stay plain `newegg.com` links (still labeled “Also at” / “Check price”, not wrapped).

Setup once you have the missing pieces:

1. Join [Rakuten Advertising](https://rakutenadvertising.com/) (account/site name `amdainet`, SID `4763021` is already recorded).
2. Apply to Newegg. Wait for approval — do not invent a MID.
3. In Link Locator, copy the encrypted publisher `id` token from a generated deep link. Set `RAKUTEN_PUBLISHER_ID` to that token.
4. Set `RAKUTEN_MID_NEWEGG` to Newegg’s merchant id from the dashboard.
5. Rebuild. Destination URLs become:

   `https://click.linksynergy.com/deeplink?id={RAKUTEN_PUBLISHER_ID}&mid={RAKUTEN_MID_NEWEGG}&murl={encoded destination}`

The builder in `src/lib/affiliates.ts` (`buildRakutenDeepLink`) is generic. To add another Rakuten advertiser later:

1. Add a retailer row in `src/data/retailers.yaml` with `program: rakuten` and a new `rakuten_mid_env` (for example `RAKUTEN_MID_EXAMPLE`).
2. Add destination URLs on products.
3. Set that MID in the environment after the merchant approves you.

If the publisher token or the MID is unset, Newegg (or that merchant) falls back to a plain `newegg.com` link.

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
| `src/data/retailers.yaml` | Retailer list, Amazon default tag, public Rakuten `site_name` / `sid`, deeplink base |
| `src/data/products.yaml` | Search / official URLs, no prices |
| `src/lib/affiliates.ts` | Wrappers + `/go` resolver |
| `src/pages/go/[retailer]/[product].astro` | Static redirect |
| `src/components/BuyButtons.astro` | “Check price” buttons |
| `src/components/NextStepBuyBox.astro` | Honest next-step box on /can-run and /compare/one-vs-two-gpu |
| `src/lib/upgrade-pick.ts` | Build-time pick from the can-run verdict matrix |
| `src/pages/disclosure.astro` | Public disclosure |
| `.env.example` | Env names only |

Buy buttons use `rel="sponsored nofollow noopener"` on affiliate programs and `rel="noopener"` on plain links. Optional click ping: `AFFILIATE_CLICK_BEACON` (POST JSON `{ retailer, product, src, t }`). Unset means no tracking.

`/go/{retailer}/{product}` links may carry `?src=` so clicks can be attributed. Tokens are `[a-z0-9-]+`. The can-run next-step box uses `src=canrun-nextstep` (alt links `src=canrun-nextstep-alt`). The footer Check-price box on those pages uses `src=canrun-footer`. The one-vs-two-GPU page uses `src=one-vs-two`.

Newegg-first button order is gated by `NEWEGG_FIRST`. Leave it unset or `0` until Rakuten Newegg deep links are wired — Amazon stays first, matching today’s live order.

## Public disclosure

`/disclosure` must keep:

- The Amazon Services LLC Associates Program paragraph (required Associates wording).
- A general FTC note that we may earn a commission from Amazon, Rakuten (Newegg), and B&H.
- An explicit statement that Micro Center and AMD Store are not affiliate links.
