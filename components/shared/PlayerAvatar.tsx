const AVATAR_COLORS = [
  'bg-pink-500',
  'bg-purple-500',
  'bg-blue-500',
  'bg-cyan-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-orange-500',
  'bg-red-500',
];

const AVATAR_EMOJIS = ['🦊', '🐼', '🐸', '🦁', '🐯', '🐺', '🦋', '🐉'];

interface PlayerAvatarProps {
  avatarIndex: number;
  nickname: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

export function PlayerAvatar({ avatarIndex, nickname, size = 'md', showName = true }: PlayerAvatarProps) {
  const idx = avatarIndex % 8;
  const color = AVATAR_COLORS[idx];
  const emoji = AVATAR_EMOJIS[idx];

  const sizeClass = size === 'sm' ? 'w-8 h-8 text-sm' : size === 'lg' ? 'w-16 h-16 text-3xl' : 'w-12 h-12 text-xl';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`${sizeClass} ${color} rounded-full flex items-center justify-center shadow-md`}>
        {emoji}
      </div>
      {showName && (
        <span className="text-white text-xs font-medium truncate max-w-[80px] text-center">
          {nickname}
        </span>
      )}
    </div>
  );
}
