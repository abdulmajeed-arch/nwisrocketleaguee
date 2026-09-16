const countries: Record<string, string> = {
  US: "United States",
  SA: "Saudi Arabia",
  SY: "Syria",
  AE: "United Arab Emirates",
  EG: "Egypt",
  JO: "Jordan",
  LB: "Lebanon",
  IQ: "Iraq",
  KW: "Kuwait",
  QA: "Qatar",
  BH: "Bahrain",
  OM: "Oman",
  YE: "Yemen",
  TR: "Türkiye",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  DE: "Germany",
  FR: "France",
  ES: "Spain",
  IT: "Italy",
  PT: "Portugal",
  NL: "Netherlands",
  BE: "Belgium",
  CH: "Switzerland",
  AT: "Austria",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  FI: "Finland",
  PL: "Poland",
  IN: "India",
  PK: "Pakistan",
  BD: "Bangladesh",
  PH: "Philippines",
  ID: "Indonesia",
  MY: "Malaysia",
  SG: "Singapore",
  JP: "Japan",
  KR: "South Korea",
  CN: "China",
  BR: "Brazil",
  AR: "Argentina",
  MX: "Mexico",
  CL: "Chile",
  CO: "Colombia",
  ZA: "South Africa",
  NG: "Nigeria",
  KE: "Kenya",
  MA: "Morocco",
  DZ: "Algeria",
  TN: "Tunisia",
  LY: "Libya",
  PS: "Palestine",
};

export function getCountryName(code: string | null | undefined) {
  if (!code) return "Unknown";

  const normalized = code.trim().toUpperCase();

  return countries[normalized] ?? normalized;
}

export function getCountryFlag(code: string | null | undefined) {
  if (!code) return "🌐";

  const normalized = code.trim().toUpperCase();

  if (!/^[A-Z]{2}$/.test(normalized)) {
    return "🌐";
  }

  return String.fromCodePoint(
    ...normalized
      .split("")
      .map((letter) => 127397 + letter.charCodeAt(0))
  );
}

export function formatNationality(code: string | null | undefined) {
  if (!code) return "Unknown";

  const normalized = code.trim().toUpperCase();

  return `${getCountryFlag(normalized)} ${normalized} — ${getCountryName(
    normalized
  )}`;
}