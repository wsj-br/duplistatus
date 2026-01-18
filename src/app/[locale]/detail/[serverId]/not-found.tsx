import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Machine Not Found</h1>
        <p className="text-gray-600">The machine you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/en"
          className="mt-4 inline-block text-blue-600 hover:text-blue-800"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
