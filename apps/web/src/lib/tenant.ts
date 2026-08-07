import type { HostContext } from "@nusa/shared";
import { parseDevHostPath, parseHost } from "@nusa/shared";

export function resolveRequestContext(request: Request, url: URL): {
  context: HostContext;
  pathname: string;
} {
  const dev = parseDevHostPath(url.pathname);
  if (dev) return dev;
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  return { context: parseHost(host), pathname: url.pathname };
}
