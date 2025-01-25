// @deno-types="npm:@types/html-to-text"
import { compile as compileHtmlConverter } from "html-to-text";
import { AttributionMetadata, InstanceMetadata } from "./ap.ts";

const urlRegex = /^https?:\/\/.+/i;
const garbledUrlRegex = /^(http(?<secure>s)?:\/{1,2})/i;

/**
 * Normalize a potentially garbled URL to one that can be worked with correctly
 * @param url The URL to normalize
 */

export function normalizeUrl(url: string) {
  const schema = url.match(garbledUrlRegex);
  if (schema !== null) {
    const secure = schema.groups?.secure === "s";
    url = url.replace(garbledUrlRegex, secure ? "https://" : "http://");
  }

  return new URL(urlRegex.test(url) ? url : "http://" + url);
}

export function domainIsValid(url: URL): boolean {
  // Make sure that the given domain is at least plausibly real
  const sussyTlds = ["ico", "html", "php", "css", "png", "jpg", "jpeg", "html"];
  const { hostname } = url;
  return !(!hostname.includes(".") ||
    sussyTlds.some((tld) => hostname.endsWith(tld)));
}

export const htmlToText = compileHtmlConverter({
  selectors: [{ selector: "a", options: { ignoreHref: true } }],
  wordwrap: false,
});

export function formatUsername(
  attribution: AttributionMetadata | null,
  instance: InstanceMetadata | null,
) {
  if (attribution?.preferredName && instance) {
    return `@${attribution.preferredName}@${instance.domain}`;
  } else return null;
}
