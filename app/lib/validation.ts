import { categories, today } from "./data";
export function validatePurchase(d: any) {
  if (!d || typeof d !== "object") return "Nieprawidłowe zgłoszenie.";
  for (const k of [
    "company",
    "title",
    "summary",
    "conditions",
    "source",
    "address",
    "badge",
  ])
    if (
      typeof d[k] !== "string" ||
      d[k].trim().length < 2 ||
      d[k].length > 4000
    )
      return "Uzupełnij nazwę, tytuł, adres, opis, warunki i link.";
  if (d.title.length > 200 || d.company.length > 150 || d.summary.length > 300)
    return "Skróć tytuł, nazwę firmy lub krótki opis.";
  try {
    const u = new URL(d.source);
    if (!["https:", "http:"].includes(u.protocol))
      return "Podaj poprawny link do oferty.";
  } catch {
    return "Podaj poprawny link do oferty.";
  }
  if (!categories.some((c) => c.id === d.category)) return "Wybierz kategorię.";
  if (
    !Array.isArray(d.days) ||
    !d.days.length ||
    d.days.some((x: any) => !Number.isInteger(x) || x < 0 || x > 6)
  )
    return "Wybierz dni obowiązywania.";
  if (
    d.end &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(d.end) ||
      d.end < today() ||
      Number.isNaN(Date.parse(d.end)) ||
      new Date(d.end + "T12:00:00Z").toISOString().slice(0, 10) !== d.end)
  )
    return "Data końcowa nie może być w przeszłości.";
  if (!d.confirmed) return "Potwierdź warunki zamówienia.";
  return null;
}
