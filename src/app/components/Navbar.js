"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [username, setUsername] = useState("");

  const mobileRef = useRef(null);
  const desktopRef = useRef(null);

  // get username from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("flashUser") || "{}");
    setUsername(storedUser.username || "");
  }, []);

  // close dropdown when click outside
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

  const getInitials = (username) => {
    return username ? username.slice(0, 2).toUpperCase() : "??";
  };

  const menuItemClass =
    "px-4 py-2 hover:bg-white/20 rounded-2xl transition-colors duration-200 font-roboto-mono";

  const dropdownClass =
    "absolute right-0 mt-2 flex flex-col bg-black/70 backdrop-blur-md shadow-lg z-[9999] bg-gradient-to-b from-black/40 to-blue-900/40 rounded-2xl text-sm";

  return (
    <div className="flex justify-between items-center nav-bar z-[9999] px-5 glass-effect relative">
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

        {/* Desktop Avatar and Hamburger */}
        <div className="relative flex items-center gap-3" ref={desktopRef}>
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-lg font-bold text-white font-roboto-mono">
            {getInitials(username)}
          </div>
          <div
            className="px-4 py-1 glass-effect transition-transform duration-200 hover:scale-110 rounded flex items-center cursor-pointer"
            onClick={() => setDesktopOpen(!desktopOpen)}
          >
            ☰
          </div>
          {desktopOpen && (
            <div className={dropdownClass}>
              <Link href="/pages/leaderboard" className={menuItemClass} onClick={() => setDesktopOpen(false)}>
                Leaderboard
              </Link>
              <Link href="/pages/user" className={menuItemClass} onClick={() => setDesktopOpen(false)}>
                User
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Avatar and Hamburger */}
      <div className="sm:hidden relative flex items-center gap-3" ref={mobileRef}>
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-lg font-bold text-white font-roboto-mono">
          {getInitials(username)}
        </div>
        <div
          className="px-3 py-1 glass-effect transition-transform duration-200 hover:scale-110 rounded cursor-pointer flex items-center"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          ☰
        </div>
        {mobileOpen && (
          <div className={dropdownClass}>
            <Link href="/pages/flashcards" className={menuItemClass} onClick={() => setMobileOpen(false)}>
              My Flashcards
            </Link>
            <Link href="/pages/practice" className={menuItemClass} onClick={() => setMobileOpen(false)}>
              Practice
            </Link>
            <Link href="/pages/leaderboard" className={menuItemClass} onClick={() => setMobileOpen(false)}>
              Leaderboard
            </Link>
            <Link href="/pages/user" className={menuItemClass} onClick={() => setMobileOpen(false)}>
              User
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}