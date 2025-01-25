import { FreshContext } from "$fresh/server.ts";
import { formatUsername, normalizeUrl } from "../lib/util.ts";
import { fetchMetadata } from "../lib/ap.ts";
import { FxFediError } from "../lib/error.ts";

interface OEmbed {
  author_name?: string;
  author_url: string;
  provider_name: string;
  provider_url: string;
  title: string;
  type: string;
  version: "1.0";
}

export const handler = async (
  req: Request,
  ctx: FreshContext,
): Promise<Response> => {
  const rawUrl = ctx.url.searchParams.get("uri");
  if (rawUrl === null) {
    throw new FxFediError("No URI provided for oembed information");
  }
  const normalizedUrl = normalizeUrl(rawUrl);
  const metadata = await fetchMetadata(req, new URL(normalizedUrl));
  const res: OEmbed = {
    author_name: formatUsername(metadata.attribution, metadata.instance) ??
      metadata.attribution?.preferredName ?? undefined,
    author_url: (metadata?.attribution?.url ?? metadata?.url ?? normalizedUrl)
      .toString(),
    provider_name: metadata?.instance?.domain ?? metadata?.instance?.title ??
      metadata?.url?.hostname ?? normalizedUrl.hostname,
    provider_url: normalizedUrl.toString(),
    title: "Embed",
    type: "link",
    version: "1.0",
  };
  return new Response(
    JSON.stringify(res),
    {
      headers: { "content-type": "application/json" },
    },
  );
};
