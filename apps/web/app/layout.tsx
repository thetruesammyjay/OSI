import "./globals.css";
import SiteShell from "@/components/site-shell";

export const metadata = {
  title: "OSI Model Learning Platform",
  description: "An interactive, academic guide to the seven layers of network communication.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SiteShell>{children}</SiteShell></body></html>;
}
