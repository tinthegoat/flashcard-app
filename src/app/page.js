// src/app/page.js
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="">
          <div className="px-5">
            <div className="text-4xl font-roboto-mono font-bold mb-5 mt-10">
              Create your own flash cards and practice for better grades.
              <div className="text-lg mt-3 font-normal">
                Try it now!
              </div>
            </div>
            <div className="btn glass-effect py-3 w-fit text-lg font-semibold transition-transform duration-200 hover:scale-110 font-roboto-mono">
              <Link href="/pages/flashcards" className="px-10">Get Started</Link>
            </div>
          </div>
      </div>

      <div className="mt-15 px-5 text-2xl font-roboto-mono font-bold">
        Your recent cards will be shown below. (Coming soon!)
      </div>
      <div className="mt-5 px-5 text-lg font-roboto-mono font-normal">
        Check out the leaderboard to see how you rank against other users! (Coming soon!)
      </div>
    </>
  );
}
