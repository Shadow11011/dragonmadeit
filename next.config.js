/** @type {import('next').NextConfig} */
const nextConfig = {
  // swcMinify is default true in Next 14, but explicit for clarity
  swcMinify: true,

  // Only add image domains if needed later
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

module.exports = nextConfig;
