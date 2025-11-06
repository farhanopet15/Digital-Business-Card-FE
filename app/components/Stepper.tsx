"use client";

export default function Stepper({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-3">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <div
              className={[
                "h-8 w-8 rounded-full grid place-items-center text-xs font-semibold",
                i <= current ? "bg-black text-white" : "bg-black/10 text-black/60",
                "dark:text-white dark:bg-white/20",
              ].join(" ")}
            >
              {i + 1}
            </div>
            <span className={i === current ? "font-medium" : "text-black/60 dark:text-white/60"}>
              {s}
            </span>
            {i < steps.length - 1 && (
              <div className="mx-2 h-px w-8 bg-black/10 dark:bg-white/10" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}