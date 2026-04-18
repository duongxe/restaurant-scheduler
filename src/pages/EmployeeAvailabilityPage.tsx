import { useEffect, useState } from "react";
import type {
  Availability,
  DayAvailabilityMap,
  Employee,
} from "../types/schedule";
import { AVAILABILITY_OPTIONS, DAYS } from "../types/schedule";
import { Button } from "../components/Button";
import { WeekSelector } from "../components/WeekSelector";
import { cn } from "../utils/classNames";
import {
  availabilityLabels,
  createEmptyAvailability,
  formatWeekRange,
  getEmployeeAvailability,
  roleLabels,
  roleStyles,
} from "../utils/schedule";

interface EmployeeAvailabilityPageProps {
  availabilities: Availability[];
  employee: Employee;
  employees: Employee[];
  onBack: () => void;
  onEmployeeChange: (employeeId: string) => void;
  onSubmitAvailability: (availability: Availability) => void;
  onWeekChange: (weekStart: string) => void;
  weekStart: string;
}

const availabilityTone: Record<string, string> = {
  "full day": "border-emerald-500 bg-emerald-50 text-emerald-900",
  morning: "border-sky-500 bg-sky-50 text-sky-900",
  night: "border-indigo-500 bg-indigo-50 text-indigo-900",
  unavailable: "border-slate-400 bg-slate-100 text-slate-700",
};

export function EmployeeAvailabilityPage({
  availabilities,
  employee,
  employees,
  onBack,
  onEmployeeChange,
  onSubmitAvailability,
  onWeekChange,
  weekStart,
}: EmployeeAvailabilityPageProps) {
  const [draftDays, setDraftDays] = useState<DayAvailabilityMap>(
    () =>
      getEmployeeAvailability(availabilities, employee.id, weekStart)?.days ??
      createEmptyAvailability(employee.id, weekStart).days,
  );
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setDraftDays(
      getEmployeeAvailability(availabilities, employee.id, weekStart)?.days ??
        createEmptyAvailability(employee.id, weekStart).days,
    );
    setSubmitted(false);
  }, [employee.id, weekStart]);

  function handleSubmit() {
    onSubmitAvailability({
      employeeId: employee.id,
      weekStart,
      days: draftDays,
    });
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Button onClick={onBack} size="sm" variant="ghost">
                Back to login
              </Button>
              <h1 className="mt-3 text-3xl font-black text-slate-950">
                {employee.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-md border px-2 py-1 text-xs font-semibold",
                    roleStyles[employee.role].badge,
                  )}
                >
                  {roleLabels[employee.role]}
                </span>
                <span className="text-sm text-slate-500">
                  Availability for {formatWeekRange(weekStart)}
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[440px]">
              <label className="text-sm font-medium text-slate-700">
                Mock account
                <select
                  className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  onChange={(event) => onEmployeeChange(event.target.value)}
                  value={employee.id}
                >
                  {employees.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <WeekSelector onChange={onWeekChange} weekStart={weekStart} />
            </div>
          </div>
        </header>

        {submitted ? (
          <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            Availability submitted for {formatWeekRange(weekStart)}.
          </div>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
            {DAYS.map((day) => (
              <article
                className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                key={day.key}
              >
                <h2 className="text-sm font-bold text-slate-950">
                  {day.fullLabel}
                </h2>
                <div className="mt-3 grid gap-2">
                  {AVAILABILITY_OPTIONS.map((option) => {
                    const selected = draftDays[day.key] === option;

                    return (
                      <button
                        className={cn(
                          "min-h-10 rounded-lg border bg-white px-3 text-left text-sm font-semibold text-slate-600 transition hover:border-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500",
                          selected && availabilityTone[option],
                        )}
                        key={option}
                        onClick={() =>
                          setDraftDays((current) => ({
                            ...current,
                            [day.key]: option,
                          }))
                        }
                        type="button"
                      >
                        {availabilityLabels[option]}
                      </button>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Morning is 10:00-16:00. Night is 16:00-21:00.
            </p>
            <Button onClick={handleSubmit}>Submit availability</Button>
          </div>
        </section>
      </div>
    </main>
  );
}
