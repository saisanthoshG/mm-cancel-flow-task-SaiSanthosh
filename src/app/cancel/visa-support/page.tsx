// src/app/cancel/visa-support/page.tsx
"use client";

import { getSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function VisaSupportPage() {
  const router = useRouter();
  const supabase = getSupabase();

  const [hasLawyer, setHasLawyer] = useState<"yes" | "no" | null>(null);
  const [visaType, setVisaType] = useState("");

  // ready is true if:
  //  - user chose "yes", or
  //  - user chose "no" and provided a non-empty visaType
  const ready =
    hasLawyer !== null &&
    (hasLawyer === "yes" || (hasLawyer === "no" && visaType.trim().length > 0));

  async function finalizeCancellation() {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;

    // read variant (for completeness; used only if you still track A/B)
    const { data: varRow } = await supabase
      .from("user_variants")
      .select("variant")
      .eq("user_id", userId)
      .maybeSingle();
    const variant = (varRow?.variant as "A" | "B") ?? "A";

    // read subscription id
    const { data: subRow } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    const subscriptionId = subRow?.id ?? null;

    // read survey & feedback from localStorage
    const survey_roles = localStorage.getItem("mm_survey_roles");
    const survey_emails = localStorage.getItem("mm_survey_emails");
    const survey_interviews = localStorage.getItem("mm_survey_interviews");
    const feedback = localStorage.getItem("mm_feedback");
    const foundWithMM = localStorage.getItem("mm_found_with_migratemate"); // "Yes"/"No" or null

    // Insert final cancellation record
    await supabase.from("cancellations").insert({
      user_id: userId,
      subscription_id: subscriptionId,
      downsell_variant: variant,
      accepted_downsell: false,
      reason: "Job found",
      survey_roles,
      survey_emails,
      survey_interviews,
      reason_details: feedback,
      found_with_migratemate: foundWithMM === "Yes",
      visa_type: hasLawyer === "no" ? visaType : null,
      needs_immigration_help: hasLawyer === "no",
    });

    // Update subscription status to cancelled
    await supabase
      .from("subscriptions")
      .update({ status: "cancelled", pending_cancellation: false })
      .eq("user_id", userId);

    // Navigate to final page
    if (hasLawyer === "yes") {
      router.push("/cancel/done-help");
    } else {
      router.push("/cancel/done-no-help");
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-md overflow-hidden flex flex-col lg:flex-row">
        {/* Left column: form */}
        <div className="flex-1 p-8 lg:p-10">
          {/* Header row with back link and progress */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => router.back()} className="text-gray-500">
              &lt; Back
            </button>
            <div className="text-sm text-gray-500">
              Subscription Cancellation
              <span className="ml-3">
                {/* completed indicators for steps */}
                <span className="inline-block w-2 h-2 rounded-full bg-green-600 mr-1"></span>
                <span className="inline-block w-2 h-2 rounded-full bg-green-600 mr-1"></span>
                <span className="inline-block w-2 h-2 rounded-full bg-green-600"></span>
                <span className="ml-2">Step 3 of 3</span>
              </span>
            </div>
            <button
              onClick={() => router.push("/")}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <h1 className="text-3xl font-bold mb-2">
            You landed the job!
            <br />
            That’s what we live for.
          </h1>
          <p className="text-gray-600 mb-6">
            Even if it wasn’t through Migrate Mate, let us help get your visa
            sorted.
          </p>

          <div className="mb-6">
            <p className="font-medium mb-2">
              Is your company providing an immigration lawyer to help with your
              visa?*
            </p>
            <label className="flex items-center mb-2 cursor-pointer">
              <input
                type="radio"
                name="lawyer"
                value="yes"
                checked={hasLawyer === "yes"}
                onChange={() => setHasLawyer("yes")}
                className="mr-2 accent-purple-600"
              />
              Yes
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="lawyer"
                value="no"
                checked={hasLawyer === "no"}
                onChange={() => setHasLawyer("no")}
                className="mr-2 accent-purple-600"
              />
              No
            </label>
          </div>

          {hasLawyer === "no" && (
            <div className="mb-6">
              <p className="mb-2">Which visa would you like to apply for?*</p>
              <input
                type="text"
                value={visaType}
                onChange={(e) => setVisaType(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          <button
            onClick={finalizeCancellation}
            disabled={!ready}
            className={`w-full py-3 rounded-md ${
              ready
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Complete cancellation
          </button>
        </div>

        {/* Right column: image */}
        <div className="hidden lg:block flex-1 relative">
          <img
            src="/images/imagee.png"
            alt="City skyline"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </main>
  );
}
