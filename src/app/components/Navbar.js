"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(false);

  const mobileRef = useRef(null);
  const desktopRef = useRef(null);

  // Close dropdown when click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (mobileRef.current && !mobileRef.current.contains(event.target)) {
        setMobileOpen(false);
      }
      if (desktopRef.current && !desktopRef.current.contains(event.target)) {
        setDesktopOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // CSS classes for reuse because Tailwind is verbose and such a pain to copy paste every single timeeeeee so annoying
  const menuItemClass =
    "px-4 py-2 hover:bg-white/20 transition-colors duration-200 font-roboto-mono";

  const dropdownClass =
    "absolute right-0 mt-2 flex flex-col bg-black/70 backdrop-blur-md shadow-lg z-50 bg-gradient-to-b from-black/40 to-blue-900/40 rounded-2xl shadow-lg text-sm";

  return (
    <div className="flex justify-between items-center nav-bar px-5 glass-effect relative">
      <div className="text-2xl font-roboto-mono">
        <Link href="/">StudyFlash</Link>
      </div>

      {/* Desktop links */}
      <div className="hidden sm:flex gap-5 items-center">
        <div className="nav-item glass-effect transition-transform duration-200 hover:scale-110 flex items-center font-roboto-mono">
          <Link href="/pages/flashcards" className="px-4">My Flashcards</Link>
        </div>
        <div className="nav-item glass-effect transition-transform duration-200 hover:scale-110 flex items-center font-roboto-mono">
          <Link href="/pages/practice" className="px-4">Practice</Link>
        </div>

        {/* Desktop Hamburger */}
        <div className="relative" ref={desktopRef}>
          <div
            className="px-4 py-1 glass-effect transition-transform duration-200 hover:scale-110 rounded flex items-center cursor-pointer "
            onClick={() => setDesktopOpen(!desktopOpen)}
          >
            ☰
          </div>
          {desktopOpen && (
            <div className={dropdownClass}>
              <Link href="/pages/leaderboard" className={menuItemClass}>
                Leaderboard
              </Link>
              <Link href="/pages/user" className={menuItemClass}>
                User
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Hamburger */}
      <div className="sm:hidden relative" ref={mobileRef}>
        <div
          className="px-3 py-1 glass-effect transition-transform duration-200 hover:scale-110 rounded cursor-pointer flex items-center"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          ☰
        </div>
        {mobileOpen && (
          <div className={dropdownClass} >
            <Link href="/pages/flashcards" className={menuItemClass}>
              My Flashcards
            </Link>
            <Link href="/pages/practice" className={menuItemClass}>
              Practice
            </Link>
            <Link href="/pages/leaderboard" className={menuItemClass}>
              Leaderboard
            </Link>
            <Link href="/pages/user" className={menuItemClass}>
              User
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
