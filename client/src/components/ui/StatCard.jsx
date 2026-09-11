export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = "text-lavender",
}) {
  return (
    <article className="surface p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
        </div>
        <span
          className={`rounded-2xl bg-slate-100 p-3 dark:bg-slate-800 ${tone}`}
        >
          <Icon size={21} />
        </span>
      </div>
    </article>
  );
}
