import Link from 'next/link';

export default function Home() {
  return (
    <div
      className="min-h-full flex flex-col items-center justify-center p-8 text-center"
      style={{ background: 'linear-gradient(135deg, #1a0533 0%, #2d0a5c 50%, #0f0f3d 100%)' }}
    >
      <div className="mb-8">
        <h1 className="text-6xl font-black text-white drop-shadow-lg">
          🎌 Anime Guess
        </h1>
        <p className="text-white/60 text-lg mt-2">
          How well do you know your anime?
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <Link
          href="/host"
          className="px-10 py-5 bg-white text-purple-700 font-black text-xl rounded-2xl shadow-2xl hover:scale-105 transition-transform"
        >
          🎮 Host a Game
        </Link>
        <Link
          href="/play"
          className="px-10 py-5 bg-purple-600 text-white font-black text-xl rounded-2xl shadow-2xl hover:scale-105 transition-transform border-2 border-purple-400"
        >
          📱 Join a Game
        </Link>
      </div>

      <p className="text-white/30 text-sm mt-12">
        No account needed · Play with friends · Kahoot-style fun
      </p>
    </div>
  );
}
