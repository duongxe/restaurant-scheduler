import type { Employee, WeekSchedule } from "../types/schedule";
import { cn } from "../utils/classNames";
import {
  formatHours,
  getEmployeeWeeklyTotals,
  roleLabels,
  roleStyles,
} from "../utils/schedule";

interface StaffHoursSummaryProps {
  employees: Employee[];
  schedule: WeekSchedule;
}

export function StaffHoursSummary({
  employees,
  schedule,
}: StaffHoursSummaryProps) {
  const totals = getEmployeeWeeklyTotals(schedule, employees);
  const highestHours = Math.max(...totals.map((total) => total.hours), 1);
  const scheduledHours = totals.reduce((sum, total) => sum + total.hours, 0);
  const scheduledStaff = totals.filter((total) => total.hours > 0).length;

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-indigo-50/60 px-3 py-3">
        <p className="text-xs font-bold uppercase text-slate-500">
          Balance
        </p>
        <h2 className="mt-1 text-lg font-bold text-slate-900">Staff hours</h2>
        <p className="mt-1 text-xs text-slate-500">Highest hours first</p>
      </div>

      <div className="grid grid-cols-2 divide-x divide-slate-200 border-b border-slate-200">
        <div className="px-4 py-3">
          <p className="text-[11px] font-bold uppercase text-slate-500">
            Total
          </p>
          <p className="mt-1 text-base font-bold text-slate-900">
            {formatHours(scheduledHours)}h
          </p>
        </div>
        <div className="px-4 py-3">
          <p className="text-[11px] font-bold uppercase text-slate-500">
            Staff
          </p>
          <p className="mt-1 text-base font-bold text-slate-900">
            {scheduledStaff}/{employees.length}
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {totals.map(({ employee, hours, shiftCount }) => {
          const width = `${Math.round((hours / highestHours) * 100)}%`;

          return (
            <article className="px-3 py-3" key={employee.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {employee.name}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {employee.roles.map((role) => (
                      <span
                        className={cn(
                          "inline-flex rounded-md border px-2 py-0.5 text-[11px] font-bold",
                          roleStyles[role].badge,
                        )}
                        key={role}
                      >
                        {roleLabels[role]}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-slate-900">
                    {formatHours(hours)}h
                  </p>
                  <p className="text-[11px] font-medium text-slate-500">
                    {shiftCount} {shiftCount === 1 ? "shift" : "shifts"}
                  </p>
                </div>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn(
                    "h-full rounded-full",
                    hours > 0 ? "bg-indigo-400" : "bg-slate-200",
                  )}
                  style={{ width }}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
