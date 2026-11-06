import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ token, req }) {
      const path = req.nextUrl.pathname;
      if (path.startsWith("/admin")) return token?.role === "ADMIN";
      if (path.startsWith("/account")) return Boolean(token);
      return true;
    }
  }
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"]
};
