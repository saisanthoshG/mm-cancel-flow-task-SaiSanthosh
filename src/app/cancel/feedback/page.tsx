"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function FeedbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const foundJob = searchParams.get("found") === "true";

  const [feedback, setFeedback] = useState("");

  function handleContinue() {
    if (feedback.length < 25) return;
    localStorage.setItem("mm_feedback", feedback);
    if (foundJob) {
      router.push("/cancel/visa-support");
    } else {
      router.push("/cancel/done-no-help");
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-md overflow-hidden flex flex-col lg:flex-row">
        <div className="flex-1 p-8 lg:p-10">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => router.back()} className="text-gray-500">
              &lt; Back
            </button>
            <div className="text-sm text-gray-500">
              Subscription Cancellation
              <span className="ml-3">
                <span className="inline-block w-2 h-2 rounded-full bg-green-600 mr-1"></span>
                <span className="inline-block w-2 h-2 rounded-full bg-green-600 mr-1"></span>
                <span className="inline-block w-2 h-2 rounded-full bg-gray-300"></span>
                <span className="ml-2">Step 2 of 3</span>
              </span>
            </div>
            <button
              onClick={() => router.push("/")}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-4">
            What’s one thing you wish we could’ve helped you with?
          </h1>
          <p className="text-gray-600 mb-4">
            We’re always looking to improve, your thoughts can help us make
            Migrate Mate more useful for others.{" "}
            <span className="italic">(Min 25 characters)</span>
          </p>

          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={5}
            className="w-full border border-gray-300 rounded-lg p-3 resize-none mb-4"
          ></textarea>

          <button
            onClick={handleContinue}
            disabled={feedback.length < 25}
            className={`w-full py-3 rounded-md ${
              feedback.length >= 25
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
