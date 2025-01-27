export default function ErrorMetadata(
  { title, description }: { title: string; description: string },
) {
  return (
    <>
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
    </>
  );
}
