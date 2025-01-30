import { FreshContext } from "$fresh/server.ts";
import { formatUsername, normalizeUrl } from "../lib/util.ts";
import { fetchMetadata } from "../lib/ap.ts";

interface OEmbed {
  author_name?: string;
  author_url: string;
  provider_name: string;
  provider_url: string;
  title: string;
  type: string;
  version: "1.0";
}

async function getOembed(req: Request, rawUrl: string | null): Promise<OEmbed | null> {
  if (rawUrl === null) {
    return null;
  }
  const normalizedUrl = normalizeUrl(rawUrl);
  if (normalizedUrl == null) {
    return null;
  }
  const metadata = await fetchMetadata(req, new URL(normalizedUrl));
  return {
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
}

export const handler = async (
  req: Request,
  ctx: FreshContext,
): Promise<Response> => {
  const rawUrl = ctx.url.searchParams.get("uri");
  return new Response(
    JSON.stringify(await getOembed(req, rawUrl) ?? {}),
    {
      headers: { "content-type": "application/json" },
    },
  );
};
