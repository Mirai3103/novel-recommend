/**
 * Convert original image URL into proxied URL
 * using Cloudflare Worker proxy with base64 encoding.
 *
 * @param originalUrl - The original image URL (http/https).
 * @returns Proxied URL string
 */
export function getProxiedImageUrl(originalUrl?: string | null): string {
	if (!originalUrl) {
		return "";
	}
	originalUrl = originalUrl.replace("i.docln.net", "i.hako.vip")

	const proxyBase = process.env.NEXT_PUBLIC_IMAGE_PROXY_URL;
	if (!proxyBase) {
		throw new Error("Missing NEXT_PUBLIC_IMAGE_PROXY_URL in env");
	}

	// Encode original URL -> base64
	const encoded = Buffer.from(originalUrl).toString("base64");

	// Ensure no trailing slash in proxy base
	const cleanBase = proxyBase.replace(/\/+$/, "");

	return `${cleanBase}/image-proxy/${encoded}`;
}
