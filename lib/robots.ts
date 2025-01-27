import robotsParser from "robots-parser";

async function fetchRobots(url: URL): Promise<robotsParser.Robot | null> {
  const robotsUrl = new URL("/robots.txt", url);
  try {
    const response = await fetch(robotsUrl);
    const robotsTxt = await response.text();
    // This is incredibly cursed typing but the package's types are wrong
    return (robotsParser as unknown as typeof robotsParser.default)(
      url.toString(),
      robotsTxt,
    );
  } catch {
    return null;
  }
}

export async function userAgentDeniedDisallowed(url: URL, userAgent: string) {
  const robots = await fetchRobots(url);
  if (robots === null) {
    return false;
  }
  // This is an explicit comparison as the function can also return undefined
  console.log(robots.isDisallowed(url.toString(), userAgent));
  return robots.isDisallowed(url.toString(), userAgent) === true;
}
