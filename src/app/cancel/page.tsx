// src/app/cancel/page.tsx
"use client";

import { getSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function CancelEntry() {
  const router = useRouter();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    (async () => {
      const supabase = getSupabase();

      // Development sign‑in
      await supabase.auth.signOut();
      await supabase.auth.signInWithPassword({
        email: "testc@example.com",
        password: "test1234",
      });

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) return;

      // Check for existing variant
      const { data: existingVariant } = await supabase
        .from("user_variants")
        .select("variant")
        .eq("user_id", userId)
        .maybeSingle();

      let variant: "A" | "B";
      if (existingVariant) {
        variant = existingVariant.variant as "A" | "B";
      } else {
        const rnd = crypto.getRandomValues(new Uint8Array(1))[0];
        variant = rnd % 2 === 0 ? "A" : "B";
        await supabase
          .from("user_variants")
          .insert({ user_id: userId, variant });
      }

      // Immediately route based on variant; no DB inserts here
      router.replace(variant === "B" ? "/cancel/offer" : "/cancel/survey");
    })();
  }, [router]);

  return null;
}
