import type {
  Availability,
  Employee,
  PayLevel,
  PayLevelRates,
} from "../types/schedule";
import { DAYS } from "../types/schedule";
import { cn } from "../utils/classNames";
import {
  availabilityLabels,
  formatMoney,
  getEmployeeAvailability,
  roleLabels,
  roleStyles,
  summarizeAvailability,
} from "../utils/schedule";

interface EmployeeDirectoryProps {
  availabilities: Availability[];
  employees: Employee[];
  onUpdateEmployeeLevel: (employeeId: string, level: PayLevel) => void;
  onUpdatePayLevelRate: (level: PayLevel, hourlyRate: number) => void;
  payLevelRates: PayLevelRates;
  weekStart: string;
}

const payLevels: PayLevel[] = [0, 1, 2, 3, 4];

export function EmployeeDirectory({
  availabilities,
  employees,
  onUpdateEmployeeLevel,
  onUpdatePayLevelRate,
  payLevelRates,
  weekStart,
}: EmployeeDirectoryProps) {
  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-black text-slate-950">
            Pay level rates
          </h3>
          <p className="text-sm text-slate-500">
            Set the hourly wage for each level. Staff below use their selected
            level rate.
          </p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {payLevels.map((level) => (
            <label
              className="rounded-lg border border-slate-200 bg-slate-50 p-3"
              key={level}
            >
              <span className="text-xs font-black text-slate-500">
                Level {level}
              </span>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm font-bold text-slate-500">$</span>
                <input
                  className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  min={0}
                  onChange={(event) =>
                    onUpdatePayLevelRate(level, Number(event.target.value))
                  }
                  step={0.5}
                  type="number"
                  value={payLevelRates[level]}
                />
              </div>
            </label>
          ))}
        </div>
      </section>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[1120px] w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-sm text-slate-600">
              <th className="px-4 py-3 font-bold">Employee</th>
              <th className="px-4 py-3 font-bold">Role</th>
              <th className="px-4 py-3 font-bold">Level</th>
              <th className="px-4 py-3 font-bold">Hourly rate</th>
              <th className="px-4 py-3 font-bold">Weekly availability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map((employee) => {
              const availability = getEmployeeAvailability(
                availabilities,
                employee.id,
                weekStart,
              );
              const hourlyRate = payLevelRates[employee.level];

              return (
                <tr key={employee.id}>
                  <td className="px-4 py-4 align-top">
                    <p className="font-bold text-slate-950">{employee.name}</p>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <span
                      className={cn(
                        "inline-flex rounded-md border px-2 py-1 text-xs font-semibold",
                        roleStyles[employee.role].badge,
                      )}
                    >
                      {roleLabels[employee.role]}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <select
                      className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      onChange={(event) =>
                        onUpdateEmployeeLevel(
                          employee.id,
                          Number(event.target.value) as PayLevel,
                        )
                      }
                      value={employee.level}
                    >
                      {payLevels.map((level) => (
                        <option key={level} value={level}>
                          Level {level}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4 align-top text-sm font-semibold text-slate-700">
                    <div>
                      <p className="font-black text-slate-950">
                        {formatMoney(hourlyRate)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        From level {employee.level}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    {availability ? (
                      <div>
                        <p className="mb-2 text-sm text-slate-600">
                          {summarizeAvailability(availability.days)}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {DAYS.map((day) => (
                            <span
                              className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
                              key={day.key}
                            >
                              {day.label}:{" "}
                              {availabilityLabels[availability.days[day.key]]}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">
                        No availability submitted
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
