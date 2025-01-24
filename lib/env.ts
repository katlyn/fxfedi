import { strictVerify, transform } from "env-verifier";

const config = {
  http: {
    host: "HTTP_HOST",
    port: "HTTP_PORT",
  },
  federation: {
    identifier: "FEDERATION_IDENTIFIER",
    url: "FEDERATION_URL",
    allowPrivateAddress: transform(
      "FEDERATION_ALLOW_PRIVATE_ADDRESS",
      (v) => v.toLowerCase() === "true",
    ),
  },
};

const defaults: Record<string, string> = {
  HTTP_HOST: "0.0.0.0",
  HTTP_PORT: "8000",
  FEDERATION_IDENTIFIER: "fxfedi",
  FEDERATION_ALLOW_PRIVATE_ADDRESS: "false",
};

export default strictVerify<typeof config>(config, {
  ...defaults,
  ...Deno.env.toObject(),
});
