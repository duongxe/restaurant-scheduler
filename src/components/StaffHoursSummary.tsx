import type { Employee, WeekSchedule } from "../types/schedule";
import { formatHours, getEmployeeWeeklyTotals } from "../utils/schedule";

interface StaffHoursSummaryProps {
  employees: Employee[];
  schedule: WeekSchedule;
}

export function StaffHoursSummary({
  employees,
  schedule,
}: StaffHoursSummaryProps) {
  const totals = getEmployeeWeeklyTotals(schedule, employees);
  const scheduledHours = totals.reduce((sum, total) => sum + total.hours, 0);
  const scheduledStaff = totals.filter((total) => total.hours > 0).length;

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-bold text-slate-900">Staff hours</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          {formatHours(scheduledHours)}h total · {scheduledStaff}/{employees.length} staff
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {totals.map(({ employee, hours }) => (
          <div className="flex items-center justify-between px-4 py-2" key={employee.id}>
            <p className="truncate text-sm text-slate-800">{employee.name}</p>
            <p className={`shrink-0 text-sm font-bold ${hours > 0 ? "text-slate-900" : "text-slate-300"}`}>
              {hours > 0 ? `${formatHours(hours)}h` : "—"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
