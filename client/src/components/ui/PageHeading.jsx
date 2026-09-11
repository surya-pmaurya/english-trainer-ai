export default function PageHeading({ eyebrow, title, children }) {
  return (
    <div className="mb-7">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-mint">
        {eyebrow}
      </p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h1>
        </div>
        {children}
      </div>
    </div>
  );
}
