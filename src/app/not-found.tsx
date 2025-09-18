import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-muted-foreground mb-4">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" className="text-blue-600 hover:underline">
        Return to Dashboard
      </Link>
    </div>
  );
}
