'use client';

export default function Header() {
  return (
    <header className="flex justify-between items-center px-5 py-4 border-b border-slate-800">
      <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        Character Universe
      </h1>
      <div className="flex gap-3">
        <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-lg hover:bg-slate-700 transition-colors">
          🔔
        </button>
        <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-lg hover:bg-slate-700 transition-colors">
          ⚙️
        </button>
      </div>
    </header>
  );
}
