import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";
import * as db from "./lib/db";
import { EmployeeAvailabilityPage } from "./pages/EmployeeAvailabilityPage";
import { LoginPage } from "./pages/LoginPage";
import { OwnerDashboardPage } from "./pages/OwnerDashboardPage";
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
} from "./types/schedule";
import {
  addEmployeeToSchedule,
  applyScheduleBreakDefaults,
  getDayNightEndTime,
  getDefaultShiftTime,
  normalizeRestaurantTime,
  payrollPenaltyMultipliers,
  removeEmployeeFromSchedule,
  updateAssignedEmployeeBreak,
  updateAssignedEmployeeTime,
  updateDayNightEndTime,
  upsertAvailability,
} from "./utils/schedule";
import { mockPayLevelRates } from "./data/mockData";

type AppView = "loading" | "login" | "owner" | "employee";

function getCurrentWeekStart(): string {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, "0");
  const d = String(monday.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function App() {
  const [view, setView] = useState<AppView>("loading");
  const [weekStart, setWeekStart] = useState(getCurrentWeekStart());
  const [activeEmployeeId, setActiveEmployeeId] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payLevelRates, setPayLevelRates] = useState<PayLevelRates>(mockPayLevelRates);
  const [penaltyRates, setPenaltyRates] = useState<PenaltyRates>(payrollPenaltyMultipliers);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [schedules, setSchedules] = useState<WeekSchedule[]>([]);

  async function loadAppData() {
    const [emps, rates, penalties, scheds, avails] = await Promise.all([
      db.getEmployees(),
      db.getPayLevelRates(),
      db.getPenaltyRates(),
      db.getWeekSchedules(),
      db.getAvailabilities(),
    ]);
    setEmployees(emps);
    setPayLevelRates(rates);
    setPenaltyRates(penalties);
    setSchedules(scheds);
    setAvailabilities(avails);
  }

  useEffect(() => {
    // Restore existing session on page load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        setView("login");
        return;
      }

      const { data: profile } = await supabase
        .from("employees")
        .select("is_owner")
        .eq("id", session.user.id)
        .maybeSingle();

      await loadAppData();

      if (profile?.is_owner) {
        setView("owner");
      } else {
        setActiveEmployeeId(session.user.id);
        setView("employee");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setView("login");
        setEmployees([]);
        setSchedules([]);
        setAvailabilities([]);
        setActiveEmployeeId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const currentSchedule = useMemo(() => {
    const schedule = schedules.find((s) => s.weekStart === weekStart) ?? {
      weekStart,
      assignments: [],
    };
    return applyScheduleBreakDefaults(schedule);
  }, [schedules, weekStart]);

  const activeEmployee = useMemo(
    () => employees.find((e) => e.id === activeEmployeeId) ?? employees[0],
    [employees, activeEmployeeId],
  );

  // ----------------------------------------------------------------
  // Auth
  // ----------------------------------------------------------------

  async function handleLogin(username: string, password: string): Promise<boolean> {
    const email = `${username}@sushirevolution.internal`;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) return false;

    const { data: profile } = await supabase
      .from("employees")
      .select("is_owner")
      .eq("id", data.user.id)
      .maybeSingle();

    await loadAppData();

    if (profile?.is_owner) {
      setView("owner");
    } else {
      setActiveEmployeeId(data.user.id);
      setWeekStart(getCurrentWeekStart());
      setView("employee");
    }

    return true;
  }

  async function handleBack() {
    await supabase.auth.signOut();
    setView("login");
  }

  // ----------------------------------------------------------------
  // Availability
  // ----------------------------------------------------------------

  function handleSubmitAvailability(nextAvailability: Availability) {
    setAvailabilities((current) => upsertAvailability(current, nextAvailability));
    db.upsertAvailability(nextAvailability).catch(console.error);
  }

  // ----------------------------------------------------------------
  // Schedule mutations
  // ----------------------------------------------------------------

  function handleAssignEmployee(selection: ShiftSelection, employeeId: string) {
    const defaultTime =
      selection.shiftType === "night"
        ? { startTime: "16:00", endTime: getDayNightEndTime(currentSchedule, selection.day) }
        : getDefaultShiftTime(selection.shiftType);

    setSchedules((current) =>
      addEmployeeToSchedule(current, weekStart, selection, employeeId),
    );

    db.addEmployeeToShift(
      weekStart,
      selection,
      employeeId,
      defaultTime.startTime,
      defaultTime.endTime,
    ).catch(console.error);
  }

  function handleRemoveEmployee(selection: ShiftSelection, employeeId: string) {
    setSchedules((current) =>
      removeEmployeeFromSchedule(current, weekStart, selection, employeeId),
    );
    db.removeEmployeeFromShift(weekStart, selection, employeeId).catch(console.error);
  }

  function handleUpdateAssignedEmployeeTime(
    selection: ShiftSelection,
    employeeId: string,
    startTime: string,
    endTime: string,
  ) {
    setSchedules((current) =>
      updateAssignedEmployeeTime(current, weekStart, selection, employeeId, startTime, endTime),
    );
    db.updateEmployeeShiftTime(
      weekStart,
      selection,
      employeeId,
      normalizeRestaurantTime(startTime),
      normalizeRestaurantTime(endTime),
    ).catch(console.error);
  }

  function handleUpdateAssignedEmployeeBreak(
    selection: ShiftSelection,
    employeeId: string,
    breakHours: number,
  ) {
    setSchedules((current) =>
      updateAssignedEmployeeBreak(current, weekStart, selection, employeeId, breakHours),
    );
    db.updateEmployeeShiftBreak(weekStart, selection, employeeId, breakHours).catch(console.error);
  }

  function handleUpdateDayNightEnd(day: DayKey, endTime: string) {
    setSchedules((current) => updateDayNightEndTime(current, weekStart, day, endTime));
    db.updateNightEndTime(weekStart, day, normalizeRestaurantTime(endTime)).catch(console.error);
  }

  function handleTogglePublicHoliday(day: DayKey) {
    const currentHolidays = currentSchedule.publicHolidays ?? [];
    const nextHolidays = currentHolidays.includes(day)
      ? currentHolidays.filter((d) => d !== day)
      : [...currentHolidays, day];

    setSchedules((current) =>
      current.map((s) => {
        if (s.weekStart !== weekStart) return s;
        const existing = s.publicHolidays ?? [];
        const next = existing.includes(day)
          ? existing.filter((d) => d !== day)
          : [...existing, day];
        return { ...s, publicHolidays: next };
      }),
    );

    db.setPublicHolidays(weekStart, nextHolidays).catch(console.error);
  }

  // ----------------------------------------------------------------
  // Employee management
  // ----------------------------------------------------------------

  async function handleAddEmployee(
    name: string,
    roles: Role[],
    level: PayLevel,
    password: string,
  ): Promise<void> {
    const username = name.trim().toLowerCase().replace(/\s+/g, "");
    const employee = await db.createEmployee({ name: name.trim(), username, roles, level, password });
    setEmployees((current) => [...current, employee]);
  }

  async function handleEditEmployee(
    employeeId: string,
    updates: { name: string; roles: Role[]; level: PayLevel; password?: string },
  ): Promise<void> {
    await db.updateEmployeeProfile(employeeId, updates);
    if (updates.password) {
      await db.updateEmployeePassword(employeeId, updates.password);
    }
    setEmployees((current) =>
      current.map((e) => {
        if (e.id !== employeeId) return e;
        return { ...e, name: updates.name, role: updates.roles[0], roles: updates.roles, level: updates.level };
      }),
    );
  }

  async function handleDeleteEmployee(employeeId: string): Promise<void> {
    await db.deleteEmployee(employeeId);
    setEmployees((current) => current.filter((e) => e.id !== employeeId));
  }

  function handleUpdateEmployeeLevel(employeeId: string, level: PayLevel) {
    setEmployees((current) =>
      current.map((e) => (e.id === employeeId ? { ...e, level } : e)),
    );
    db.updateEmployeeLevel(employeeId, level).catch(console.error);
  }

  function handleUpdatePayLevelRate(level: PayLevel, hourlyRate: number) {
    setPayLevelRates((current) => ({ ...current, [level]: hourlyRate }));
    db.updatePayLevelRate(level, hourlyRate).catch(console.error);
  }

  function handleUpdatePenaltyRate(key: keyof PenaltyRates, value: number) {
    setPenaltyRates((current) => ({ ...current, [key]: value }));
    db.updatePenaltyRate(key, value).catch(console.error);
  }

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------

  if (view === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm font-semibold text-slate-500">Loading…</p>
      </main>
    );
  }

  if (view === "owner") {
    return (
      <OwnerDashboardPage
        availabilities={availabilities}
        employees={employees}
        onAddEmployee={handleAddEmployee}
        onAssignEmployee={handleAssignEmployee}
        onBack={handleBack}
        onDeleteEmployee={handleDeleteEmployee}
        onEditEmployee={handleEditEmployee}
        onRemoveEmployee={handleRemoveEmployee}
        onUpdateAssignedEmployeeBreak={handleUpdateAssignedEmployeeBreak}
        onUpdateAssignedEmployeeTime={handleUpdateAssignedEmployeeTime}
        onUpdateDayNightEnd={handleUpdateDayNightEnd}
        onUpdateEmployeeLevel={handleUpdateEmployeeLevel}
        onTogglePublicHoliday={handleTogglePublicHoliday}
        onUpdatePayLevelRate={handleUpdatePayLevelRate}
        onUpdatePenaltyRate={handleUpdatePenaltyRate}
        onWeekChange={setWeekStart}
        payLevelRates={payLevelRates}
        penaltyRates={penaltyRates}
        schedule={currentSchedule}
        weekStart={weekStart}
      />
    );
  }

  if (view === "employee" && activeEmployee) {
    return (
      <EmployeeAvailabilityPage
        availabilities={availabilities}
        employee={activeEmployee}
        onBack={handleBack}
        onSubmitAvailability={handleSubmitAvailability}
        weekStart={getCurrentWeekStart()}
      />
    );
  }

  return <LoginPage onLogin={handleLogin} />;
}
