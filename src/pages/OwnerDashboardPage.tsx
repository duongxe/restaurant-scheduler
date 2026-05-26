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
        <header className="mb-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Button onClick={onBack} size="sm" variant="ghost">
                Back to login
              </Button>
              <p className="mt-4 text-sm font-bold text-slate-500">
                Owner dashboard
              </p>
              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Sushi Revolution Roster
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Manual roster planning for {formatWeekRange(weekStart)}.
              </p>
            </div>
            <WeekSelector onChange={onWeekChange} weekStart={weekStart} />
          </div>

          <nav className="flex flex-wrap gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
            {tabs.map((tab) => (
              <button
                className={cn(
                  "min-h-10 rounded-lg border px-4 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500",
                  activeTab === tab.id
                    ? "border-indigo-200 bg-indigo-50 text-indigo-800 shadow-sm"
                    : "border-transparent bg-transparent text-slate-600 hover:bg-white",
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
