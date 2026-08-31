"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen01Icon,
  Home01Icon,
  Menu01Icon,
  Message01Icon,
  Quiz01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/icon";

const links = [
  { href: "/simulation", label: "Simulation", icon: Home01Icon },
  { href: "/learn", label: "Learn", icon: BookOpen01Icon },
  { href: "/quiz/select", label: "Quiz", icon: Quiz01Icon },
  { href: "/about", label: "About" },
  { href: "/feedback", label: "Feedback", icon: Message01Icon },
];

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className={`site-nav${open ? " open" : ""}`}>
        <Link className="brand" href="/" aria-label="OSI Model Learning Platform home" onClick={() => setOpen(false)}>
          <Image src="/OSI.png" alt="OSI" width={212} height={92} priority />
        </Link>
        <button className="mobile-toggle" type="button" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          <Icon icon={Menu01Icon} size={21} />
        </button>
        <nav className="nav-links" aria-label="Primary navigation">
          {links.map((link) => (
            <Link className="nav-link" data-active={pathname === link.href || pathname.startsWith(`${link.href}/`)} href={link.href} key={link.href} onClick={() => setOpen(false)}>
              {link.icon ? <Icon icon={link.icon} size={16} /> : null} {link.label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <Link className="button button-primary button-small" href="/simulation" onClick={() => setOpen(false)}>Start learning</Link>
        </div>
      </header>
      {children}
      <footer className="footer">
        <div className="footer-inner">
          <small>OSI Model Learning Platform · An interactive networking study tool</small>
          <div className="footer-links"><Link href="/about">Academic scope</Link><Link href="/feedback">Share feedback</Link></div>
        </div>
      </footer>
    </>
  );
}
