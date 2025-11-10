import { requireServerAuth } from "@/lib/auth-server";

export default async function BlankPage() {
  // Require authentication - redirects to login if not authenticated
  await requireServerAuth();
  
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center text-muted-foreground">
        <h1 className="text-2xl font-semibold mb-2">Blank Page</h1>
        <p className="text-sm">This page contains only the header and footer.</p>
        <p className="text-sm">Create to facilitate the screen capture of the application.</p>
      </div>
    </div>
  );
}
