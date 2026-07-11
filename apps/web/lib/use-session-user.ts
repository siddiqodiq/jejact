"use client";

import { useEffect, useState } from "react";
import type { SessionUser } from "@repo/types";
import { api } from "./api";

/**
 * Survives client-side navigations, so the header never flashes the
 * logged-out state while /api/me is refetched on every page.
 */
let cached: SessionUser | null | undefined;

/**
 * Session user shared across pages.
 * undefined = still loading, null = signed out.
 */
export function useSessionUser(): SessionUser | null | undefined {
  const [user, setUser] = useState<SessionUser | null | undefined>(cached);

  useEffect(() => {
    let alive = true;
    api
      .me()
      .then((me) => {
        cached = me;
        if (alive) setUser(me);
      })
      .catch(() => {
        cached = null;
        if (alive) setUser(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  return user;
}
