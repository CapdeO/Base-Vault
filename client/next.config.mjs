/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // async redirects() {
  //   return [
  //     {
  //       source: "/.well-known/farcaster.json",
  //       destination:
  //         "https://api.farcaster.xyz/miniapps/hosted-manifest/0198fd86-a194-51be-43ed-98653b2b06a4",
  //       permanent: false, // 307 Temporary Redirect
  //       statusCode: 307,
  //     },
  //   ];
  // },
};

export default nextConfig;
