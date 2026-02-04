import Image from "next/image";
import Link from "next/link";
import { Github, Linkedin } from "lucide-react";

const links = [
  {
    title: "Product",
    items: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Create New", href: "/create-new" },
      { label: "Community", href: "/community" },
      { label: "Pricing", href: "/pricing" },
    ]
  },
  {
    title: "Resources",
    items: [
      { label: "Documentation", href: "/docs" },
      { label: "Blog", href: "/blog" },
      { label: "Examples", href: "/examples" },
      { label: "Templates", href: "/templates" },
    ]
  },
  {
    title: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ]
  }
];

export default function Footer() {
  return (
    <footer className="border-t bg-background/50 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:px-8 lg:py-20">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-3">
              <Image src="/logo.svg" alt="Reels Stack" width={36} height={36} className="rounded-lg" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                Reels Stack
              </span>
            </Link>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Create stunning video content in minutes with AI-powered tools and templates.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://www.linkedin.com/in/ajayjainn/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link
                href="https://github.com/ajayjainn/ReelsStack"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
            </div>
          </div>
          
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold">{links[0].title}</h3>
                <ul role="list" className="mt-4 space-y-3">
                  {links[0].items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold">{links[1].title}</h3>
                <ul role="list" className="mt-4 space-y-3">
                  {links[1].items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold">{links[2].title}</h3>
              <ul role="list" className="mt-4 space-y-3">
                {links[2].items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t">
          <p className="text-xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Reels Stack. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}