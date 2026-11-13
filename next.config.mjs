const nextConfig = {
  poweredByHeader: false,
  outputFileTracingIncludes: {"/api/share/*": ["./public/brands/**/*"]},
  async headers() {
    return [
      {
        source: "/:path(panel|redakcja-k7m4q9)",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};
export default nextConfig;
