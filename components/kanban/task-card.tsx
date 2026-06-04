type Props = {
  description?: string;
  name: string;
  onClick?: () => void;
  position?: number;
};

export function TaskCard({ description, name, onClick, position }: Props) {
  return (
    <article
      className="flex min-h-20 w-full cursor-pointer flex-col gap-2 rounded-none bg-surface-elevated px-4 py-3 transition-colors hover:bg-white/10"
      onClick={onClick}
    >
      <header className="flex items-start justify-between gap-3">
        <h4 className="min-w-0 text-sm font-medium leading-5 text-white">{name}</h4>
        {/* {typeof position === 'number' ? (
          <span className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[11px] text-white/55">
            #{position + 1}
          </span>
        ) : null} */}
      </header>

      {description ? (
        <p className="line-clamp-2 text-xs leading-5 text-white/50">{description}</p>
      ) : null}
    </article>
  );
}
