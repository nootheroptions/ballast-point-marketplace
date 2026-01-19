/**
 * Subdomain routing utilities
 *
 * Handles extraction and mapping of subdomains to route groups.
 * Used by middleware to rewrite requests to the correct route group.
 */

/**
 * Map of subdomains to their corresponding route group paths.
 * Add new subdomains here as they are created.
 */
export const SUBDOMAIN_ROUTE_MAP: Record<string, string> = {
  providers: '/providers',
} as const;

/**
 * Subdomains that should be treated as the main domain (no rewriting).
 */
const MAIN_DOMAIN_SUBDOMAINS = ['www', ''];

/**
 * Extracts the subdomain from a hostname.
 *
 * @param hostname - The full hostname (e.g., "providers.domain.com" or "providers.localhost.com:3000")
 * @param appRootDomain - The app's root domain (e.g., "example.com" or "localhost.com")
 * @returns The subdomain or empty string if on main domain
 *
 * @example
 * getSubdomain("providers.example.com", "example.com") // "providers"
 * getSubdomain("example.com", "example.com") // ""
 * getSubdomain("providers.localhost.com:3000", "localhost.com") // "providers"
 */
export function getSubdomain(hostname: string, appRootDomain: string): string {
  // Remove port if present
  const hostnameWithoutPort = hostname.split(':')[0];
  const domainWithoutPort = appRootDomain.split(':')[0];

  if (hostnameWithoutPort.endsWith(`.${domainWithoutPort}`)) {
    const subdomain = hostnameWithoutPort.slice(0, -(domainWithoutPort.length + 1));
    return subdomain;
  }

  // Exact match means main domain
  if (hostnameWithoutPort === domainWithoutPort) {
    return '';
  }

  return '';
}

/**
 * Determines if a subdomain should be treated as the main domain.
 */
export function isMainDomain(subdomain: string): boolean {
  return MAIN_DOMAIN_SUBDOMAINS.includes(subdomain);
}

/**
 * Gets the route group path for a given subdomain.
 * Returns undefined if the subdomain should use the main domain routes.
 */
export function getRouteGroupForSubdomain(subdomain: string): string | undefined {
  if (isMainDomain(subdomain)) {
    return undefined;
  }
  return SUBDOMAIN_ROUTE_MAP[subdomain];
}
