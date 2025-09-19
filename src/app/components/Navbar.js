import Link from "next/link";

export default function Navbar() {
  return (
    <div className="flex justify-between nav-bar px-5 glass-effect">
      <div className="text-2xl font-roboto-mono">
        <Link href="/">StudyFlash</Link>
      </div>
      <div className="flex gap-5">
        <div className="nav-item glass-effect px-4 transition-transform duration-200 hover:scale-110 hidden sm:block">
          <Link href="/flashcards">My Flashcards</Link>
        </div>
        <div className="nav-item glass-effect px-4 transition-transform duration-200 hover:scale-110">
          <Link href="/practice">Practice</Link>
        </div>
      </div>
    </div>
  );
}
