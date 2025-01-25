import {
  Actor,
  Document,
  Image as APImage,
  Link,
  Note,
  Object as APObject,
  PropertyValue,
} from "@fedify/fedify";
import { htmlToText } from "./util.ts";
import { federation } from "./federation.ts";
import env from "./env.ts";
import { FxFediFetchError, FxFediMetadataError } from "./error.ts";

export interface MediaMetadata {
  url: URL;
  type: string;
  alt: string | null;
  height: number | null;
  width: number | null;
}

export interface AttributionMetadata {
  url: URL | null;
  preferredName: string | null;
  name: string | null;
}

export interface InstanceMetadata {
  domain: string;
  title: string;
}

export interface Metadata {
  type: string;
  url: URL | null;
  attribution: AttributionMetadata | null;
  instance: InstanceMetadata | null;
  textContent: string | null;
  media: MediaMetadata[];
  timestamp: Date;
}

export async function fetchMetadata(req: Request, url: URL) {
  const apCtx = federation.createContext(req);
  const loader = await apCtx.getDocumentLoader({
    identifier: env.federation.identifier,
  });
  const obj = await apCtx.lookupObject(url, { documentLoader: loader });
  if (obj === null) {
    throw new FxFediFetchError(`Unable to fetch ActivityPub object at ${url}`);
  }
  return await buildMetadata(obj);
}

export function buildMetadata(obj: APObject): Promise<Metadata> {
  switch (obj.constructor) {
    case Note: {
      return buildNoteMetadata(obj as Note);
    }
  }
  throw new FxFediMetadataError(
    `Object type ${obj.constructor.name} not supported`,
  );
}

async function buildNoteMetadata(note: Note): Promise<Metadata> {
  if (note.url === null) {
    throw new FxFediMetadataError("Unknown note URL");
  }
  const attribution = await note.getAttribution();
  const url = note.url instanceof URL ? note.url : note.url?.href ?? null;

  // Text content metadata
  let textContent: string | null = null;
  if (note.content !== null) {
    const { content, summary, sensitive } = note;
    textContent = "";
    if (sensitive && summary !== null) {
      textContent += `CW: ${summary}\n\n`;
    } else if (summary !== null) {
      textContent += `${summary}\n\n`;
    }
    textContent += content.toString();
    textContent = htmlToText(textContent);
  }

  return {
    type: "article",
    url,
    attribution: attribution ? (await buildAttribution(attribution)) : null,
    instance: url === null ? null : await fetchInstanceMetadata(url),
    textContent,
    media: buildAttachmentMetadata(
      await Array.fromAsync(note.getAttachments()),
    ),
    timestamp: note.published,
  };
}

function buildAttachmentMetadata(
  attachments: (APObject | Link | PropertyValue)[],
): MediaMetadata[] {
  const filteredImages = attachments.filter((attachment) =>
    attachment instanceof Document || attachment instanceof APImage
  );
  return filteredImages.map(
    (attachment): MediaMetadata | null => {
      if (
        (
          attachment.mediaType === null ||
          !attachment.mediaType.startsWith("image/")
        ) &&
        !(attachment instanceof APImage)
      ) {
        return null;
      }

      const url = attachment.url instanceof URL
        ? attachment.url
        : attachment.url?.href ?? null;
      if (url === null) {
        return null;
      }

      return {
        url,
        type: attachment.mediaType!,
        alt: attachment.name?.toString() ?? null,
        width: attachment.width,
        height: attachment.height,
      };
    },
  ).filter((m) => m !== null);
}

function buildAttribution(
  attribution: Actor,
): AttributionMetadata {
  const url = attribution.url instanceof URL
    ? attribution.url
    : attribution.url?.href ?? null;
  return {
    url: url,
    preferredName: attribution.preferredUsername?.toString() ?? null,
    name: attribution.name?.toString() ?? null,
  };
}

async function fetchInstanceMetadata(
  instance: URL,
): Promise<InstanceMetadata | null> {
  // Try the mastodon API, falling back to the domain in the URL
  const clonedUrl = new URL(instance);
  clonedUrl.pathname = "/api/v1/instance";

  try {
    const request = await fetch(clonedUrl);
    const body = await request.json();
    return {
      domain: body.uri ?? clonedUrl.hostname,
      title: body.title ?? null,
    };
  } catch {
    return null;
  }
}
