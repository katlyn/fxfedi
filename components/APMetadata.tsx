import { Metadata } from "../lib/ap.ts";
import { formatUsername } from "../lib/util.ts";

export default function APMetadata(
  { metadata: { attribution, media, instance, timestamp, textContent } }: {
    metadata: Metadata;
  },
) {
  interface MetadataTag {
    name?: string;
    content: string;
    property?: string;
  }

  const tags: MetadataTag[] = [];
  if (timestamp) {
    tags.push({
      property: "og:published_time",
      content: timestamp.toString(),
    });
  }
  let displayName: string | null;
  const formattedUsername = formatUsername(attribution, instance);
  if (attribution?.name) {
    displayName = attribution.name;
  } else if (formattedUsername) {
    displayName = formattedUsername;
  } else {
    displayName = attribution?.url?.toString() ?? null;
  }

  if (displayName) {
    tags.push({ property: "og:title", content: displayName });
    tags.push({ name: "author", content: displayName });
  }

  if (media.length > 0) {
    tags.push({
      property: "twitter:card",
      content: "summary_large_image",
    });
  }
  tags.push(
    ...media.map((file) => {
      return [
        { property: "og:image", content: file.url.toString() },
        { property: "og:image:type", content: file.type },
        { property: "og:image:width", content: file.width?.toString() ?? null },
        {
          property: "og:image:height",
          content: file.height?.toString() ?? null,
        },
        { property: "og:image:alt", content: file.alt },
      ].filter((m) => m.content !== null) as MetadataTag[];
    }).flat(),
  );

  if (textContent) {
    tags.push({ name: "description", content: textContent }, {
      property: "og:description",
      content: textContent,
    });
  }

  return (
    <>
      {tags.map((attributes) => <meta {...attributes} />)}
    </>
  );
}
