import { Head } from "$fresh/runtime.ts";
import { FreshContext } from "$fresh/server.ts";
import { normalizeUrl } from "../lib/util.ts";
import { buildMetadata, fetchMetadata } from "../lib/ap.ts";

export default async function ActivityPubMetadata(
  req: Request,
  ctx: FreshContext,
) {
  const normalizedUrl = normalizeUrl(ctx.params.url);
  const metadata = await fetchMetadata(req, new URL(normalizedUrl));
  const oembedEndpoint = new URL(ctx.url);
  oembedEndpoint.pathname = "/oembed";
  oembedEndpoint.search = "";
  oembedEndpoint.searchParams.set("cachebust", Date.now().toString());
  oembedEndpoint.searchParams.set("uri", normalizedUrl.toString());
  return (
    <>
      <Head>
        <meta charset="UTF-8" />
        <title>{ctx.params.url}</title>
        <meta property="og:url" content={normalizedUrl.toString()} />
        <link rel="canonical" href={normalizedUrl.toString()} />
        <link
          rel="alternate"
          href={oembedEndpoint.toString()}
          type="application/json+oembed"
          title={normalizedUrl.toString()}
        />
        {metadata.map((attributes) => <meta {...attributes} />)}
      </Head>
      <code>
        <pre>{JSON.stringify(metadata, null, 2)}</pre>
      </code>
    </>
  );
}
