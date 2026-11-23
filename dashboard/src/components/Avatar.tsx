import { initialsOf } from '../lib/format';

interface AvatarProps {
  name: string;
  url?: string | null;
  size?: number;
}

export function Avatar({ name, url, size = 40 }: AvatarProps) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full bg-raised font-semibold text-ink"
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {initialsOf(name)}
    </div>
  );
}
