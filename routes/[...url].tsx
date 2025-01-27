import { Head } from "$fresh/runtime.ts";
import { FreshContext } from "$fresh/server.ts";
import { domainIsValid, normalizeUrl } from "../lib/util.ts";
import { fetchMetadata } from "../lib/ap.ts";
import APMetadata from "../components/APMetadata.tsx";
import ErrorMetadata from "../components/ErrorMetadata.tsx";
import { userAgentDeniedDisallowed } from "../lib/robots.ts";

export default async function ActivityPubMetadata(
  req: Request,
  ctx: FreshContext,
) {
  const normalizedUrl = normalizeUrl(ctx.params.url);
  // Fetch the post
  if (!domainIsValid(normalizedUrl)) {
    return ctx.renderNotFound();
  }

  // Check if the remote site allows this UA to scrape them
  if (
    await userAgentDeniedDisallowed(
      normalizedUrl,
      req.headers.get("user-agent") ?? "",
    )
  ) {
    return (
      <ErrorMetadata
        title="Unabled to fetch metadata"
        description="The remote server that hosts this post has requested the user agent not scrape their services. Please view the original page instead."
      />
    );
  }

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
        <APMetadata metadata={metadata} />
      </Head>
      <code>
        <pre>{JSON.stringify(metadata, null, 2)}</pre>
      </code>
    </>
  );
}
