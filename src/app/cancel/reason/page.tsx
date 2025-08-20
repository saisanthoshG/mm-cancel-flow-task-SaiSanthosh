// src/app/cancel/reason/page.tsx
"use client";

import { getSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReasonPage() {
  const router = useRouter();
  const supabase = getSupabase();

  // State for the selected reason and follow-up text
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [followupText, setFollowupText] = useState("");
  const [error, setError] = useState("");

  // Retrieve variant and downsell acceptance status
  const [variant, setVariant] = useState<"A" | "B">("A");
  const [acceptedDownsell, setAcceptedDownsell] = useState(false);

  useEffect(() => {
    async function loadVariant() {
      const supabase = getSupabase();
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) return;

      // Fetch persisted variant from Supabase
      const { data, error } = await supabase
        .from("user_variants")
        .select("variant")
        .eq("user_id", userId)
        .single();

      if (data?.variant === "A" || data?.variant === "B") {
        setVariant(data.variant);
      }

      // You can still read accepted_downsell from localStorage if needed
      const accepted = localStorage.getItem("mm_accepted_downsell");
      if (accepted === "true") setAcceptedDownsell(true);
    }

    loadVariant();
  }, []);

  // Determine if the follow-up is required and its minimum length
  const requiresTextarea = selectedReason && selectedReason !== "Too expensive";
  useEffect(() => {
    const login = async () => {
      await supabase.auth.signOut(); // clear previous session
      await supabase.auth.signInWithPassword({
        email: "testc@example.com", // change here to testb@example.com when needed
        password: "test1234",
      });
    };
    login();
  }, []);

  async function handleSubmit() {
    // Get the authenticated user's ID
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    // Validate reason selected
    if (!selectedReason) {
      setError("Please select a reason for cancelling.");
      return;
    }
    // Validate follow-up
    if (requiresTextarea && followupText.trim().length < 25) {
      setError("Please provide at least 25 characters of feedback.");
      return;
    }
    if (selectedReason === "Too expensive" && followupText.trim() === "") {
      setError("Please enter the maximum you would be willing to pay.");
      return;
    }
    setError("");

    // Collect survey data from localStorage
    const roles = localStorage.getItem("mm_survey_roles");
    const emails = localStorage.getItem("mm_survey_emails");
    const interviews = localStorage.getItem("mm_survey_interviews");
    // read variant
    const { data: varRow } = await supabase
      .from("user_variants")
      .select("variant")
      .eq("user_id", userId)
      .maybeSingle();
    const variant = (varRow?.variant as "A" | "B") ?? "A";

    // read subscription_id
    const { data: subRow } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    const subscriptionId = subRow?.id ?? null;
    // Persist cancellation record and subscription update
    (async () => {
      // 1. Insert into cancellations
      await supabase.from("cancellations").insert([
        {
          user_id: userId,
          subscription_id: subscriptionId,
          downsell_variant: variant,
          accepted_downsell: acceptedDownsell,
          reason: selectedReason,
          reason_details: followupText,
          survey_roles: roles,
          survey_emails: emails,
          survey_interviews: interviews,
          max_price_willing_to_pay:
            selectedReason === "Too expensive"
              ? parseFloat(followupText)
              : null,
          created_at: new Date(),
        },
      ]);

      // 2. Update subscription to mark it as pending cancellation
      const { error } = await supabase
        .from("subscriptions")
        .update({ pending_cancellation: true })
        .eq("user_id", userId);

      if (error) console.error("Error updating pending_cancellation:", error);
      // 3. Navigate to the confirmation page
      router.push("/cancel/done");
    })();
  }

  // Render the follow-up input based on the selected reason
  function renderFollowUp() {
    if (!selectedReason) return null;
    if (selectedReason === "Too expensive") {
      return (
        <div className="mb-4">
          <label className="block mb-1 font-medium">
            What would be the maximum you would be willing to pay?
          </label>
          <input
            type="number"
            value={followupText}
            onChange={(e) => setFollowupText(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
      );
    }
    // textarea for other reasons
    return (
      <div className="mb-4">
        <label className="block mb-1 font-medium">
          {selectedReason === "Platform not helpful"
            ? "What can we change to make the platform more helpful?"
            : selectedReason === "Not enough relevant jobs"
            ? "In which way can we make the jobs more relevant?"
            : selectedReason === "Decided not to move"
            ? "What changed for you to decide to not move?"
            : "What would have helped you the most?"}
        </label>
        <textarea
          value={followupText}
          onChange={(e) => setFollowupText(e.target.value)}
          rows={4}
          className="w-full border rounded-lg px-3 py-2"
        />
        <p className="text-xs text-gray-500">Min. 25 characters</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-md flex flex-col lg:flex-row overflow-hidden">
        {/* Left side: form */}
        <div className="flex-1 p-8">
          <h2 className="text-2xl font-bold mb-2">
            What’s the main reason for cancelling?
          </h2>
          <p className="text-gray-600 mb-6">
            Please take a minute to let us know why:
          </p>

          {/* Reason options */}
          <div className="space-y-3 mb-4">
            {[
              "Too expensive",
              "Platform not helpful",
              "Not enough relevant jobs",
              "Decided not to move",
              "Other",
            ].map((reason) => (
              <label
                key={reason}
                className="flex items-start space-x-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="reason"
                  className="mt-1"
                  value={reason}
                  onChange={() => {
                    setSelectedReason(reason);
                    setFollowupText("");
                  }}
                  checked={selectedReason === reason}
                />
                <span className="leading-tight">{reason}</span>
              </label>
            ))}
          </div>

          {/* Follow-up input */}
          {renderFollowUp()}

          {/* Error message */}
          {error && <p className="text-red-600 mb-3">{error}</p>}

          {/* Variant B discount CTA */}
          {variant === "B" && (
            <button
              onClick={() => router.push("/cancel/offer-accepted")}
              className="w-full py-3 mb-3 rounded-md bg-green-600 text-white hover:bg-green-700"
            >
              Get 50 % off | $12.50
            </button>
          )}

          {/* Complete cancellation button */}
          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-md bg-purple-600 text-white hover:bg-purple-700"
          >
            Complete cancellation
          </button>
        </div>

        {/* Right side: image */}
        <div className="hidden lg:block flex-1 relative">
          <img
            src="/images/imagee.png"
            alt="City skyline"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
