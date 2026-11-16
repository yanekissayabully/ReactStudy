/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // The browser must always re-check the service worker file itself,
        // otherwise updates could be delayed by HTTP caching.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/manifest.json",
        headers: [{ key: "Content-Type", value: "application/manifest+json" }],
      },
    ];
  },
};

export default nextConfig;
