import { requireServerAuth } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export default async function BlankPage() {
  await requireServerAuth();

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-start pl-4">
      <div className="text-left text-muted-foreground">
        <h1 className="text-2xl font-semibold mb-2">Blank Page</h1>
        <p className="text-sm">This page contains only the header and footer.</p>
        <p className="text-sm">Create to facilitate the screen capture of the application.</p>
      </div>
    </div>
  );
}
