import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";
import { ReactQueryClientProvider } from "@/providers/react-query";

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
             
              <nav className="w-full flex justify-center border-b border-b-foreground/10 bg-background/80 backdrop-blur-sm h-16">
                <div className="w-full max-w-7xl flex justify-between items-center p-3 px-6 text-sm">
                  <div className="flex gap-5 items-center font-semibold">
                    <Link 
                      href={"/"} 
                      className="relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
                    >
                      Better Workouts
                    </Link>
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
                  <HeaderAuth />
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
