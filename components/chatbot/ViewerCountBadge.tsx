"use client";

import { useEffect, useMemo, useState } from "react";
import type { RealtimePresenceState } from "@supabase/supabase-js";
import clsx from "clsx";
import { getSupabaseClient } from "@/lib/supabaseClient";

const FALLBACK_ID = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createPresenceKey = () => {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {}
  return FALLBACK_ID();
};

const presenceStateCount = (state: RealtimePresenceState) => {
  return Object.values(state).reduce((total, items) => total + items.length, 0);
};

type ViewerCountBadgeProps = {
  channel?: string;
  className?: string;
  label?: string;
};

export default function ViewerCountBadge({
  channel = "ai-assistant-viewers",
  className,
  label = "Đang xem",
}: ViewerCountBadgeProps) {
  const [count, setCount] = useState(1);
  const presenceKey = useMemo(() => createPresenceKey(), []);

  useEffect(() => {
    let isMounted = true;
    const supabase = (() => {
      try {
        return getSupabaseClient();
      } catch (initialiseError) {
        console.error("ViewerCountBadge: unable to initialise Supabase client", initialiseError);
        return null;
      }
    })();

    if (!supabase) {
      return () => {
        isMounted = false;
      };
    }

    const presenceChannel = supabase.channel(channel, {
      config: {
        presence: {
          key: presenceKey,
        },
      },
    });

    presenceChannel.on("presence", { event: "sync" }, () => {
      const total = presenceStateCount(presenceChannel.presenceState());
      if (isMounted) {
        setCount(Math.max(total, 1));
      }
    });

    presenceChannel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        void presenceChannel.track({ lastSeenAt: new Date().toISOString() });
      }
    });

    return () => {
      isMounted = false;
      void presenceChannel.untrack();
      void supabase.removeChannel(presenceChannel);
    };
  }, [channel, presenceKey]);

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium transition-colors",
        className,
      )}
      style={{
        backgroundColor: "var(--chat-surface, rgba(255, 255, 255, 0.08))",
        borderColor: "var(--chat-border, rgba(255, 255, 255, 0.18))",
        color: "var(--chat-header-text, var(--chat-text, inherit))",
      }}
      aria-live="polite"
    >
      <span className="inline-block h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
      <span>{label}:</span>
      <strong className="font-semibold">{count}</strong>
    </span>
  );
}
