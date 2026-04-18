import type {
  DayKey,
  Employee,
  Role,
  ShiftSelection,
  ShiftType,
  WeekSchedule,
} from "../types/schedule";
import { DAYS, ROLES, SHIFT_TYPES } from "../types/schedule";
import { cn } from "../utils/classNames";
import {
  formatDayDate,
  formatShiftTimeRange,
  getAssignedEmployeeEntries,
  getDayNightEndTime,
  normalizeRestaurantTime,
  roleLabels,
  roleStyles,
  shiftLabels,
  shiftTimeLabels,
} from "../utils/schedule";

interface ScheduleBoardProps {
  employees: Employee[];
  selectedShift: ShiftSelection | null;
  schedule: WeekSchedule;
  weekStart: string;
  onSelectShift: (selection: ShiftSelection) => void;
  onUpdateDayNightEnd: (day: DayKey, endTime: string) => void;
}

export function ScheduleBoard({
  employees,
  onUpdateDayNightEnd,
  selectedShift,
  schedule,
  weekStart,
  onSelectShift,
}: ScheduleBoardProps) {
  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <div className="grid min-w-[980px] grid-cols-7 divide-x divide-slate-200">
          {DAYS.map((day) => (
            <DayColumn
              day={day}
              employees={employees}
              key={day.key}
              onSelectShift={onSelectShift}
              onUpdateDayNightEnd={onUpdateDayNightEnd}
              schedule={schedule}
              selectedShift={selectedShift}
              weekStart={weekStart}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface DayColumnProps {
  day: (typeof DAYS)[number];
  employees: Employee[];
  onSelectShift: (selection: ShiftSelection) => void;
  onUpdateDayNightEnd: (day: DayKey, endTime: string) => void;
  schedule: WeekSchedule;
  selectedShift: ShiftSelection | null;
  weekStart: string;
}

function DayColumn({
  day,
  employees,
  onSelectShift,
  onUpdateDayNightEnd,
  schedule,
  selectedShift,
  weekStart,
}: DayColumnProps) {
  const assignedCount = schedule.assignments
    .filter((assignment) => assignment.day === day.key)
    .reduce(
      (count, assignment) => count + assignment.assignedEmployees.length,
      0,
    );

  return (
    <section className="min-h-full bg-slate-50/70">
      <div className="border-b border-slate-200 bg-white px-3 py-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-black text-slate-950">{day.label}</p>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              {formatDayDate(weekStart, day.key)}
            </p>
          </div>
          <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">
            {assignedCount}
          </span>
        </div>
      </div>

      <div className="space-y-2 p-2">
        {ROLES.map((role) => (
          <RoleGroup
            day={day.key}
            employees={employees}
            key={role}
            onSelectShift={onSelectShift}
            role={role}
            schedule={schedule}
            selectedShift={selectedShift}
          />
        ))}
        <NightEndControl
          day={day.key}
          endTime={getDayNightEndTime(schedule, day.key)}
          onUpdateDayNightEnd={onUpdateDayNightEnd}
        />
      </div>
    </section>
  );
}

interface NightEndControlProps {
  day: DayKey;
  endTime: string;
  onUpdateDayNightEnd: (day: DayKey, endTime: string) => void;
}

function NightEndControl({
  day,
  endTime,
  onUpdateDayNightEnd,
}: NightEndControlProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <label className="text-[11px] font-black uppercase text-slate-500">
          Night end
        </label>
        <input
          className="h-8 w-[82px] rounded-md border border-slate-200 bg-slate-50 px-1.5 text-xs font-bold text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
          onChange={(event) =>
            onUpdateDayNightEnd(day, normalizeRestaurantTime(event.target.value))
          }
          step={900}
          type="time"
          value={endTime}
        />
      </div>
    </div>
  );
}

interface RoleGroupProps {
  day: ShiftSelection["day"];
  employees: Employee[];
  onSelectShift: (selection: ShiftSelection) => void;
  role: Role;
  schedule: WeekSchedule;
  selectedShift: ShiftSelection | null;
}

function RoleGroup({
  day,
  employees,
  onSelectShift,
  role,
  schedule,
  selectedShift,
}: RoleGroupProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span
          className={cn(
            "rounded-md border px-2 py-1 text-[11px] font-black",
            roleStyles[role].badge,
          )}
        >
          {roleLabels[role]}
        </span>
      </div>
      <div className="space-y-2">
        {SHIFT_TYPES.map((shiftType) => (
          <ShiftCard
            day={day}
            employees={employees}
            key={shiftType}
            onSelectShift={onSelectShift}
            role={role}
            schedule={schedule}
            selectedShift={selectedShift}
            shiftType={shiftType}
          />
        ))}
      </div>
    </div>
  );
}

interface ShiftCardProps {
  day: DayKey;
  employees: Employee[];
  onSelectShift: (selection: ShiftSelection) => void;
  role: Role;
  schedule: WeekSchedule;
  selectedShift: ShiftSelection | null;
  shiftType: ShiftType;
}

function ShiftCard({
  day,
  employees,
  onSelectShift,
  role,
  schedule,
  selectedShift,
  shiftType,
}: ShiftCardProps) {
  const selection = { day, role, shiftType };
  const assignedEntries = getAssignedEmployeeEntries(
    schedule,
    selection,
    employees,
  );
  const isSelected =
    selectedShift?.day === day &&
    selectedShift.role === role &&
    selectedShift.shiftType === shiftType;

  return (
    <button
      className={cn(
        "min-h-[96px] w-full rounded-lg border bg-slate-50 px-2.5 py-2 text-left transition hover:border-slate-400 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500",
        roleStyles[role].border,
        isSelected && "border-slate-950 bg-white shadow-sm ring-2 ring-slate-950/15",
      )}
      onClick={() => onSelectShift(selection)}
      type="button"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-black text-slate-900">
            {shiftLabels[shiftType]}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-slate-500">
            {shiftTimeLabels[shiftType]}
          </p>
        </div>
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 text-[11px] font-black",
            assignedEntries.length > 0
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-400",
          )}
        >
          {assignedEntries.length}
        </span>
      </div>

      <div className="mt-2 space-y-1.5">
        {assignedEntries.length > 0 ? (
          assignedEntries.map((entry) => (
            <span
              className="block rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-800"
              key={entry.employee.id}
            >
              <span className="block truncate">{entry.employee.name}</span>
              <span className="block text-[11px] font-medium text-slate-500">
                {formatShiftTimeRange(entry.startTime, entry.endTime)}
              </span>
            </span>
          ))
        ) : (
          <span className="block rounded-md border border-dashed border-slate-300 bg-white px-2 py-2 text-center text-xs font-bold text-slate-400">
            Assign staff
          </span>
        )}
      </div>
    </button>
  );
}
