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
  formatShiftTimeRange,
  getAssignedEmployeeEntries,
  getAssignedShiftLabels,
  getAssignment,
  getDayLabel,
  getEmployeeAvailabilityValue,
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
        assignedToThisShift:
          assignment?.assignedEmployees.some(
            (assignedEmployee) => assignedEmployee.employeeId === employee.id,
          ) ?? false,
      };
    })
    .filter(
      (candidate) =>
        candidate.employee.role === selection.role && candidate.supportsShift,
    )
    .sort((a, b) => a.employee.name.localeCompare(b.employee.name));

  return (
    <aside
      aria-label="Assign shift"
      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-200 bg-slate-950 px-4 py-4 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase text-slate-300">
              {getDayLabel(selection.day)}
            </p>
            <h2 className="mt-1 text-xl font-black">
              {roleLabels[selection.role]} {shiftLabels[selection.shiftType]}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-300">
              {shiftTimeLabels[selection.shiftType]}
            </p>
          </div>
          <button
            aria-label="Close assignment panel"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-sm font-black text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={onClose}
            type="button"
          >
            X
          </button>
        </div>
      </div>

      <section className="border-b border-slate-200 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-black text-slate-950">Assigned</h3>
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-black text-slate-600">
            {assignedEntries.length}
          </span>
        </div>

        {assignedEntries.length > 0 ? (
          <div className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
            {assignedEntries.map((entry) => (
              <div className="p-3" key={entry.employee.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-900">
                      {entry.employee.name}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-500">
                      {formatShiftTimeRange(entry.startTime, entry.endTime)}
                    </p>
                  </div>
                  <button
                    aria-label={`Remove ${entry.employee.name} from this shift`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-sm font-black text-rose-700 transition hover:bg-rose-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
                    onClick={() => onRemove(entry.employee.id)}
                    type="button"
                  >
                    X
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
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

      <section className="px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-black text-slate-950">Available</h3>
          <span
            className={cn(
              "rounded-md border px-2 py-1 text-xs font-black",
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
          <div className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
            {candidates.map(
              ({
                employee,
                availability,
                assignedShiftLabels,
                assignedToThisShift,
              }) => {
                const alreadyAssigned = assignedShiftLabels.length > 0;

                return (
                  <article
                    className="flex items-start justify-between gap-3 p-3"
                    key={employee.id}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-900">
                        {employee.name}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                          {availabilityLabels[availability]}
                        </span>
                        <span
                          className={cn(
                            "rounded-md px-2 py-0.5 text-xs font-bold",
                            alreadyAssigned
                              ? "bg-amber-100 text-amber-900"
                              : "bg-emerald-100 text-emerald-800",
                          )}
                        >
                          {alreadyAssigned ? "assigned today" : "free"}
                        </span>
                      </div>
                      {alreadyAssigned ? (
                        <p className="mt-1.5 text-xs font-medium text-amber-700">
                          {assignedShiftLabels.join(", ")}
                        </p>
                      ) : null}
                    </div>

                    <Button
                      disabled={assignedToThisShift}
                      onClick={() => onAssign(employee.id)}
                      size="sm"
                      variant={alreadyAssigned ? "warning" : "primary"}
                    >
                      {assignedToThisShift
                        ? "Added"
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
