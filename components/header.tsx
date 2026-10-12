"use client";

import Image from "next/image";
import Link from "next/link";
import { UserButton, SignedIn, SignedOut, SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Video, Film, LogIn, LogOut } from "lucide-react";
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

        <div className="flex items-center space-x-2 sm:space-x-3">
          <ThemeToggler />

          <SignedIn>
            <Button 
              variant="outline" 
              size="sm" 
              asChild 
              className="hidden sm:inline-flex"
            >
              <Link href="/dashboard">
                <Film className="mr-2 h-4 w-4" />
                My Videos
              </Link>
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              asChild 
              className="hidden md:inline-flex"
            >
              <Link href="/create-new">
                <Video className="mr-2 h-4 w-4" />
                New Video
              </Link>
            </Button>
            <SignOutButton redirectUrl="/">
              <Button 
                variant="ghost" 
                size="sm"
                className="hidden sm:inline-flex text-muted-foreground hover:text-foreground"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </SignOutButton>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8"
                }
              }}
            />
          </SignedIn>

          <SignedOut>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/sign-in">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
            <Button variant="default" size="sm" asChild>
              <Link href="/sign-up">
                Get Started
              </Link>
            </Button>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}