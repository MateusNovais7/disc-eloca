import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "disc_eloca_admin_session";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/esqueci-senha", "/admin/redefinir-senha"];

// Rotas exclusivas do papel "usuario" (acesso restrito). Tudo que não
// começa com um destes prefixos é bloqueado para esse papel e redirecionado
// ao dashboard. "/admin/trocar-senha" fica sempre liberado pois é preciso
// poder trocar a senha independentemente do papel.
const USER_ROLE_ALLOWED_PREFIXES = [
  "/admin/trocar-senha",
  "/admin/resultados",
  "/admin/participantes",
  "/admin/relatorios",
];

function isDashboardRoot(pathname: string) {
  return pathname === "/admin";
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/admin") || PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  try {
    const secret = new TextEncoder().encode(process.env.ADMIN_SESSION_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const role = (payload as { role?: string }).role;

    if (role === "usuario") {
      const allowed = isDashboardRoot(pathname) || USER_ROLE_ALLOWED_PREFIXES.some((p) => pathname.startsWith(p));
      if (!allowed) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
