'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Pack {
  id: string;
  name: string;
  description: string;
  questionCount: number;
}

export default function HostSetup() {
  const router = useRouter();
  const [packs, setPacks] = useState<Pack[]>([]);
  const [selectedPack, setSelectedPack] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [durationSec, setDurationSec] = useState(20);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/packs')
      .then(r => r.json())
      .then(data => {
        setPacks(data.packs);
        if (data.packs.length > 0) setSelectedPack(data.packs[0].id);
      });
  }, []);

  const currentPack = packs.find(p => p.id === selectedPack);

  async function handleCreate() {
    setLoading(true);
    try {
      const res = await fetch('/api/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packId: selectedPack,
          questionCount,
          questionDurationMs: durationSec * 1000,
        }),
      });
      const { roomCode } = await res.json() as { roomCode: string };
      router.push(`/host/${roomCode}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-full flex flex-col items-center justify-center p-8"
      style={{ background: 'linear-gradient(135deg, #1a0533 0%, #2d0a5c 50%, #0f0f3d 100%)' }}
    >
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-sm rounded-3xl p-8 flex flex-col gap-6">
        <h1 className="text-3xl font-black text-white text-center">Host Setup</h1>

        {/* Pack selection */}
        <div className="flex flex-col gap-2">
          <label className="text-white/60 text-sm uppercase tracking-wide">Question Pack</label>
          <div className="flex flex-col gap-2">
            {packs.map(p => (
              <button
                key={p.id}
                onClick={() => { setSelectedPack(p.id); setQuestionCount(Math.min(questionCount, p.questionCount)); }}
                className={`p-4 rounded-xl text-left transition-all ${selectedPack === p.id ? 'bg-white text-purple-700' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                <div className="font-bold">{p.name}</div>
                <div className="text-sm opacity-70">{p.description} · {p.questionCount} questions</div>
              </button>
            ))}
          </div>
        </div>

        {/* Question count */}
        <div className="flex flex-col gap-2">
          <label className="text-white/60 text-sm uppercase tracking-wide">
            Questions: <span className="text-white font-bold">{questionCount}</span>
          </label>
          <input
            type="range"
            min={1}
            max={currentPack?.questionCount ?? 10}
            value={questionCount}
            onChange={e => setQuestionCount(Number(e.target.value))}
            className="w-full accent-purple-400"
          />
        </div>

        {/* Duration */}
        <div className="flex flex-col gap-2">
          <label className="text-white/60 text-sm uppercase tracking-wide">Time per question</label>
          <div className="flex gap-2">
            {[15, 20, 30].map(s => (
              <button
                key={s}
                onClick={() => setDurationSec(s)}
                className={`flex-1 py-2 rounded-xl font-bold transition-all ${durationSec === s ? 'bg-white text-purple-700' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                {s}s
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={!selectedPack || loading}
          className="py-4 bg-white text-purple-700 font-black text-xl rounded-2xl hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100"
        >
          {loading ? 'Creating...' : 'Create Room'}
        </button>
      </div>
    </div>
  );
}
