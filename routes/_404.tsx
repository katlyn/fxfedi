import { Head } from "$fresh/runtime.ts";

export default function Error404() {
  return (
    <>
      <Head>
        <title>404 - Page not found</title>
      </Head>
      <p>
        The page you were looking for doesn't exist.
      </p>
      <a href="/">Go back home</a>
    </>
  );
}
