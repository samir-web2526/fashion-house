// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   output: 'standalone',
// };

// export default nextConfig;



/** @type {import('next').NextConfig} */

const isVercel = process.env.VERCEL === '1' || Boolean(process.env.VERCEL);

const nextConfig = {
  reactStrictMode: true,
  ...(isVercel ? {} : { output: 'standalone' }),
};

export default nextConfig;