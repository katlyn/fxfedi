import { FreshContext } from "$fresh/server.ts";
import { normalizeUrl } from "../lib/util.ts";
import { fetchMetadata } from "../lib/ap.ts";

const exampleOembed = {
  "author_name":
    "the argument destroyer (my bluesky besties get an early flipnote today)",
  "author_url":
    "https://bsky.app/profile/raxdflipnote.bsky.social/post/3lbd5dgieb22j",
  "provider_name": "🔁 910   ❤️ 4.5K",
  "provider_url":
    "https://bsky.app/profile/raxdflipnote.bsky.social/post/3lbd5dgieb22j",
  "title": "Embed",
  "type": "link",
  "version": "1.0",
};

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
    throw new Error("NOT ALLOWED TO NTO GIVE ME A URI");
  }
  const normalizedUrl = normalizeUrl(rawUrl);
  const metadata = await fetchMetadata(req, new URL(normalizedUrl));
  const authorMetadata = metadata.find((v) =>
    v.name === "author" && v.content !== undefined
  );
  const res: OEmbed = {
    author_name: authorMetadata?.content,
    author_url: normalizedUrl.toString(),
    provider_name: normalizedUrl.host,
    provider_url: "https://katlyn.dev",
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
