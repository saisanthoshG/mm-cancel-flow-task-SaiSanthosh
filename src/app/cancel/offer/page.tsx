"use client";

import { getSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export default function OfferPage() {
  const router = useRouter();
  const supabase = getSupabase();

  // Accept downsell
  const handleAccept = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;

    try {
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("id, monthly_price")
        .eq("user_id", userId)
        .single();

      if (!sub) throw new Error("No subscription found");

      const halfPrice =
        sub.monthly_price === 2500
          ? 1250
          : sub.monthly_price === 2900
          ? 1900
          : Math.round(sub.monthly_price / 2);

      await supabase
        .from("subscriptions")
        .update({
          monthly_price: halfPrice,
          pending_cancellation: false,
        })
        .eq("id", sub.id);
    } catch (e) {
      console.warn("Price update failed:", e);
    }

    router.push("/cancel/offer-accepted");
  }, [router, supabase]);

  // Decline downsell
  const handleDecline = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;

    // Mark subscription as pending cancellation
    await supabase
      .from("subscriptions")
      .update({ pending_cancellation: true })
      .eq("user_id", userId);

    router.push("/cancel/survey");
  }, [router, supabase]);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-md overflow-hidden flex flex-col lg:flex-row">
        {/* Left column */}
        <div className="flex-1 p-8 lg:p-10">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => router.back()} className="text-gray-500">
              &lt; Back
            </button>
            <div className="text-sm text-gray-500">
              Subscription Cancellation
              <span className="ml-3">
                <span className="inline-block w-2 h-2 rounded-full bg-green-600 mr-1"></span>
                <span className="inline-block w-2 h-2 rounded-full bg-gray-300 mr-1"></span>
                <span className="inline-block w-2 h-2 rounded-full bg-gray-300"></span>
                <span className="ml-2">Step 1 of 3</span>
              </span>
            </div>
            <button
              onClick={() => router.push("/")}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            We built this to help you land the job, this makes it a little
            easier.
          </h1>
          <p className="text-gray-600 mb-6">
            We’ve been there and we’re here to help you.
          </p>

          {/* Purple discount card */}
          <div className="bg-purple-100 rounded-lg p-5 mb-4">
            <p className="text-lg font-semibold text-gray-800 mb-1">
              Here’s 50% off until you find a job.
            </p>
            <div className="flex items-center justify-center mb-1">
              <span className="text-2xl font-bold text-purple-600">
                $12.50/month
              </span>
              <span className="text-gray-500 line-through text-sm ml-3">
                $25/month
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              You won’t be charged until your next billing date.
            </p>
            <button
              onClick={handleAccept}
              className="w-full py-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition"
            >
              Get 50% off
            </button>
          </div>

          <button
            onClick={handleDecline}
            className="w-full py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
          >
            No thanks
          </button>
        </div>

        {/* Right column: keep your image */}
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
