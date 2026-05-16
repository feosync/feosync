//=====================  PRODUCTION ==========================

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  transpilePackages: ['gsap'],
}

export default nextConfig



//====================  LOCAL ==========================
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   typescript: {
//     ignoreBuildErrors: true,
//   },
//   images: {
//     unoptimized: true,
//   },
//   transpilePackages: ['gsap'],
//   async rewrites() {
//     return [
//       {
//         source: "/api/:path*",
//         destination: "http://localhost:8000/api/:path*",
//       },
//     ];
//   },
// }
// export default nextConfig