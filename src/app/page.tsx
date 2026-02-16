import { redirect } from "next/navigation";

/**
 * Root path / redirects to the default locale (en) so /en is the dashboard.
 */
export default function RootPage() {
  redirect("/en");
}
