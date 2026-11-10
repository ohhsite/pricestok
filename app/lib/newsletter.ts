export const newsletterConsentVersion = "2026-11-10";
export const newsletterConsent = "Zgadzam się na otrzymywanie od PriceStok wiadomości e-mail o imprezach, wydarzeniach i lokalnych ofertach w Białymstoku. Zgodę mogę wycofać w każdej chwili.";
export function validNewsletterEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 254 && /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(value);
}
