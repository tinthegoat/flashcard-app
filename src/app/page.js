import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col p-5 px-10">
      <nav>
        <div className="flex justify-between nav-bar px-5 glass-effect">
          <div className="transition-transform duration-200 hover:scale-110 font-bold">
            <a href="/">StudyFlash</a>
          </div>
          <div className="flex gap-5">
            <div className="nav-item glass-effect px-3 transition-transform duration-200 hover:scale-110">
              <a href="/flashcards">My Flashcards</a>
            </div>
            <div className="nav-item glass-effect px-3 transition-transform duration-200 hover:scale-110">
              <a href="/practice">Practice</a>
            </div>
          </div>
        </div>
      </nav>

      <div className="grid p-10 grid-cols-[3fr_1fr]">
          <div className="bg-gray-200">Main</div>
          <div className="bg-gray-400">Side</div>
      </div>
      <footer>
        bye
      </footer>
    </div>
  );
}
