import { headers } from 'next/headers';

export default async function NotFound() {
  const headersList = await headers();
  const accept = headersList.get('accept') || '';

  // If the request accepts JSON, return a JSON response
  if (accept.includes('application/json')) {
    return Response.json(
      { error: 'Machine not found' },
      { status: 404 }
    );
  }

  // Otherwise return the HTML error page
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Machine Not Found</h1>
        <p className="text-gray-600">The machine you're looking for doesn't exist.</p>
        <a
          href="/"
          className="mt-4 inline-block text-blue-600 hover:text-blue-800"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  );
} 