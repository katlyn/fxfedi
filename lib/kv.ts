export const kv = await Deno.openKv();
export enum KvKeys {
  USER = "user",
  USER_KEY = "user-key",
}
