"use client";
import { getSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SurveyPage() {
  const router = useRouter();
  const supabase = getSupabase();

  // survey state
  const [roles, setRoles] = useState<string | null>(null);
  const [emails, setEmails] = useState<string | null>(null);
  const [interviews, setInterviews] = useState<string | null>(null);

  const [variant, setVariant] = useState<"A" | "B">("A");

  // read variant; do not assign here
  useEffect(() => {
    async function loadVariant() {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) return;

      const { data } = await supabase
        .from("user_variants")
        .select("variant")
        .eq("user_id", userId)
        .maybeSingle();

      if (data?.variant === "A" || data?.variant === "B") {
        setVariant(data.variant);
      }
    }

    loadVariant();
  }, [supabase]);

  const ready = roles && emails && interviews;

  function handleContinue() {
    if (!ready) return;

    // persist answers in localStorage
    localStorage.setItem("mm_survey_roles", roles!);
    localStorage.setItem("mm_survey_emails", emails!);
    localStorage.setItem("mm_survey_interviews", interviews!);

    router.push("/cancel/reason");
  }

  function handleDiscountClick() {
    router.push("/cancel/offer-accepted");
  }

  // Helper to render each question row
  function QuestionRow({
    title,
    options,
    value,
    onChange,
  }: {
    title: string;
    options: string[];
    value: string | null;
    onChange: (val: string) => void;
  }) {
    return (
      <div className="mb-6">
        <p className="font-medium mb-2">{title}</p>
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`px-4 py-2 rounded-full border ${
                value === opt
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-md flex flex-col lg:flex-row overflow-hidden">
        {/* Left side: form */}
        <div className="flex-1 p-8">
          <h2 className="text-2xl font-bold mb-6">
            Help us understand how you were using Migrate Mate.
          </h2>

          <QuestionRow
            title="How many roles did you apply for through Migrate Mate?"
            options={["0", "1–5", "6–20", "20+"]}
            value={roles}
            onChange={setRoles}
          />

          <QuestionRow
            title="How many companies did you email directly?"
            options={["0", "1–5", "6–20", "20+"]}
            value={emails}
            onChange={setEmails}
          />

          <QuestionRow
            title="How many different companies did you interview with?"
            options={["0", "1–2", "3–5", "5+"]}
            value={interviews}
            onChange={setInterviews}
          />

          {/* Variant B: show discount CTA */}
          {variant === "B" && (
            <button
              type="button"
              onClick={handleDiscountClick}
              className="w-full py-3 mb-3 rounded-md bg-green-600 text-white hover:bg-green-700"
            >
              Get 50 % off
            </button>
          )}

          {/* Continue button */}
          <button
            type="button"
            onClick={handleContinue}
            disabled={!ready}
            className={`w-full py-3 rounded-md ${
              ready
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Continue
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
