import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col p-5 px-10">
      <nav>
        <div className="flex justify-between nav-bar px-5">
          <div>
            <a href="/">StudyFlash</a>
          </div>
          <div className="flex gap-5">
            <div className="nav-item">
              <a href="/flashcards">My Flashcards</a>
            </div>
            <div className="nav-item">
              <a href="/practice">Practice</a>
            </div>
          </div>
        </div>
      </nav>
      <div>Hello </div>
      <footer>bye</footer>
    </div>
  );
}
