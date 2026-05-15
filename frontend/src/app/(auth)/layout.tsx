import { redirectIfAuthenticated } from "@/lib/auth/guards";

export default async function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Already-authenticated users bounce home; anonymous users see the entry page.
  await redirectIfAuthenticated("/");
  return <>{children}</>;
}
