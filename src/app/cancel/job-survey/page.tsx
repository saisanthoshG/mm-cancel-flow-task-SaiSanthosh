"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function JobSurveyPage() {
  const router = useRouter();

  // form state
  const [foundWithMM, setFoundWithMM] = useState<string | null>(null);
  const [roles, setRoles] = useState<string | null>(null);
  const [emails, setEmails] = useState<string | null>(null);
  const [interviews, setInterviews] = useState<string | null>(null);

  const ready = foundWithMM && roles && emails && interviews;

  function handleContinue() {
    // persist answers (e.g. in localStorage)
    localStorage.setItem("mm_found_with_migratemate", foundWithMM!);
    localStorage.setItem("mm_survey_roles", roles!);
    localStorage.setItem("mm_survey_emails", emails!);
    localStorage.setItem("mm_survey_interviews", interviews!);
    router.push("/cancel/feedback?found=true");
  }

  function OptionButtons({
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
      <div className="mb-4">
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
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-md overflow-hidden flex flex-col lg:flex-row">
        <div className="flex-1 p-8 lg:p-10">
          {/* header with back + progress */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => router.back()} className="text-gray-500">
              &lt; Back
            </button>
            <div className="text-sm text-gray-500">
              Subscription Cancellation
              <span className="ml-3">
                <span className="inline-block w-2 h-2 rounded-full bg-green-600 mr-1"></span>
                <span className="inline-block w-2 h-2 rounded-full bg-gray-300 mr-1"></span>
                <span className="inline-block w-2 h-2 rounded-full bg-gray-300"></span>
                <span className="ml-2">Step 1 of 3</span>
              </span>
            </div>
            <button
              onClick={() => router.push("/")}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <h1 className="text-3xl font-bold mb-4">
            Congrats on the new role! 🎉
          </h1>

          <div className="space-y-4">
            <div>
              <p className="font-medium mb-2">
                Did you find this job with MigrateMate?*
              </p>
              <div className="flex gap-2">
                {["Yes", "No"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFoundWithMM(opt)}
                    className={`flex-1 py-2 rounded-md border ${
                      foundWithMM === opt
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <OptionButtons
              title="How many roles did you apply for through MigrateMate?*"
              options={["0", "1–5", "6–20", "20+"]}
              value={roles}
              onChange={setRoles}
            />
            <OptionButtons
              title="How many companies did you email directly?*"
              options={["0", "1–5", "6–20", "20+"]}
              value={emails}
              onChange={setEmails}
            />
            <OptionButtons
              title="How many different companies did you interview with?*"
              options={["0", "1–2", "3–5", "5+"]}
              value={interviews}
              onChange={setInterviews}
            />
          </div>

          <button
            onClick={handleContinue}
            disabled={!ready}
            className={`mt-6 w-full py-3 rounded-md ${
              ready
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Continue
          </button>
        </div>

        {/* right image */}
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
