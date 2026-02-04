import { SignUp } from "@clerk/nextjs";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SignUpPage() {
  const { userId } = await auth();

  if (userId) redirect("/dashboard");

  return (
    <div className="flex min-h-screen justify-center items-center">
      <div className="relative hidden w-1/3 lg:block h-screen">
        {/* Overlay gradient respects theme */}
        <div
          className="
            absolute inset-0 z-10 rounded-2xl
            bg-gradient-to-br
            from-white/70 via-white/40 to-white/10
            dark:from-[#18181b]/90 dark:via-[#18181b]/60 dark:to-primary/20
          "
        />
        <Image
          src="/auth.jpg"
          alt="Creative reels composition"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 rounded-2xl"
          priority
        />
        <div className="relative z-20 flex h-full flex-col justify-center p-8">
          <div className="bg-background/10 backdrop-blur-lg rounded-2xl p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              Join ReelsStack Today
            </h1>
            <p className="text-base text-gray-900 dark:text-white/90 text-center">
              Start creating amazing videos with AI-powered tools and share your creativity with the world.
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-12">
        <div className="w-full max-w-sm">
          <SignUp 
            appearance={{
              elements: {
                rootBox: "mx-auto w-full",
                card: "shadow-none",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
