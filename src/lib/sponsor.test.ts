import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { documentTitle, isSitemapExcluded, pageDescription, shouldNoindex } from './seo';
import { pageJsonLd, personJsonLdHits } from './jsonld';
import {
  SPONSOR_BOOKINGS,
  SPONSOR_LABEL,
  SPONSOR_PATH,
  SPONSOR_PAYMENT_URL_ENV,
  SPONSOR_RATES,
  SPONSOR_SLOTS,
  assertSponsorValid,
  digestSponsoredMention,
  sponsorMailto,
  sponsorPaymentUrl,
} from './sponsor';
import { REQUIRED_FOOTER_HREFS } from './trust';

const here = dirname(fileURLToPath(import.meta.url));

describe('sponsor slots', () => {
  it('lists four AMD/Radeon slots, hides empty payment, and stays labeled Sponsored', () => {
    assert.deepEqual(assertSponsorValid(), []);
    assert.equal(SPONSOR_SLOTS.length, 4);
    assert.deepEqual(
      SPONSOR_SLOTS.map((slot) => slot.id),
      ['home-banner', 'gpus-featured', 'backends-featured', 'newsletter-mention'],
    );
    assert.equal(SPONSOR_BOOKINGS.length, 0);
    assert.equal(digestSponsoredMention(), null);
    assert.equal(SPONSOR_LABEL, 'Sponsored');
    assert.match(SPONSOR_RATES, /contact for rates/i);
    assert.equal(sponsorPaymentUrl(''), null);
    assert.equal(sponsorPaymentUrl('https://example.com/pay'), 'https://example.com/pay');
    assert.equal(SPONSOR_PAYMENT_URL_ENV, 'SPONSOR_PAYMENT_URL');
    assert.equal(sponsorMailto(), 'mailto:amdai@mail.grokbot.com?subject=AMDai%20sponsorship');
    assert.ok(REQUIRED_FOOTER_HREFS.includes(SPONSOR_PATH));
  });

  it('has SEO, no Person JSON-LD, and is wired on home, /gpus, /backends, and the digest form', () => {
    assert.equal(shouldNoindex(SPONSOR_PATH), false);
    assert.equal(isSitemapExcluded(SPONSOR_PATH), false);
    assert.ok(documentTitle(SPONSOR_PATH).endsWith(' · AMDai'));
    assert.match(pageDescription(SPONSOR_PATH), /Sponsored/);
    assert.match(pageDescription(SPONSOR_PATH), /contact for rates/i);
    const ld = pageJsonLd({
      pathname: SPONSOR_PATH,
      title: documentTitle(SPONSOR_PATH),
      description: pageDescription(SPONSOR_PATH),
    });
    assert.equal(personJsonLdHits(ld).length, 0);
    assert.ok(ld.some((node) => node['@type'] === 'TechArticle' || node['@type'] === 'WebPage'));
    const home = readFileSync(join(here, '../pages/index.astro'), 'utf8');
    assert.match(home, /SponsoredSlot/);
    assert.match(home, /home-banner/);
    assert.match(home, /NewsletterSignup/);
    const gpus = readFileSync(join(here, '../components/GpuDirectory.astro'), 'utf8');
    assert.match(gpus, /SponsoredSlot/);
    assert.match(gpus, /gpus-featured/);
    const backends = readFileSync(join(here, '../pages/backends/index.astro'), 'utf8');
    assert.match(backends, /SponsoredSlot/);
    assert.match(backends, /backends-featured/);
    const nl = readFileSync(join(here, '../components/NewsletterSignup.astro'), 'utf8');
    assert.match(nl, /Sponsored/);
    assert.match(nl, /\/sponsor/);
    const guide = readFileSync(join(here, '../pages/guides/buying-used-radeon.astro'), 'utf8');
    assert.match(guide, /NewsletterSignup/);
  });
});
