import env from "../lib/env.ts";
import { optOutPhrases } from "../lib/ap.ts";

export default function Home() {
  const host = new URL(env.federation.url).host;
  return (
    <>
      <h1>fxfedi</h1>
      <p>
        fxfedi is very similar to all the other projects that are called{" "}
        <code>fx&lt;platform&gt;</code>{" "}
        - it takes in a fediverse link, and spits out a version with better
        metadata than the original page had.
      </p>

      <nav>
        <h2>Contents</h2>
        <ol>
          <li>
            <a href="#usage">Usage</a>
          </li>
          <li>
            <a href="#why">Why would I need this?</a>
          </li>
          <li>
            <a href="#how">How does it work?</a>
          </li>
          <li>
            <a href="#dont-like">
              I don't like this. How can I prevent my posts from being proxied?
            </a>
            <ol>
              <li>
                <a href="#dont-like-as-user">As a user</a>
              </li>
              <li>
                <a href="#dont-like-as-admin">As an instance administrator</a>
              </li>
            </ol>
          </li>
          <li>
            <a href="#links">Links and contact</a>
          </li>
        </ol>
      </nav>

      <h2 id="usage">Usage</h2>
      <p>
        To use fxfedi, simply put <code>{host}/</code> between the{" "}
        <code>https://</code>{" "}
        and the domain of the fedi post you would like to have improved metadata
        for. For example, if you had a link to the post{" "}
        <code>
          <a href="https://mastodon.is-hardly.online/@katlyn/112834090159532831">
            https://mastodon.is-hardly.online/@katlyn/112834090159532831
          </a>
        </code>{" "}
        and you wanted it to be embedded nicely on another platform, the updated
        link would be{" "}
        <code>
          <a
            href={`https://${host}.link/mastodon.is-hardly.online/@katlyn/112834090159532831`}
          >
            https://{host}/mastodon.is-hardly.online/@katlyn/112834090159532831
          </a>
        </code>. Pretty easy!
      </p>

      <h2 id="why">Why would I need this?</h2>
      <p>
        If you share fediverse links not on the fediverse, it's likely that
        whichever method of communication you are using fetches metadata for any
        links that are shared and embeds it for others to see. This useful as it
        can give people an idea of what a link is before they click on it, and
        it can also remove the need to open the link entirely if the embedded
        content is well formatted and has relevant information.
      </p>
      <p>
        Many fediverse instances don't provide the needed metadata to create
        well formed posts, and sometimes the result is unexpected too - for
        example, with some fedi software the content warning will be embedded
        and nothing else, which may not be the desired outcome. In other cases,
        images may not be embedded in a way that makes them easier to view.
      </p>
      <p>
        When a post or page is proxied through fxfedi, it uses the ActivityPub
        protocol to fetch the post information and attempts to make a fully
        featured embed with it. This can make it easier to share photos with
        friends, embed post text content, and generally may just result in a
        nicer embed.
      </p>

      <h2 id="how">How does it work?</h2>
      <p>
        fxfedi uses the ActivityPub protocol to fetch posts, and then uses
        opengraph and oembed to render metadata on platforms that support it.
        When a request is made to fxfedi, it first checks if the user is likely
        a bot or not based on its returned User-Agent. Non-bots are redirected
        directly to the post provided in the URL, whereas bots are served the
        generated metadata.
      </p>
      <p>
        Before fxfedi fetches the post contents via ActivityPub, it requests the
        remote instance's <code>robots.txt</code>{" "}
        for two reasons - first, to check if fxfedi itself has been disallowed
        from interacting with the instance, and second, to check the original
        bot's User-Agent against the <code>robots.txt</code>{" "}
        file. This is done in an effort to ensure that platforms instance
        administrators have blocked from scraping metadata continue to be
        blocked, even if there are attempts to proxy post metadata.
      </p>
      <p>
        To generate metadata, fxfedi fetches the post and then extracts the
        relevant pieces of content and media. It then formats these into a set
        of metadata tags, and then returns it to the bot.
      </p>

      <h2 id="dont-like">
        I don't like this. How can I prevent my posts from being proxied?
      </h2>
      <p>
        fxfedi only fetches posts and user information when a user posts a
        fxfedi link on a platform that fetches metadata page metadata. It should
        be kept in mind that platforms will try to fetch this metadata
        regardless, and that fxfedi only presents it in a different way - it
        does not give platforms access to data that they otherwise wouldn't have
        had access to. However, if you would like to prevent fxfedi from
        proxying post metadata, there are several options:
      </p>
      <h3 id="dont-like-as-user">As a user</h3>
      <p>
        As a user, there are currently two ways that you are able to stop fxfedi
        from proxying your posts' metadata:
      </p>
      <ul>
        <li>
          Block <code>@{env.federation.identifier}@{host}</code>.
        </li>
        <li>
          Have any of the following phrases in your user summary:{" "}
          {optOutPhrases.map((
            phrase,
            i,
          ) => [i > 0 && ", ", <code>{phrase}</code>])}.
        </li>
      </ul>
      <p>
        Note: the opt out phrase method will stop all well-behaved fxfedi
        instances, whereas a user block will only stop the one instance you
        block. However, using the phrases may also impact the functionality of
        other bots on the fediverse when interacting with your account.
      </p>
      <h3 id="dont-like-as-admin">As an instance administrator</h3>
      <p>
        As an instance administrator, there are currently two ways you are able
        to stop fxfedi from proxying posts from your instance:
      </p>
      <ul>
        <li>
          Suspend or fediblock <code>{host}</code>.
        </li>
        <li>
          Add a disallow rule for <code>fxfedi</code> to your instance's{" "}
          <code>robots.txt</code>.
        </li>
      </ul>
      <p>
        Note: the <code>robots.txt</code>{" "}
        method will stop all well-behaved fxfedi instances, whereas an instance
        fediblock will only stop the one instance you block.
      </p>

      <h2>Links and contact</h2>
      <p>
        fxfedi is created by <a href="https://katlyn.dev/">katlyn</a>{" "}
        and its source code is available at{" "}
        <a href="https://github.com/katlyn/fxfedi">github.com/katlyn/fxfedi</a>.
        Feel free to reach out to{" "}
        <a href="https://mastodon.is-hardly.online/@katlyn">
          @katlyn@is-hardly.online
        </a>{" "}
        with any questions or comments.
      </p>
    </>
  );
}
