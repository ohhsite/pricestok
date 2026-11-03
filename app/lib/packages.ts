export const packages = {
  oneoff: { name: "Pakiet 30 dni", net: 5000, period: "30 dni" },
  quarter: { name: "Pakiet 3 miesiące", net: 13900, period: "3 miesiące" },
  halfyear: { name: "Pakiet 6 miesięcy", net: 24900, period: "6 miesięcy" },
  year: { name: "Pakiet 12 miesięcy", net: 44900, period: "12 miesięcy" },
  company: { name: "Wizytówka firmy", net: 19900, period: "12 miesięcy" },
} as const;
export type PackageId = keyof typeof packages;
