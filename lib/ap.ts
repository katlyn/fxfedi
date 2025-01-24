import {
  Actor,
  Document,
  Image as APImage,
  Note,
  Object as APObject,
} from "@fedify/fedify";
import { htmlToText } from "./util.ts";
import { federation } from "./federation.ts";
import env from "./env.ts";

interface Metadata {
  name?: string;
  content?: string;
  property?: string;
}

export async function fetchMetadata(req: Request, url: URL) {
  const apCtx = federation.createContext(req);
  const loader = await apCtx.getDocumentLoader({
    identifier: env.federation.identifier,
  });
  const obj = await apCtx.lookupObject(url, { documentLoader: loader });
  if (obj === null) {
    throw new Error("explodes you for looking up something that doesn't exist");
  }
  return await buildMetadata(obj);
}

export function buildMetadata(obj: APObject): Promise<Metadata[]> {
  if (obj === null) {
    throw new Error("Unable to fetch object information");
  }

  switch (obj.constructor) {
    case Note: {
      return buildNoteMetadata(obj as Note);
    }
  }
  return Promise.resolve([]);
}

async function buildNoteMetadata(note: Note): Promise<Metadata[]> {
  const metadata: Metadata[] = [{ property: "og:type", content: "article" }];

  // Note author
  try {
    const attribution = await note.getAttribution();
    if (attribution === null) {
      metadata.push({
        property: "og:title",
        content: (note.id!).toString(),
      });
    } else {
      const attributionUsername = await formatAttributionUsername(attribution);
      metadata.push({ property: "og:title", content: attributionUsername });
      metadata.push({ name: "author", content: attributionUsername });
      metadata.push({
        property: "profile:username",
        content: attributionUsername,
      });
    }
  } catch {}

  // Text content metadata
  if (note.content !== null) {
    const { content, summary, sensitive } = note;
    let textContent = "";
    if (sensitive && summary !== null) {
      textContent += `CW: ${summary}\n\n`;
    } else if (summary !== null) {
      textContent += `${summary}\n\n`;
    }
    textContent += content.toString();

    metadata.push({ name: "description", content: textContent }, {
      property: "og:description",
      content: htmlToText(textContent),
    });
  }

  // Attached media
  const attachments = await Array.fromAsync(note.getAttachments());
  const filteredImages = attachments.filter((attachment) =>
    attachment instanceof Document || attachment instanceof APImage
  );
  metadata.push(...buildAttachmentMetadata(filteredImages));

  // Timestamps
  if (note.published) {
    metadata.push({
      property: "og:published_time",
      content: note.published.toString(),
    });
  }

  return metadata;
}

function buildAttachmentMetadata(
  attachments: (Document | APImage)[],
): Metadata[] {
  const attachmentMeta = attachments.map((attachment) => {
    if (
      (
        attachment.mediaType === null ||
        !attachment.mediaType.startsWith("image/")
      ) &&
      !(attachment instanceof APImage)
    ) {
      return {} as Metadata;
    }
    return [
      { property: "og:image", content: attachment.url?.toString() },
      { property: "og:image:type", content: attachment.mediaType },
      { property: "og:image:width", content: attachment.width },
      { property: "og:image:height", content: attachment.height },
      { property: "og:image:alt", content: attachment.name },
    ];
  }).flat().filter((m) => !!m.content);

  if (attachmentMeta.length > 0) {
    attachmentMeta.push({
      property: "twitter:card",
      content: "summary_large_image",
    });
  }

  return attachmentMeta as Metadata[];
}

async function formatAttributionUsername(
  attribution: Actor,
): Promise<string> {
  if (attribution.preferredUsername !== null) {
    return `@${attribution.name}@${await getInstanceUri(attribution.id!)}`;
  }
  if (attribution.name === null) {
    return attribution.id!.toString();
  }
  return `@${attribution.name}@${await getInstanceUri(attribution.id!)}`;
}

async function getInstanceUri(instance: URL) {
  // Try the mastodon API, falling back to the domain in the URL
  const clonedUrl = new URL(instance);
  clonedUrl.pathname = "/api/v1/instance";

  try {
    const request = await fetch(clonedUrl);
    const body = await request.json();
    return body.uri ?? clonedUrl.hostname;
  } catch {
    return clonedUrl.hostname;
  }
}
