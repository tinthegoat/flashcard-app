import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    // Navbar
    <div className="flex min-h-screen flex-col p-5 bg-gradient-to-b from-black via-blue-900 to-purple-900">
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

      {/* Body */}
      <div className="">
          <div className="px-5">
            <div className="text-4xl font-roboto-mono font-bold mb-5 mt-10">
              Create your own flash cards and practice for better grades.
              <div className="text-lg mt-3 font-normal">
                Try it now!
              </div>
            </div>
            <div className="btn glass-effect px-10 py-3 w-fit text-lg font-semibold transition-transform duration-200 hover:scale-110">
              <Link href="/flashcards">Get Started</Link>
            </div>
          </div>
      </div>

      {/* Recent Cards */}
      <div className="mt-15 px-5 text-2xl font-roboto-mono font-bold">
        Your recent cards will be shown below. (Coming soon!)
      </div>

      {/* Footer */}
      <footer>
        <div className="mt-auto text-center py-5 font-roboto-mono">
          &copy; 2024 StudyFlash. AU Project.
        </div>
      </footer>
    </div>
  );
}
