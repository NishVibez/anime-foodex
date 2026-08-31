import { NextResponse, type NextRequest } from "next/server";

import { resolvedAdProvider } from "@/lib/ads/provider-config";
import { updateSession } from "@/lib/supabase/proxy";

function makeNonce() {
  return btoa(crypto.randomUUID());
}

function contentSecurityPolicy(nonce: string) {
  const development =
    process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseOrigin = supabaseUrl ? new URL(supabaseUrl).origin : "";
  const connectSources = [
    "'self'",
    supabaseOrigin,
    supabaseOrigin ? supabaseOrigin.replace("https://", "wss://") : "",
  ]
    .filter(Boolean)
    .join(" ");
  const adProvider = resolvedAdProvider();
  const adSources =
    adProvider === "adsense"
      ? " https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com"
      : adProvider === "media_net"
        ? " https://contextual.media.net"
        : adProvider === "infolinks"
          ? " https://resources.infolinks.com https://*.infolinks.com"
          : "";

  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development}${adSources}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.supabase.co",
    "font-src 'self' data:",
    `connect-src ${connectSources}${adSources}`,
    `frame-src 'self'${adSources}`,
    "media-src 'self' blob: https://*.supabase.co",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://accounts.google.com https://discord.com",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export async function proxy(request: NextRequest) {
  const canonicalHost = process.env.NEXT_PUBLIC_CANONICAL_HOST?.toLowerCase();
  if (
    process.env.ENFORCE_CANONICAL_HOST === "true" &&
    canonicalHost &&
    request.nextUrl.hostname.toLowerCase() !== canonicalHost
  ) {
    const destination = request.nextUrl.clone();
    destination.protocol = "https:";
    destination.host = canonicalHost;
    return NextResponse.redirect(destination, 308);
  }

  const nonce = makeNonce();
  const csp = contentSecurityPolicy(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  let response: NextResponse;
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    response = await updateSession(request, requestHeaders);
  } else {
    response = NextResponse.next({ request: { headers: requestHeaders } });
  }

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("x-content-type-options", "nosniff");
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2)$).*)",
  ],
};
