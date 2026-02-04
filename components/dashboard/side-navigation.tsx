"use client";

import { CircleUser, PanelsTopLeft, Users, Video } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", path: "/dashboard", icon: PanelsTopLeft }
    ],
  },
  {
    title: "Content",
    items: [
      { name: "Create New", path: "/create-new", icon: Video },
      { name: "Community", path: "/community", icon: Users },
    ],
  },
  {
    title: "Account",
    items: [
      { name: "Profile", path: "/account", icon: CircleUser },
    ],
  },
];

export default function SideNavigation() {
  const pathname = usePathname();

  return (
    <nav className="space-y-6 py-4">
      {navigationItems.map((section) => (
        <div key={section.title} className="px-3 py-2">
          <h2 className="mb-2 px-4 text-sm font-semibold tracking-tight text-muted-foreground">
            {section.title}
          </h2>
          <div className="space-y-1">
            {section.items.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center gap-x-3 rounded-lg px-4 py-2 text-sm font-medium transition-all hover:bg-accent/50",
                  pathname === item.path
                    ? "bg-accent/60 text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
