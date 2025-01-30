import {
  createFederation,
  Endpoints,
  exportJwk,
  generateCryptoKeyPair,
  getUserAgent,
  GetUserAgentOptions,
  importJwk,
  MemoryKvStore,
  Service,
} from "@fedify/fedify";
import { kv, KvKeys } from "./kv.ts";
import env from "./env.ts";

export interface Key {
  privateKey: string;
  publicKey: string;
}

const userAgentConfig: GetUserAgentOptions = {
  software: "fxfedi/0.0.1",
  url: env.federation.url,
};
export const userAgent = getUserAgent(userAgentConfig);

export const federation = createFederation<void>({
  // TODO: Don't use memory cache smh smh smh
  kv: new MemoryKvStore(),
  userAgent: userAgentConfig,
  allowPrivateAddress: env.federation.allowPrivateAddress,
});

federation
  .setActorDispatcher(
    "/users/{identifier}",
    async (ctx, identifier) => {
      if (identifier !== env.federation.identifier) {
        return null;
      }

      const keys = await ctx.getActorKeyPairs(identifier);
      return new Service({
        id: ctx.getActorUri(identifier),
        preferredUsername: identifier,
        name: identifier,
        discoverable: true,
        inbox: ctx.getInboxUri(identifier),
        endpoints: new Endpoints({
          sharedInbox: ctx.getInboxUri(),
        }),

        url: ctx.getActorUri(identifier),
        publicKey: keys[0] ? keys[0].cryptographicKey : null,
        assertionMethods: keys.map((k) => k.multikey),
      });
    },
  )
  .mapHandle((_, username) => {
    return username;
  })
  .setKeyPairsDispatcher(async (_, identifier) => {
    if (identifier !== env.federation.identifier) {
      return [];
    }

    const keyTypes = ["RSASSA-PKCS1-v1_5", "Ed25519"] as const;
    const keys: CryptoKeyPair[] = [];

    for (const type of keyTypes) {
      const { value: key } = await kv.get<Key>([
        KvKeys.USER_KEY,
        identifier,
        type,
      ]);
      if (key === null) {
        const { publicKey, privateKey } = await generateCryptoKeyPair(type);
        const keyData: Key = {
          publicKey: JSON.stringify(await exportJwk(publicKey)),
          privateKey: JSON.stringify(await exportJwk(privateKey)),
        };
        await kv.set([KvKeys.USER_KEY, identifier, type], keyData);
        keys.push({ publicKey, privateKey });
      } else {
        keys.push({
          publicKey: await importJwk(JSON.parse(key.publicKey), "public"),
          privateKey: await importJwk(JSON.parse(key.privateKey), "private"),
        });
      }
    }
    return keys;
  });

federation.setInboxListeners("/users/{identifier}/inbox", "/inbox");
