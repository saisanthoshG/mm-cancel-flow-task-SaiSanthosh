"use client";

import { useRouter } from "next/navigation";

export default function DonePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-xl w-full bg-white rounded-lg shadow-md overflow-hidden p-8 flex flex-col lg:flex-row">
        {/* Left side: message */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">
            Sorry to see you go, mate.
          </h2>
          <p className="mb-4">
            Thanks for being with us, and you’re always welcome back. Your
            subscription is set to end on XX date. You’ll still have access
            until then.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-5 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Back to Jobs
          </button>
        </div>
        {/* Right side: image */}
        <div className="hidden lg:block flex-1 relative">
          <img
            src="/images/imagee.png"
            alt="City skyline"
            className="absolute inset-0 w-full h-full object-cover rounded-r-lg"
          />
        </div>
      </div>
    </div>
  );
}
