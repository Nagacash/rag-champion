import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' *.googleapis.com *.gstatic.com *.clerk.com *.clerkstage.com *.clerk.accounts.dev *.clerk.accounts.stage clerk.com clerkstage.com accounts.dev accounts.stage; style-src 'self' 'unsafe-inline' *.googleapis.com *.gstatic.com; img-src 'self' data: *.googleapis.com *.gstatic.com *.clerk.com *.clerkstage.com *.clerk.accounts.dev *.clerk.accounts.stage clerk.com clerkstage.com accounts.dev accounts.stage; font-src 'self' *.googleapis.com *.gstatic.com; connect-src 'self' *.googleapis.com *.gstatic.com *.clerk.com *.clerkstage.com *.clerk.accounts.dev *.clerk.accounts.stage clerk.com clerkstage.com accounts.dev accounts.stage; frame-src 'self' *.clerk.com *.clerkstage.com *.clerk.accounts.dev *.clerk.accounts.stage clerk.com clerkstage.com accounts.dev accounts.stage; media-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
