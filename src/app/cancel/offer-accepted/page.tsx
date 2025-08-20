"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function OfferAcceptedPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow p-6 md:p-10 grid md:grid-cols-2 gap-8">
        <section>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Great choice, mate!
          </h1>
          <p className="mt-3 text-gray-700">
            You’re still on the path to your dream role.{" "}
            <span className="text-purple-600 font-semibold">
              Let’s make it happen together!
            </span>
          </p>
          <p className="mt-6 text-sm text-gray-600">
            You’ll pay the discounted price from your next billing date. You can
            cancel anytime before then.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-8 w-full md:w-auto px-5 py-3 rounded-lg bg-[#8952fc] text-white font-medium hover:bg-[#7b40fc] transition"
          >
            Land your dream role
          </button>
        </section>
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
          <Image
            src="/images/imagee.png"
            alt="City skyline"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </main>
  );
}
