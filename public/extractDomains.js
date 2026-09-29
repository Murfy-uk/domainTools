export const DEFAULT_EXCLUDE = ["dan.com"];

// One DNS label: letters/digits at both ends, hyphens allowed inside, max 63 chars.
const LABEL = "[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?";
const HOSTNAME = `(?:${LABEL}\\.)+[a-z]{2,63}`;

// - Lookbehind skips emails (user@foo.com), subdomain fragments and URL paths.
// - Scheme and "www." are matched but left out of the captured hostname.
// - Lookahead stops a match from ending partway through a longer hostname,
//   while still allowing trailing punctuation like "foo.com." or "(foo.com)".
const DOMAIN_REGEX = new RegExp(
  `(?<![@\\w./-])(?:https?://)?(?:www\\.)?(${HOSTNAME})(?![\\w-]|\\.[a-z0-9])`,
  "gi"
);

const VALID_DOMAIN_REGEX = new RegExp(`^${HOSTNAME}$`);

export function isValidDomain(value) {
  return (
    typeof value === "string" &&
    value.length <= 253 &&
    VALID_DOMAIN_REGEX.test(value)
  );
}

// Returns unique, lowercase domains in order of first appearance.
export function extractDomains(text, { exclude = DEFAULT_EXCLUDE } = {}) {
  const excluded = new Set(exclude.map((domain) => domain.toLowerCase()));
  const domains = new Set();

  for (const match of String(text).matchAll(DOMAIN_REGEX)) {
    const domain = match[1].toLowerCase();
    if (domain.length <= 253 && !excluded.has(domain)) {
      domains.add(domain);
    }
  }

  return [...domains];
}
