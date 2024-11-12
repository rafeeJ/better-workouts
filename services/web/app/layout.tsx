import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";
import { ReactQueryClientProvider } from "@/providers/react-query";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Better Workouts",
  description: "The fastest way to build workouts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReactQueryClientProvider>
      <html lang="en" className={GeistSans.className} suppressHydrationWarning>
        <body className="bg-background text-foreground">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <main className="min-h-screen flex flex-col relative isolate">
             
              <nav className="flex justify-center border-b border-b-foreground/10 bg-background/80 backdrop-blur-sm h-16">
                <div className="w-full max-w-7xl flex justify-between items-center p-3 text-sm">
                  <div className="w-full flex justify-between items-center mx-6">
                    {/* Left side: Logo and Desktop Menu */}
                    <div className="flex items-center gap-5">
                      <Link 
                        href={"/"} 
                        className="font-semibold relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
                      >
                        Better Workouts
                      </Link>
                      
                      {/* Desktop Menu */}
                      <div className="hidden md:flex gap-5 items-center font-semibold">
                        <Link 
                          href={"/workouts"} 
                          className="relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
                        >
                          Workouts
                        </Link>
                        <Link 
                          href={"/library"} 
                          className="relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
                        >
                          Library
                        </Link>
                        <Link 
                          href={"/exercises"} 
                          className="relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
                        >
                          Exercises
                        </Link>
                      </div>
                    </div>

                    {/* Right side: Auth and Mobile Menu */}
                    <div className="flex items-center gap-4">
                      <div className="hidden md:block">
                        <HeaderAuth />
                      </div>

                      {/* Mobile Menu Sheet */}
                      <Sheet>
                        <SheetTrigger className="md:hidden p-2 hover:bg-accent rounded-md">
                          <Menu className="h-5 w-5" />
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                          <SheetHeader>
                            <SheetTitle>Menu</SheetTitle>
                          </SheetHeader>
                          <nav className="flex flex-col gap-4 mt-8">
                            <SheetClose asChild>
                              <Link 
                                href={"/workouts"}
                                className="block px-4 py-2 hover:bg-accent rounded-md font-semibold"
                              >
                                Workouts
                              </Link>
                            </SheetClose>
                            <SheetClose asChild>
                              <Link 
                                href={"/library"}
                                className="block px-4 py-2 hover:bg-accent rounded-md font-semibold"
                              >
                                Library
                              </Link>
                            </SheetClose>
                            <SheetClose asChild>
                              <Link 
                                href={"/exercises"}
                                className="block px-4 py-2 hover:bg-accent rounded-md font-semibold"
                              >
                                Exercises
                              </Link>
                            </SheetClose>
                            <div className="mt-4 px-4">
                              <HeaderAuth isMobileSheet={true} />
                            </div>
                          </nav>
                        </SheetContent>
                      </Sheet>
                    </div>
                  </div>
                </div>
              </nav>

              {children}

              <footer className="w-full border-t bg-background/80 backdrop-blur-sm relative">
                <div className="mx-auto max-w-7xl px-6 py-8 flex items-center justify-center text-center text-xs gap-8">
                  <p>
                    Powered by{" "}
                    <a
                      href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
                      target="_blank"
                      className="font-bold hover:underline"
                      rel="noreferrer"
                    >
                      Supabase
                    </a>
                  </p>
                  <ThemeSwitcher />
                </div>
              </footer>
            </main>
          </ThemeProvider>
        </body>
      </html>
    </ReactQueryClientProvider>
  );
}
