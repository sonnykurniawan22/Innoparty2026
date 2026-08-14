import React, { useEffect, useState } from 'react';

const Confetti: React.FC = () => {
  const [pieces, setPieces] = useState<{ id: number; left: string; delay: string; duration: string; color: string }[]>([]);

  useEffect(() => {
    const colors = ['#C9A84C', '#E8D48B', '#2563EB', '#10B981', '#EF4444', '#8B5CF6'];
    const newPieces = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 3 + 3}s`,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setPieces(newPieces);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute top-[-20px] w-2.5 h-6 rounded-sm opacity-80"
          style={{
            left: p.left,
            backgroundColor: p.color,
            animation: `fall ${p.duration} linear ${p.delay} infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Confetti;
