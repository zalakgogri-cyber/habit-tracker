export function ProLockedCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-neutral-500">{title}</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm">{description}</p>
        </div>
        <span className="shrink-0 rounded-full bg-neutral-900 px-2 py-0.5 text-xs font-medium text-white">
          Pro
        </span>
      </div>
      <button
        type="button"
        disabled
        className="mt-3 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-400"
      >
        Upgrade to unlock — $4.99/mo
      </button>
    </div>
  );
}
