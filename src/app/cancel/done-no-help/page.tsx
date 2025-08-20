"use client";
import { useRouter } from "next/navigation";

export default function DoneNoHelp() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-xl bg-white rounded-xl shadow p-8 flex flex-col lg:flex-row">
        <div className="flex-1">
          <div className="text-sm text-gray-500 mb-2">
            Subscription Cancelled
            <span className="ml-2">
              {/* progress bar showing completed */}{" "}
              <span className="inline-block w-2 h-2 rounded-full bg-green-600 mr-1"></span>
              <span className="inline-block w-2 h-2 rounded-full bg-green-600 mr-1"></span>
              <span className="inline-block w-2 h-2 rounded-full bg-green-600"></span>
              <span className="ml-2">Completed</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold mb-2">
            All done, your cancellation’s been processed.
          </h1>
          <p className="text-gray-600 mb-6">
            We’re stoked to hear you’ve landed a job and sorted your visa. Big
            congrats from the team. 🙌
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 rounded-md bg-purple-600 text-white hover:bg-purple-700"
          >
            Finish
          </button>
        </div>
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
