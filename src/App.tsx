import { useMemo, useState } from "react";
import {
  MOCK_WEEK_START,
  mockAssignments,
  mockAvailabilities,
  mockEmployees,
  mockPayLevelRates,
} from "./data/mockData";
import { EmployeeAvailabilityPage } from "./pages/EmployeeAvailabilityPage";
import { LoginPage } from "./pages/LoginPage";
import { OwnerDashboardPage } from "./pages/OwnerDashboardPage";
import type {
  Availability,
  Employee,
  PayLevel,
  PayLevelRates,
  ShiftSelection,
  WeekSchedule,
} from "./types/schedule";
import {
  addEmployeeToSchedule,
  removeEmployeeFromSchedule,
  updateAssignedEmployeeTime,
  updateDayNightEndTime,
  upsertAvailability,
} from "./utils/schedule";

type AppView = "login" | "owner" | "employee";

export default function App() {
  const [view, setView] = useState<AppView>("login");
  const [weekStart, setWeekStart] = useState(MOCK_WEEK_START);
  const [activeEmployeeId, setActiveEmployeeId] = useState(mockEmployees[0].id);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [payLevelRates, setPayLevelRates] =
    useState<PayLevelRates>(mockPayLevelRates);
  const [availabilities, setAvailabilities] =
    useState<Availability[]>(mockAvailabilities);
  const [schedules, setSchedules] = useState<WeekSchedule[]>([
    { weekStart: MOCK_WEEK_START, assignments: mockAssignments },
  ]);

  const activeEmployee =
    employees.find((employee) => employee.id === activeEmployeeId) ??
    employees[0];

  const currentSchedule = useMemo(
    () =>
      schedules.find((schedule) => schedule.weekStart === weekStart) ?? {
        weekStart,
        assignments: [],
      },
    [schedules, weekStart],
  );

  function handleSubmitAvailability(nextAvailability: Availability) {
    setAvailabilities((current) =>
      upsertAvailability(current, nextAvailability),
    );
  }

  function handleAssignEmployee(
    selection: ShiftSelection,
    employeeId: string,
  ) {
    setSchedules((current) =>
      addEmployeeToSchedule(current, weekStart, selection, employeeId),
    );
  }

  function handleRemoveEmployee(
    selection: ShiftSelection,
    employeeId: string,
  ) {
    setSchedules((current) =>
      removeEmployeeFromSchedule(current, weekStart, selection, employeeId),
    );
  }

  function handleUpdateAssignedEmployeeTime(
    selection: ShiftSelection,
    employeeId: string,
    startTime: string,
    endTime: string,
  ) {
    setSchedules((current) =>
      updateAssignedEmployeeTime(
        current,
        weekStart,
        selection,
        employeeId,
        startTime,
        endTime,
      ),
    );
  }

  function handleUpdateDayNightEnd(day: ShiftSelection["day"], endTime: string) {
    setSchedules((current) =>
      updateDayNightEndTime(current, weekStart, day, endTime),
    );
  }

  function handleUpdateEmployeeLevel(employeeId: string, level: PayLevel) {
    setEmployees((current) =>
      current.map((employee) =>
        employee.id === employeeId ? { ...employee, level } : employee,
      ),
    );
  }

  function handleUpdatePayLevelRate(level: PayLevel, hourlyRate: number) {
    setPayLevelRates((current) => ({
      ...current,
      [level]: hourlyRate,
    }));
  }

  if (view === "owner") {
    return (
      <OwnerDashboardPage
        availabilities={availabilities}
        employees={employees}
        onAssignEmployee={handleAssignEmployee}
        onBack={() => setView("login")}
        onRemoveEmployee={handleRemoveEmployee}
        onUpdateAssignedEmployeeTime={handleUpdateAssignedEmployeeTime}
        onUpdateDayNightEnd={handleUpdateDayNightEnd}
        onUpdateEmployeeLevel={handleUpdateEmployeeLevel}
        onUpdatePayLevelRate={handleUpdatePayLevelRate}
        onWeekChange={setWeekStart}
        payLevelRates={payLevelRates}
        schedule={currentSchedule}
        weekStart={weekStart}
      />
    );
  }

  if (view === "employee") {
    return (
      <EmployeeAvailabilityPage
        availabilities={availabilities}
        employee={activeEmployee}
        employees={employees}
        onBack={() => setView("login")}
        onEmployeeChange={setActiveEmployeeId}
        onSubmitAvailability={handleSubmitAvailability}
        onWeekChange={setWeekStart}
        weekStart={weekStart}
      />
    );
  }

  return (
    <LoginPage
      employees={employees}
      onEmployeeChange={setActiveEmployeeId}
      onEmployeeLogin={() => setView("employee")}
      onOwnerLogin={() => setView("owner")}
      selectedEmployeeId={activeEmployeeId}
    />
  );
}
