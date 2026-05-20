type Props = {
  title: string;
  tag?: string;
};

export function TaskCard({ title, tag }: Props) {
  return (
    <article className="flex h-20 w-full cursor-pointer flex-col justify-around rounded-none bg-surface-elevated px-2.5 py-1.5">
      <div className="flex items-center justify-between px-2.5">
        <h4 className="text-sm text-white">{title}</h4>
      </div>
      {tag ? (
        <span className="w-fit rounded bg-[#58616b] px-1 py-0.5 text-xs text-white">{tag}</span>
      ) : null}
    </article>
  );
}
