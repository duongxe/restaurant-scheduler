import type {
  Availability,
  DayKey,
  Employee,
  PayLevel,
  PayLevelRates,
  PenaltyRates,
  Role,
  ShiftAssignment,
  ShiftSelection,
  WeekSchedule,
} from "../types/schedule";
import { mockPayLevelRates } from "../data/mockData";
import { payrollPenaltyMultipliers } from "../utils/schedule";
import { supabase } from "./supabase";

// ----------------------------------------------------------------
// Type mappers
// ----------------------------------------------------------------

function mapEmployee(row: Record<string, unknown>): Employee {
  return {
    id: row.id as string,
    name: row.name as string,
    username: row.username as string,
    role: row.role as Role,
    roles: row.roles as Role[],
    level: row.level as PayLevel,
    email: "",
    phone: "",
    password: "",
  };
}

function mapWeekSchedule(row: Record<string, unknown>): WeekSchedule {
  const assignmentRows = (row.shift_assignments as Record<string, unknown>[]) ?? [];

  const assignments: ShiftAssignment[] = assignmentRows.map((sa) => {
    const employeeRows = (sa.assigned_shift_employees as Record<string, unknown>[]) ?? [];
    return {
      id: sa.id as string,
      day: sa.day as DayKey,
      role: sa.role as Role,
      shiftType: sa.shift_type as "morning" | "night",
      assignedEmployees: employeeRows.map((ae) => ({
        employeeId: ae.employee_id as string,
        startTime: ae.start_time as string,
        endTime: ae.end_time as string,
        breakHours: Number(ae.break_hours ?? 0),
        breakEdited: Boolean(ae.break_edited),
      })),
    };
  });

  return {
    weekStart: row.week_start as string,
    assignments,
    nightEndTimes: (row.night_end_times as Partial<Record<DayKey, string>>) ?? {},
    publicHolidays: (row.public_holidays as DayKey[]) ?? [],
  };
}

// ----------------------------------------------------------------
// Read functions
// ----------------------------------------------------------------

export async function getEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase.from("employees").select("*").order("name");
  if (error) throw error;
  return (data ?? []).map(mapEmployee);
}

export async function getPayLevelRates(): Promise<PayLevelRates> {
  const { data, error } = await supabase.from("pay_level_rates").select("*").order("level");
  if (error) throw error;

  const rates: PayLevelRates = { ...mockPayLevelRates };
  for (const row of data ?? []) {
    rates[row.level as PayLevel] = Number(row.hourly_rate);
  }
  return rates;
}

export async function getPenaltyRates(): Promise<PenaltyRates> {
  const { data, error } = await supabase
    .from("penalty_rates")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) return { ...payrollPenaltyMultipliers };

  return {
    weekday: Number(data.weekday),
    saturday: Number(data.saturday),
    sunday: Number(data.sunday),
    publicHoliday: Number(data.public_holiday),
  };
}

export async function getWeekSchedules(): Promise<WeekSchedule[]> {
  const { data, error } = await supabase
    .from("week_schedules")
    .select(`*, shift_assignments (*, assigned_shift_employees (*))`)
    .order("week_start");

  if (error) throw error;
  return (data ?? []).map(mapWeekSchedule);
}

export async function getAvailabilities(): Promise<Availability[]> {
  const { data, error } = await supabase.from("availabilities").select("*");
  if (error) throw error;

  return (data ?? []).map((row) => ({
    employeeId: row.employee_id as string,
    weekStart: row.week_start as string,
    days: row.days as Availability["days"],
  }));
}

// ----------------------------------------------------------------
// Week schedule helpers
// ----------------------------------------------------------------

async function getOrCreateWeekScheduleId(weekStart: string): Promise<string> {
  const { data: existing } = await supabase
    .from("week_schedules")
    .select("id")
    .eq("week_start", weekStart)
    .maybeSingle();

  if (existing) return existing.id as string;

  const { data, error } = await supabase
    .from("week_schedules")
    .insert({ week_start: weekStart })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

function assignmentId(weekStart: string, selection: ShiftSelection): string {
  return `${weekStart}-${selection.day}-${selection.role.replace(" ", "-")}-${selection.shiftType}`;
}

async function ensureShiftAssignment(
  weekScheduleId: string,
  weekStart: string,
  selection: ShiftSelection,
): Promise<void> {
  const id = assignmentId(weekStart, selection);
  await supabase.from("shift_assignments").upsert(
    { id, week_schedule_id: weekScheduleId, day: selection.day, role: selection.role, shift_type: selection.shiftType },
    { onConflict: "id" },
  );
}

// ----------------------------------------------------------------
// Schedule write functions
// ----------------------------------------------------------------

export async function addEmployeeToShift(
  weekStart: string,
  selection: ShiftSelection,
  employeeId: string,
  startTime: string,
  endTime: string,
): Promise<void> {
  const weekScheduleId = await getOrCreateWeekScheduleId(weekStart);
  await ensureShiftAssignment(weekScheduleId, weekStart, selection);

  const { error } = await supabase.from("assigned_shift_employees").upsert(
    {
      shift_assignment_id: assignmentId(weekStart, selection),
      employee_id: employeeId,
      start_time: startTime,
      end_time: endTime,
      break_hours: 0,
    },
    { onConflict: "shift_assignment_id,employee_id" },
  );

  if (error) throw error;
}

export async function removeEmployeeFromShift(
  weekStart: string,
  selection: ShiftSelection,
  employeeId: string,
): Promise<void> {
  const { error } = await supabase
    .from("assigned_shift_employees")
    .delete()
    .eq("shift_assignment_id", assignmentId(weekStart, selection))
    .eq("employee_id", employeeId);

  if (error) throw error;
}

export async function updateEmployeeShiftTime(
  weekStart: string,
  selection: ShiftSelection,
  employeeId: string,
  startTime: string,
  endTime: string,
): Promise<void> {
  const { error } = await supabase
    .from("assigned_shift_employees")
    .update({ start_time: startTime, end_time: endTime })
    .eq("shift_assignment_id", assignmentId(weekStart, selection))
    .eq("employee_id", employeeId);

  if (error) throw error;
}

export async function updateEmployeeShiftBreak(
  weekStart: string,
  selection: ShiftSelection,
  employeeId: string,
  breakHours: number,
): Promise<void> {
  const { error } = await supabase
    .from("assigned_shift_employees")
    .update({ break_hours: breakHours, break_edited: true })
    .eq("shift_assignment_id", assignmentId(weekStart, selection))
    .eq("employee_id", employeeId);

  if (error) throw error;
}

export async function updateNightEndTime(
  weekStart: string,
  day: DayKey,
  endTime: string,
): Promise<void> {
  const weekScheduleId = await getOrCreateWeekScheduleId(weekStart);

  const { data: existing } = await supabase
    .from("week_schedules")
    .select("night_end_times")
    .eq("id", weekScheduleId)
    .single();

  await supabase
    .from("week_schedules")
    .update({ night_end_times: { ...(existing?.night_end_times ?? {}), [day]: endTime } })
    .eq("id", weekScheduleId);

  // Also update end_time for all assigned night-shift employees on this day
  const { data: nightAssignments } = await supabase
    .from("shift_assignments")
    .select("id")
    .eq("week_schedule_id", weekScheduleId)
    .eq("day", day)
    .eq("shift_type", "night");

  if (nightAssignments && nightAssignments.length > 0) {
    await supabase
      .from("assigned_shift_employees")
      .update({ end_time: endTime })
      .in("shift_assignment_id", nightAssignments.map((a) => a.id));
  }
}

export async function setPublicHolidays(weekStart: string, publicHolidays: DayKey[]): Promise<void> {
  await getOrCreateWeekScheduleId(weekStart);
  const { error } = await supabase
    .from("week_schedules")
    .update({ public_holidays: publicHolidays })
    .eq("week_start", weekStart);

  if (error) throw error;
}

// ----------------------------------------------------------------
// Rate write functions
// ----------------------------------------------------------------

export async function updatePayLevelRate(level: PayLevel, hourlyRate: number): Promise<void> {
  const { error } = await supabase
    .from("pay_level_rates")
    .upsert({ level, hourly_rate: hourlyRate });

  if (error) throw error;
}

export async function updatePenaltyRate(key: keyof PenaltyRates, value: number): Promise<void> {
  const columnMap: Record<keyof PenaltyRates, string> = {
    weekday: "weekday",
    saturday: "saturday",
    sunday: "sunday",
    publicHoliday: "public_holiday",
  };

  const { error } = await supabase
    .from("penalty_rates")
    .update({ [columnMap[key]]: value })
    .eq("id", 1);

  if (error) throw error;
}

// ----------------------------------------------------------------
// Employee write functions (profile only — auth via API routes)
// ----------------------------------------------------------------

export async function updateEmployeeProfile(
  employeeId: string,
  updates: { name: string; roles: Role[]; level: PayLevel },
): Promise<void> {
  const { error } = await supabase
    .from("employees")
    .update({ name: updates.name, role: updates.roles[0], roles: updates.roles, level: updates.level })
    .eq("id", employeeId);

  if (error) throw error;
}

export async function updateEmployeeLevel(employeeId: string, level: PayLevel): Promise<void> {
  const { error } = await supabase.from("employees").update({ level }).eq("id", employeeId);
  if (error) throw error;
}

// ----------------------------------------------------------------
// Availability write function
// ----------------------------------------------------------------

export async function upsertAvailability(availability: Availability): Promise<void> {
  const { error } = await supabase.from("availabilities").upsert(
    { employee_id: availability.employeeId, week_start: availability.weekStart, days: availability.days },
    { onConflict: "employee_id,week_start" },
  );

  if (error) throw error;
}

// ----------------------------------------------------------------
// Employee admin functions (call Vercel API routes)
// ----------------------------------------------------------------

async function getAccessToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? "";
}

async function callApi<T>(path: string, body: unknown): Promise<T> {
  const token = await getAccessToken();
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function createEmployee(params: {
  name: string;
  username: string;
  roles: Role[];
  level: PayLevel;
  password: string;
}): Promise<Employee> {
  return callApi<Employee>("/api/create-employee", params);
}

export async function deleteEmployee(employeeId: string): Promise<void> {
  await callApi("/api/delete-employee", { employeeId });
}

export async function updateEmployeePassword(
  employeeId: string,
  password: string,
): Promise<void> {
  await callApi("/api/update-employee", { employeeId, password });
}
