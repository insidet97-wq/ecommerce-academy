"use client";

/**
 * Lightweight hook that fetches the user's per-tool usage from
 * /api/ai-tools/usage and exposes a refresh fn so components can
 * bump the counter optimistically after a successful run.
 *
 * Used by the 4 AI tool components (Ad Copywriter, UGC Brief, Ad Auditor,
 * Store Autopsy) to show "X / Y today" pills.
 */

import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";
import type { AITool } from "./ai-tool-gate";

export type ToolUsage = { used: number; limit: number };

export function useAIToolUsage(tool: AITool): {
  usage: ToolUsage | null;
  refresh: () => Promise<void>;
  bump: () => void;
} {
  const [usage, setUsage] = useState<ToolUsage | null>(null);

  const refresh = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;
    try {
      const res = await fetch("/api/ai-tools/usage", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) return;
      const json = await res.json() as { usage: Record<AITool, ToolUsage> };
      setUsage(json.usage[tool] ?? null);
    } catch {
      // silent — UI just won't show the pill
    }
  }, [tool]);

  // Optimistic increment after a successful run
  const bump = useCallback(() => {
    setUsage(prev => prev ? { ...prev, used: prev.used + 1 } : prev);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { usage, refresh, bump };
}
