import type {
  Availability,
  Employee,
  ShiftSelection,
  WeekSchedule,
} from "../types/schedule";
import { Button } from "./Button";
import { cn } from "../utils/classNames";
import {
  availabilityLabels,
  availabilitySupportsShift,
  calculateShiftHours,
  formatHours,
  formatShiftTimeRange,
  getAssignedEmployeeEntries,
  getAssignedShiftLabels,
  getAssignment,
  getDayLabel,
  getEmployeeAvailabilityValue,
  getOverlappingShiftLabels,
  normalizeRestaurantTime,
  roleLabels,
  roleStyles,
  shiftLabels,
  shiftTimeLabels,
} from "../utils/schedule";

interface ShiftAssignmentPanelProps {
  availabilities: Availability[];
  employees: Employee[];
  onAssign: (employeeId: string) => void;
  onClose: () => void;
  onRemove: (employeeId: string) => void;
  onUpdateEmployeeBreak: (employeeId: string, breakHours: number) => void;
  onUpdateEmployeeTime: (
    employeeId: string,
    startTime: string,
    endTime: string,
  ) => void;
  schedule: WeekSchedule;
  selection: ShiftSelection;
  weekStart: string;
}

export function ShiftAssignmentPanel({
  availabilities,
  employees,
  onAssign,
  onClose,
  onRemove,
  onUpdateEmployeeBreak,
  onUpdateEmployeeTime,
  schedule,
  selection,
  weekStart,
}: ShiftAssignmentPanelProps) {
  const assignment = getAssignment(schedule, selection);
  const assignedEntries = getAssignedEmployeeEntries(
    schedule,
    selection,
    employees,
  );
  const candidates = employees
    .map((employee) => {
      const availability = getEmployeeAvailabilityValue(
        availabilities,
        employee.id,
        weekStart,
        selection.day,
      );

      return {
        employee,
        availability,
        supportsShift: availabilitySupportsShift(
          availability,
          selection.shiftType,
        ),
        assignedShiftLabels: getAssignedShiftLabels(
          schedule,
          employee.id,
          selection.day,
        ),
        overlappingShiftLabels: getOverlappingShiftLabels(
          schedule,
          employee.id,
          selection,
        ),
        assignedToThisShift:
          assignment?.assignedEmployees.some(
            (assignedEmployee) => assignedEmployee.employeeId === employee.id,
          ) ?? false,
      };
    })
    .filter(
      (candidate) =>
        candidate.employee.roles.includes(selection.role) &&
        candidate.supportsShift,
    )
    .sort((a, b) => a.employee.name.localeCompare(b.employee.name));

  return (
    <aside
      aria-label="Assign shift"
      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <div
        className={cn(
          "border-b px-3 py-3",
          roleStyles[selection.role].section,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500">
              {getDayLabel(selection.day)}
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              {roleLabels[selection.role]} {shiftLabels[selection.shiftType]}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {shiftTimeLabels[selection.shiftType]}
            </p>
          </div>
          <button
            aria-label="Close assignment panel"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
            onClick={onClose}
            type="button"
          >
            <svg fill="none" height="16" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="16">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <section className="border-b border-slate-200 px-3 py-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900">Assigned</h3>
          <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
            {assignedEntries.length}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Staff scheduled over 6h in a day get a 1h unpaid break by default.
        </p>

        {assignedEntries.length > 0 ? (
          <div className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {assignedEntries.map((entry) => (
              <div className="p-3" key={entry.employee.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {entry.employee.name}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-500">
                      {formatShiftTimeRange(entry.startTime, entry.endTime)}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-slate-500">
                      Paid length{" "}
                      {formatHours(
                        Math.max(
                          0,
                          calculateShiftHours(entry.startTime, entry.endTime) -
                            entry.breakHours,
                        ),
                      )}
                      h after break
                    </p>
                  </div>
                  <button
                    aria-label={`Remove ${entry.employee.name} from this shift`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-rose-400 transition hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
                    onClick={() => onRemove(entry.employee.id)}
                    type="button"
                  >
                    <svg fill="none" height="14" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="14">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <label className="text-xs font-bold text-slate-600">
                    Start
                    <input
                      className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm font-bold text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      onChange={(event) =>
                        onUpdateEmployeeTime(
                          entry.employee.id,
                          normalizeRestaurantTime(event.target.value),
                          entry.endTime,
                        )
                      }
                      type="time"
                      value={entry.startTime}
                    />
                  </label>
                  <label className="text-xs font-bold text-slate-600">
                    End
                    <input
                      className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm font-bold text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      onChange={(event) =>
                        onUpdateEmployeeTime(
                          entry.employee.id,
                          entry.startTime,
                          normalizeRestaurantTime(event.target.value),
                        )
                      }
                      type="time"
                      value={entry.endTime}
                    />
                  </label>
                  <label className="text-xs font-bold text-slate-600">
                    Break
                    <input
                      className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm font-bold text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      min={0}
                      onChange={(event) =>
                        onUpdateEmployeeBreak(
                          entry.employee.id,
                          Number(event.target.value),
                        )
                      }
                      step={0.25}
                      type="number"
                      value={entry.breakHours}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm font-medium text-slate-500">
            No staff assigned.
          </div>
        )}
      </section>

      <section className="px-3 py-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900">Available</h3>
          <span
            className={cn(
              "rounded-md border px-2 py-1 text-xs font-bold",
              roleStyles[selection.role].badge,
            )}
          >
            {roleLabels[selection.role]}
          </span>
        </div>

        {candidates.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm font-medium text-slate-500">
            No matching staff available.
          </div>
        ) : (
          <div className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {candidates.map(
              ({
                employee,
                availability,
                assignedShiftLabels,
                overlappingShiftLabels,
                assignedToThisShift,
              }) => {
                const alreadyAssigned = assignedShiftLabels.length > 0;
                const hasTimeConflict = overlappingShiftLabels.length > 0;

                return (
                  <article
                    className="flex items-start justify-between gap-3 p-3"
                    key={employee.id}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {employee.name}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                          {availabilityLabels[availability]}
                        </span>
                        <span
                          className={cn(
                            "rounded-md px-2 py-0.5 text-xs font-bold",
                            hasTimeConflict
                              ? "bg-rose-50 text-rose-700"
                              : alreadyAssigned
                              ? "bg-amber-50 text-amber-800"
                              : "bg-emerald-50 text-emerald-700",
                          )}
                        >
                          {hasTimeConflict
                            ? "time conflict"
                            : alreadyAssigned
                              ? "assigned today"
                              : "free"}
                        </span>
                      </div>
                      {hasTimeConflict ? (
                        <p className="mt-1.5 text-xs font-medium text-rose-700">
                          Already working: {overlappingShiftLabels.join(", ")}
                        </p>
                      ) : alreadyAssigned ? (
                        <p className="mt-1.5 text-xs font-medium text-amber-700">
                          {assignedShiftLabels.join(", ")}
                        </p>
                      ) : null}
                    </div>

                    <Button
                      disabled={assignedToThisShift || hasTimeConflict}
                      onClick={() => onAssign(employee.id)}
                      size="sm"
                      variant={
                        hasTimeConflict
                          ? "danger"
                          : alreadyAssigned
                            ? "warning"
                            : "primary"
                      }
                    >
                      {assignedToThisShift
                        ? "Added"
                        : hasTimeConflict
                          ? "Blocked"
                          : alreadyAssigned
                            ? "Add"
                            : "Assign"}
                    </Button>
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>
    </aside>
  );
}
