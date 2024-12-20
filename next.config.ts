import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental:{
    serverActions:{
      bodySizeLimit:  '100MB'
    },
  },
  /* config options here */
  images:{
    remotePatterns:[
      {
        protocol:'https',
        hostname:'img.freepik.com'
      },
       {
        protocol:'https',
        hostname:'static.vecteezy.com'
      },
      {
        protocol:'https',
        hostname:'cloud.appwrite.io'
      }

    ]
  }
};

export default nextConfig;
