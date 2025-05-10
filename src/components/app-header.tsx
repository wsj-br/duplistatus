import Link from 'next/link';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { DatabaseZap } from 'lucide-react'; // Or a more generic "backup" icon

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <DatabaseZap className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block">
            Backup Insights
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggleButton />
        </div>
      </div>
    </header>
  );
}
