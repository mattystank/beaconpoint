"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth, getStoredUser, getToken, isTokenExpired } from "./lib/auth";

type AuthGateProps = {
  children: React.ReactNode;
};

const ADMIN_ONLY_PREFIXES = ["/admin", "/analytics"];
const AUTH_REQUIRED_PREFIXES = ["/business", "/screens", "/ads", "/booking"];

function pathStartsWithAny(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export default function AuthGate({ children }: AuthGateProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  const requiresAdmin = useMemo(
    () => (pathname ? pathStartsWithAny(pathname, ADMIN_ONLY_PREFIXES) : false),
    [pathname]
  );
  const requiresAuth = useMemo(
    () => requiresAdmin || (pathname ? pathStartsWithAny(pathname, AUTH_REQUIRED_PREFIXES) : false),
    [pathname, requiresAdmin]
  );

  useEffect(() => {
    if (!pathname) {
      setReady(true);
      return;
    }

    if (!requiresAuth) {
      setReady(true);
      return;
    }

    const token = getToken();
    const user = getStoredUser();

    if (!token || !user) {
      clearAuth();
      router.replace("/login");
      setReady(false);
      return;
    }

    if (isTokenExpired(token)) {
      clearAuth();
      router.replace("/login");
      setReady(false);
      return;
    }

    if (requiresAdmin && user.role !== "admin") {
      router.replace("/business");
      setReady(false);
      return;
    }

    setReady(true);
  }, [pathname, requiresAdmin, requiresAuth, router]);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}