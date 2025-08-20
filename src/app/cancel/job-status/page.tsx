"use client";

import { useRouter } from "next/navigation";

export default function JobStatusPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-md overflow-hidden flex flex-col lg:flex-row">
        {/* Left: prompt */}
        <div className="flex-1 p-8 lg:p-10">
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

          <h1 className="text-3xl font-bold mb-3">
            Hey mate, Quick one before you go.
          </h1>
          <h2 className="text-2xl font-semibold mb-4">
            Have you found a job yet?
          </h2>
          <p className="text-gray-600 mb-8">
            Whatever your answer, we just want to help you take the next step.
            With visa support, or by hearing how we can do better.
          </p>

          <button
            onClick={() => router.push("/cancel/job-survey")}
            className="w-full mb-4 py-3 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Yes, I’ve found a job
          </button>
          <button
            onClick={() => router.push("/cancel")}
            className="w-full py-3 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Not yet – I’m still looking
          </button>
        </div>

        {/* Right: image */}
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
