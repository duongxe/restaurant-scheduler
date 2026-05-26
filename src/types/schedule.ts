export const DAYS = [
  { key: "mon", label: "Mon", fullLabel: "Monday" },
  { key: "tue", label: "Tue", fullLabel: "Tuesday" },
  { key: "wed", label: "Wed", fullLabel: "Wednesday" },
  { key: "thu", label: "Thu", fullLabel: "Thursday" },
  { key: "fri", label: "Fri", fullLabel: "Friday" },
  { key: "sat", label: "Sat", fullLabel: "Saturday" },
  { key: "sun", label: "Sun", fullLabel: "Sunday" },
] as const;

export const ROLES = ["waiter", "sushi maker", "kitchen"] as const;
export const SHIFT_TYPES = ["morning", "night"] as const;
export const AVAILABILITY_OPTIONS = [
  "full day",
  "morning",
  "night",
  "unavailable",
] as const;

export type DayKey = (typeof DAYS)[number]["key"];
export type Role = (typeof ROLES)[number];
export type ShiftType = (typeof SHIFT_TYPES)[number];
export type AvailabilityValue = (typeof AVAILABILITY_OPTIONS)[number];
export type PayLevel = 0 | 1 | 2 | 3 | 4;

export type DayAvailabilityMap = Record<DayKey, AvailabilityValue>;

export interface Employee {
  id: string;
  name: string;
  role: Role;
  roles: Role[];
  username: string;
  email: string;
  phone: string;
  level: PayLevel;
  password: string;
}

export type PayLevelRates = Record<PayLevel, number>;

export interface PenaltyRates {
  weekday: number;
  saturday: number;
  sunday: number;
  publicHoliday: number;
}

export interface Availability {
  employeeId: string;
  weekStart: string;
  days: DayAvailabilityMap;
}

export interface AssignedShiftEmployee {
  employeeId: string;
  startTime: string;
  endTime: string;
  breakHours: number;
  breakEdited?: boolean;
}

export interface ShiftAssignment {
  id: string;
  day: DayKey;
  role: Role;
  shiftType: ShiftType;
  assignedEmployees: AssignedShiftEmployee[];
}

export interface WeekSchedule {
  weekStart: string;
  assignments: ShiftAssignment[];
  nightEndTimes?: Partial<Record<DayKey, string>>;
  publicHolidays?: DayKey[];
}

export interface ShiftSelection {
  day: DayKey;
  role: Role;
  shiftType: ShiftType;
}

export interface EmployeeScheduleShift {
  id: string;
  day: DayKey;
  role: Role;
  shiftType: ShiftType;
  startTime: string;
  endTime: string;
  breakHours: number;
}

export interface EmployeeScheduleSummary {
  employee: Employee;
  shifts: EmployeeScheduleShift[];
}
