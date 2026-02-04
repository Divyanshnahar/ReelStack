"use client";

import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import ThemeToggler from "@/components/theme-toggler";

export default function Header() {

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center space-x-3 transition-opacity hover:opacity-80">
          <Image
            src="/logo.svg"
            width={32}
            height={32}
            alt="Reels Stack Logo"
            className="rounded-lg"
          />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            Reels Stack
          </span>
        </Link>

        <div className="flex items-center space-x-4">
          <ThemeToggler />
          <Button 
            variant="default" 
            size="sm" 
            asChild 
            className="hidden md:flex"
          >
            <Link href="/create-new">
              <Video className="mr-2 h-4 w-4" />
              New Video
            </Link>
          </Button>
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-8 w-8"
              }
            }}
          />

        </div>
      </div>
    </header>
  );
}