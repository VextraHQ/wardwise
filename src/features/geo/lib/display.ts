const ROMAN_NUMERAL_RE =
  /^(?=[MDCLXVI])(M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3}))$/i;

const UPPERCASE_TOKENS = new Set([
  "FCT",
  "INEC",
  "LGA",
  "LGA'S",
  "PVC",
  "NIN",
  "PU",
  "PUS",
  "RA",
]);

function formatWordPart(part: string): string {
  if (!part) return part;

  if (ROMAN_NUMERAL_RE.test(part)) {
    return part.toUpperCase();
  }

  if (UPPERCASE_TOKENS.has(part.toUpperCase())) {
    return part.toUpperCase();
  }

  if (/^\d+$/.test(part)) {
    return part;
  }

  const lower = part.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function formatWord(word: string): string {
  return word
    .split(/([/'-])/)
    .map((part) => {
      if (part === "/" || part === "'" || part === "-") return part;
      return formatWordPart(part);
    })
    .join("");
}

/**
 * Formats canonical geo names for UI display while preserving the stored source
 * value in the database. Useful for official INEC data that is often uppercase.
 */
export function formatGeoDisplayName(name: string | null | undefined): string {
  if (!name) return "";

  return name
    .trim()
    .split(/\s+/)
    .map((word) => {
      const trailingDot = word.endsWith(".");
      const core = trailingDot ? word.slice(0, -1) : word;
      const formatted = formatWord(core);
      return trailingDot ? `${formatted}.` : formatted;
    })
    .join(" ");
}
