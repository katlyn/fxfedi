# fxfedi

fxfedi is very similar to all the other projects that are called
`fx<platform>` - it takes in a fediverse link, and spits out a version with
better metadata than the first had. This is different from https://fxmas.to/ as
fxmas.to relies on the Mastodon API to fetch data, whereas fxfedi uses
ActivityPub to fetch information - in theory this will allow it to work across
all fedi enabled content, and not just instances that implement the Mastodon
API.

fxfedi is still in development and doesn't have a functional deployment yet, but
hopefully it will be ready soon!

### Usage

Make sure to install Deno: https://deno.land/manual/getting_started/installation

Then start the project:

```
deno task start
```

This will watch the project directory and restart as necessary.

## Todos

- [x] Make it respect any #nobot tags in author bios
- [x] Fetch instance robots.txt and check incoming useragent against it
- [ ] Provide documentation on how instances can block the bot from fetching
      posts
- [x] Redirect non-bot visitors to original post
- [ ] Better 404 page
- [ ] Better caching!!!!!!!!
