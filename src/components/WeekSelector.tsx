import { addWeeksToWeekStart, formatWeekRange } from "../utils/schedule";

interface WeekSelectorProps {
  weekStart: string;
  onChange: (weekStart: string) => void;
}

export function WeekSelector({ weekStart, onChange }: WeekSelectorProps) {
  return (
    <div className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      <span>Week</span>
      <div className="inline-flex h-10 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <button
          aria-label="Previous week"
          className="flex w-10 items-center justify-center border-r border-slate-200 text-lg font-black text-slate-600 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-slate-500"
          onClick={() => onChange(addWeeksToWeekStart(weekStart, -1))}
          type="button"
        >
          ‹
        </button>
        <span className="flex min-w-[150px] items-center justify-center px-4 text-sm font-black text-slate-900">
          {formatWeekRange(weekStart)}
        </span>
        <button
          aria-label="Next week"
          className="flex w-10 items-center justify-center border-l border-slate-200 text-lg font-black text-slate-600 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-slate-500"
          onClick={() => onChange(addWeeksToWeekStart(weekStart, 1))}
          type="button"
        >
          ›
        </button>
      </div>
    </div>
  );
}
