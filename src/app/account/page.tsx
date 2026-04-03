import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { PasswordSection } from "./password-section";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const email = session.user.email;
  const [user] = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.email, email));
  const hasPassword = !!user?.passwordHash;

  return (
    <main className="mx-auto max-w-lg px-5 pb-28 pt-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Account</h1>

      <div className="flex flex-col gap-4">
        {/* Profile */}
        <div className="rounded-2xl border bg-card p-5">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">Email</p>
          <p className="text-sm font-medium">{email}</p>
        </div>

        {/* Sign-in methods */}
        <div className="rounded-2xl border bg-card p-5">
          <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">Sign-in methods</p>
          <div className="flex flex-col gap-4">
            {/* Google */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <svg viewBox="0 0 24 24" className="size-5 shrink-0" aria-hidden>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-sm">Google</span>
              </div>
              <span className="text-xs text-muted-foreground">Always available</span>
            </div>

            <div className="h-px bg-border" />

            {/* Password */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-5 items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 text-muted-foreground" aria-hidden>
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <span className="text-sm">Password</span>
                </div>
                <span className={`text-xs ${hasPassword ? "text-muted-foreground" : "text-amber-600 dark:text-amber-400"}`}>
                  {hasPassword ? "Enabled" : "Not set"}
                </span>
              </div>
              <PasswordSection hasPassword={hasPassword} />
            </div>
          </div>
        </div>

        {/* Sign out */}
        <div className="rounded-2xl border bg-card p-5">
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="cursor-pointer text-sm font-medium text-destructive hover:underline"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
