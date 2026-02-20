// Mapping between full ABS state names (lowercase) and 2-3 letter state codes (UPPERCASE)
export const STATE_NAME_TO_CODE: Record<string, string> = {
  "new south wales": "NSW",
  victoria: "VIC",
  queensland: "QLD",
  "south australia": "SA",
  "western australia": "WA",
  tasmania: "TAS",
  "northern territory": "NT",
  "australian capital territory": "ACT",
};

export const STATE_CODE_TO_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_NAME_TO_CODE).map(([k, v]) => [v, k]),
);

export function mapNameToCode(name: string | undefined): string | undefined {
  if (!name) return undefined;
  const key = name.trim().toLowerCase();
  return STATE_NAME_TO_CODE[key];
}

export function mapCodeToName(code: string | undefined): string | undefined {
  if (!code) return undefined;
  return STATE_CODE_TO_NAME[code];
}

export default {
  STATE_NAME_TO_CODE,
  STATE_CODE_TO_NAME,
  mapNameToCode,
  mapCodeToName,
};
