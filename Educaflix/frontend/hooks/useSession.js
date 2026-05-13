"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export function useSession() {
  const [session, setSession] = useState({ user: null, csrfToken: "", loading: true });

  async function refresh() {
    try {
      const data = await apiFetch("/api/me");
      setSession({ user: data.usuario, csrfToken: data.csrfToken, loading: false });
    } catch (error) {
      setSession({ user: null, csrfToken: "", loading: false });
    }
  }

  async function logout() {
    if (session.csrfToken) {
      await apiFetch("/api/logout", { method: "POST", csrfToken: session.csrfToken });
    }
    setSession({ user: null, csrfToken: "", loading: false });
    window.location.href = "/";
  }

  useEffect(() => {
    refresh();
  }, []);

  return { ...session, refresh, logout, setSession };
}
