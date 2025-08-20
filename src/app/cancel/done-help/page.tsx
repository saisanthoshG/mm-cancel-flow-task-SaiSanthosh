"use client";
import { useRouter } from "next/navigation";

export default function DoneHelp() {
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
            Your cancellation’s all sorted, mate, no more charges.
          </h1>
          <div className="bg-gray-100 p-4 rounded-md mb-6">
            <p className="font-medium mb-1">Mihailo Bozic</p>
            <p className="text-sm text-gray-500 mb-2">
              &lt;mihailo@migratemate.co&gt;
            </p>
            <p className="text-gray-600">
              I’ll be reaching out soon to help with the visa side of things.
              We’ve got your back, whether it’s questions, paperwork, or just
              figuring out your options. Keep an eye on your inbox, I’ll be in
              touch shortly.
            </p>
          </div>
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
