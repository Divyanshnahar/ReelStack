import SideNavigation from "@/components/dashboard/side-navigation";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard - Reels Stack",
  description:
    "Reels Stack allows users to create AI-generated videos, reels, and shorts instantly with just one click. Unlock creativity with speed and innovation.",
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <section>
      <div className="flex min-h-[calc(100vh-4rem)]">
        <div className="hidden md:block w-72 p-4">
          <div className="sticky top-20">
            <div className="rounded-xl border bg-card p-1">
              <SideNavigation />
            </div>
          </div>
        </div>
        <div className="flex-1 px-4 md:px-6 py-4">
          <div className="rounded-xl border bg-card min-h-[calc(100vh-5rem)]">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}