import React from "react";
import Link from "next/link";
import { ArrowRight, Play, Sparkles, Users, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { TextEffect } from "@/components/ui/text-effect";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "AI-Driven Video Generation",
    description:
      "Effortlessly turn your concepts into captivating videos using cutting-edge AI.",
    icon: Sparkles,
  },
  {
    title: "Lightning-Fast Processing",
    description:
      "Produce videos in just minutes with our rapid and streamlined rendering.",
    icon: Play,
  },
  {
    title: "Get Inspired",
    description:
      "Browse community-made videos to spark your creativity and find inspiration.",
    icon: Users,
  },
  {
    title: "Themes & Captions",
    description:
      "Choose from a range of video themes and caption styles to match your message.",
    icon: Video,
  },
];

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 sm:pt-12 lg:pt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center relative z-10">
            <TextEffect
              as="h1"
              className="opacity-100 blur-0 mt-4 sm:mt-6 text-balance font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5rem] tracking-tight
    bg-clip-text text-transparent
    bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800
    dark:from-gray-300 dark:via-gray-400 dark:to-gray-300"
            >
              Reel It Right with ReelsStack!
            </TextEffect>

            <TextEffect
              per="line"
              preset="fade-in-blur"
              speedSegment={0.5}
              delay={0.5}
              as="p"
              className="mx-auto mt-6 max-w-2xl text-balance text-lg sm:text-xl text-muted-foreground leading-relaxed"
            >
              ReelsStack empowers you to create scroll-stopping video content in minutes.
  No editing skills needed — just your idea and our AI-driven tools.

            </TextEffect>

            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.08,
                      delayChildren: 0.75,
                    },
                  },
                },
                ...transitionVariants,
              }}
              className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 px-4"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto text-base rounded-full"
                asChild
              >
                <Link href="/sign-up">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-base rounded-full"
                asChild
              >
                <Link href="/community">View Examples</Link>
              </Button>
            </AnimatedGroup>
          </div>

          {/* Hero Image */}
          <AnimatedGroup
            variants={{
              container: {
                visible: {
                  transition: {
                    staggerChildren: 0.05,
                    delayChildren: 0.85,
                  },
                },
              },
              ...transitionVariants,
            }}
            className="mt-16 sm:mt-20"
          >
            <div className="relative mx-auto max-w-6xl">
              <div
                className={cn(
                  "relative overflow-hidden rounded-2xl border bg-background p-2 shadow-2xl ring-1 ring-foreground/5",
                  "dark:bg-background/30 dark:backdrop-blur-2xl dark:ring-white/10"
                )}
              >
                <Image
                  className="w-full rounded-xl"
                  src="/dark.png"
                  alt="Application dashboard"
                  width={2700}
                  height={1440}
                  priority
                />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-foreground/5 dark:ring-white/10" />
              </div>
            </div>
          </AnimatedGroup>
        </div>

        {/* Background gradient effects */}
        <div
          className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl xl:-top-6"
          aria-hidden="true"
        >
          <div
            className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-primary to-primary/30 opacity-20"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to create amazing videos
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Our platform combines powerful AI technology with an intuitive
            interface to help you create professional-quality videos in minutes.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-5xl sm:mt-20 lg:mt-24 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2">
          {features.map((feature) => (
            <div key={feature.title} className="flex gap-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon
                  className="h-6 w-6 text-primary"
                  aria-hidden="true"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
