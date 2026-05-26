import { useState } from "react";
import type {
  Availability,
  DayKey,
  Employee,
  PayLevel,
  PayLevelRates,
  PenaltyRates,
  Role,
  ShiftSelection,
  WeekSchedule,
} from "../types/schedule";
import { Button } from "../components/Button";
import { EmployeeDirectory } from "../components/EmployeeDirectory";
import { PayrollSummary } from "../components/PayrollSummary";
import { ScheduleBoard } from "../components/ScheduleBoard";
import { ShiftAssignmentPanel } from "../components/ShiftAssignmentPanel";
import { StaffHoursSummary } from "../components/StaffHoursSummary";
import { WeekSelector } from "../components/WeekSelector";
import { cn } from "../utils/classNames";
import { formatWeekRange, roleLabels, roleStyles } from "../utils/schedule";
import { ROLES } from "../types/schedule";

type OwnerTab = "schedule" | "employees" | "payroll";

interface OwnerDashboardPageProps {
  availabilities: Availability[];
  employees: Employee[];
  onAddEmployee: (name: string, roles: Role[], level: PayLevel, password: string) => Promise<void>;
  onAssignEmployee: (selection: ShiftSelection, employeeId: string) => void;
  onBack: () => void;
  onDeleteEmployee: (employeeId: string) => Promise<void>;
  onEditEmployee: (
    employeeId: string,
    updates: { name: string; roles: Role[]; level: PayLevel; password?: string },
  ) => Promise<void>;
  onRemoveEmployee: (selection: ShiftSelection, employeeId: string) => void;
  onUpdateAssignedEmployeeBreak: (
    selection: ShiftSelection,
    employeeId: string,
    breakHours: number,
  ) => void;
  onUpdateAssignedEmployeeTime: (
    selection: ShiftSelection,
    employeeId: string,
    startTime: string,
    endTime: string,
  ) => void;
  onTogglePublicHoliday: (day: DayKey) => void;
  onUpdateDayNightEnd: (day: DayKey, endTime: string) => void;
  onUpdateEmployeeLevel: (employeeId: string, level: PayLevel) => void;
  onUpdatePayLevelRate: (level: PayLevel, hourlyRate: number) => void;
  onUpdatePenaltyRate: (key: keyof PenaltyRates, value: number) => void;
  onWeekChange: (weekStart: string) => void;
  payLevelRates: PayLevelRates;
  penaltyRates: PenaltyRates;
  schedule: WeekSchedule;
  weekStart: string;
}

const tabs: Array<{ id: OwnerTab; label: string }> = [
  { id: "schedule", label: "Weekly Schedule" },
  { id: "employees", label: "Employees" },
  { id: "payroll", label: "Payroll" },
];

export function OwnerDashboardPage({
  availabilities,
  employees,
  onAddEmployee,
  onAssignEmployee,
  onBack,
  onDeleteEmployee,
  onEditEmployee,
  onRemoveEmployee,
  onTogglePublicHoliday,
  onUpdateAssignedEmployeeBreak,
  onUpdateAssignedEmployeeTime,
  onUpdateDayNightEnd,
  onUpdateEmployeeLevel,
  onUpdatePayLevelRate,
  onUpdatePenaltyRate,
  onWeekChange,
  payLevelRates,
  penaltyRates,
  schedule,
  weekStart,
}: OwnerDashboardPageProps) {
  const [activeTab, setActiveTab] = useState<OwnerTab>("schedule");
  const [selectedShift, setSelectedShift] = useState<ShiftSelection | null>(null);

  function handleSelectShift(selection: ShiftSelection) {
    setSelectedShift(selection);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900">
      <div className="mx-auto max-w-[1760px]">
        <header className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
                <svg fill="none" height="20" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20">
                  <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight text-slate-900">
                  Sushi Revolution Roster
                </h1>
                <p className="text-sm text-slate-500">
                  {formatWeekRange(weekStart)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WeekSelector onChange={onWeekChange} weekStart={weekStart} />
              <Button onClick={onBack} size="sm" variant="secondary">
                Sign out
              </Button>
            </div>
          </div>

          <nav className="flex border-t border-slate-200">
            {tabs.map((tab) => (
              <button
                className={cn(
                  "relative px-5 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500",
                  activeTab === tab.id
                    ? "text-indigo-700 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-600"
                    : "text-slate-500 hover:text-slate-900",
                )}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </header>

        {activeTab === "schedule" ? (
          <section>
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Weekly Schedule
                </h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ROLES.map((role) => (
                    <span
                      className={cn(
                        "rounded-md border px-2.5 py-1 text-xs font-bold",
                        roleStyles[role].badge,
                      )}
                      key={role}
                    >
                      {roleLabels[role]}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid gap-3 2xl:grid-cols-[220px_minmax(0,1fr)_280px]">
              <div className="2xl:sticky 2xl:top-4 2xl:self-start">
                <StaffHoursSummary employees={employees} schedule={schedule} />
              </div>

              <div className="min-w-0">
                <ScheduleBoard
                  employees={employees}
                  onTogglePublicHoliday={onTogglePublicHoliday}
                  onUpdateDayNightEnd={onUpdateDayNightEnd}
                  onSelectShift={handleSelectShift}
                  schedule={schedule}
                  selectedShift={selectedShift}
                  weekStart={weekStart}
                />
              </div>

              <div className="2xl:sticky 2xl:top-4 2xl:self-start">
                {selectedShift ? (
                  <ShiftAssignmentPanel
                    availabilities={availabilities}
                    employees={employees}
                    onAssign={(employeeId) =>
                      onAssignEmployee(selectedShift, employeeId)
                    }
                    onClose={() => setSelectedShift(null)}
                    onRemove={(employeeId) =>
                      onRemoveEmployee(selectedShift, employeeId)
                    }
                    onUpdateEmployeeBreak={(employeeId, breakHours) =>
                      onUpdateAssignedEmployeeBreak(
                        selectedShift,
                        employeeId,
                        breakHours,
                      )
                    }
                    onUpdateEmployeeTime={(employeeId, startTime, endTime) =>
                      onUpdateAssignedEmployeeTime(
                        selectedShift,
                        employeeId,
                        startTime,
                        endTime,
                      )
                    }
                    schedule={schedule}
                    selection={selectedShift}
                    weekStart={weekStart}
                  />
                ) : (
                  <section className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center shadow-sm">
                    <p className="text-sm font-bold text-slate-900">
                      Select a shift
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Available staff will appear here.
                    </p>
                  </section>
                )}
              </div>
            </div>
          </section>
        ) : null}

        {activeTab === "employees" ? (
          <section>
            <div className="mb-3">
              <h2 className="text-xl font-bold text-slate-900">Employees</h2>
              <p className="text-sm text-slate-600">
                Current staff list, rates, roles, and submitted availability.
              </p>
            </div>
            <EmployeeDirectory
              availabilities={availabilities}
              employees={employees}
              onAddEmployee={onAddEmployee}
              onDeleteEmployee={onDeleteEmployee}
              onEditEmployee={onEditEmployee}
              onUpdateEmployeeLevel={onUpdateEmployeeLevel}
              onUpdatePayLevelRate={onUpdatePayLevelRate}
              payLevelRates={payLevelRates}
              weekStart={weekStart}
            />
          </section>
        ) : null}

        {activeTab === "payroll" ? (
          <PayrollSummary
            employees={employees}
            onUpdatePenaltyRate={onUpdatePenaltyRate}
            payLevelRates={payLevelRates}
            penaltyRates={penaltyRates}
            schedule={schedule}
            weekStart={weekStart}
          />
        ) : null}
      </div>
    </main>
  );
}
