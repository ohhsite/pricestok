import test from "node:test";
import assert from "node:assert/strict";
import { comparisonPrice, housingOffers, housingPending, housingPages, inBudget, sortHousing, type HousingOffer } from "../app/lib/housing.ts";

test("budgets use the displayed package, not an apartment's headline price", () => {
  const offer = housingOffers.find(o => o.id === "polarna-10")!;
  assert.equal(offer.price, 499320);
  assert.equal(comparisonPrice(offer), 554320);
  assert.equal(inBudget(offer, "500"), false);
  assert.equal(inBudget(offer, "600"), true);
});
test("inclusive ceilings and strict over-600 boundary leave no gap", () => {
  const offer: HousingOffer = { ...housingOffers.find(o => o.id === "polarna-7")!, price: 545000 };
  assert.equal(comparisonPrice(offer), 600000);
  assert.equal(inBudget(offer, "600"), true);
  assert.equal(inBudget(offer, "600-plus"), false);
  assert.equal(inBudget({ ...offer, price: 545001 }, "600-plus"), true);
});
test("unknown mandatory extras never become zero in budget results", () => {
  for (const offer of housingPending) {
    assert.equal(comparisonPrice(offer), null);
    for (const page of housingPages) assert.equal(inBudget(offer, page.id), false);
  }
});
test("an included cellar isn't charged twice and optional parking is disclosed in the package", () => {
  const offer = housingOffers.find(o => o.id === "jagienki-b2-2")!;
  assert.equal(offer.storageIncluded, true);
  assert.equal(comparisonPrice(offer), 465260);
});
test("sorting by area and package cost does not mutate the source catalog", () => {
  const ids = housingOffers.map(o => o.id);
  const asc = sortHousing(housingOffers, "price-asc");
  const desc = sortHousing(housingOffers, "price-desc");
  assert.equal(asc[0].id, "polarna-7");
  assert.equal(desc[0].id, "jagienki-b1-53");
  assert.equal(sortHousing(housingOffers, "rooms-desc")[0].rooms, 4);
  assert.equal(sortHousing(housingOffers, "area-desc")[0].area, 79.91);
  assert.deepEqual(housingOffers.map(o => o.id), ids);
});
test("each SEO landing page has genuine offers, a unique URL and source provenance", () => {
  assert.equal(new Set(housingPages.map(p => p.path)).size, 5);
  for (const page of housingPages) assert.ok(housingOffers.some(o => inBudget(o, page.id)));
  assert.equal(new Set(housingOffers.map(o => o.id)).size, housingOffers.length);
  for (const offer of housingOffers) {
    assert.ok(new URL(offer.source).protocol === "https:");
    assert.equal(offer.checked, "2026-11-22");
  }
});
