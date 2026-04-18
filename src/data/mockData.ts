import type {
  Availability,
  Employee,
  PayLevelRates,
  ShiftAssignment,
} from "../types/schedule";

export const MOCK_WEEK_START = "2026-04-13";

export const mockPayLevelRates: PayLevelRates = {
  0: 23.5,
  1: 25,
  2: 27,
  3: 30,
  4: 32,
};

export const mockEmployees: Employee[] = [
  { id: "emp-1", name: "Hana Sato", role: "waiter", level: 2 },
  { id: "emp-2", name: "Liam Tran", role: "waiter", level: 1 },
  { id: "emp-3", name: "Mei Chen", role: "sushi maker", level: 3 },
  { id: "emp-4", name: "Kenji Mori", role: "sushi maker", level: 4 },
  { id: "emp-5", name: "Priya Shah", role: "kitchen", level: 2 },
  { id: "emp-6", name: "Noah Kim", role: "kitchen", level: 2 },
  { id: "emp-7", name: "Sofia Nguyen", role: "waiter", level: 0 },
  { id: "emp-8", name: "Yuki Tanaka", role: "sushi maker", level: 3 },
  { id: "emp-9", name: "Oscar Patel", role: "kitchen", level: 1 },
];

export const mockAvailabilities: Availability[] = [
  {
    employeeId: "emp-1",
    weekStart: MOCK_WEEK_START,
    days: {
      mon: "full day",
      tue: "morning",
      wed: "night",
      thu: "full day",
      fri: "unavailable",
      sat: "night",
      sun: "full day",
    },
  },
  {
    employeeId: "emp-2",
    weekStart: MOCK_WEEK_START,
    days: {
      mon: "morning",
      tue: "full day",
      wed: "unavailable",
      thu: "night",
      fri: "full day",
      sat: "morning",
      sun: "night",
    },
  },
  {
    employeeId: "emp-3",
    weekStart: MOCK_WEEK_START,
    days: {
      mon: "full day",
      tue: "unavailable",
      wed: "morning",
      thu: "full day",
      fri: "night",
      sat: "full day",
      sun: "night",
    },
  },
  {
    employeeId: "emp-4",
    weekStart: MOCK_WEEK_START,
    days: {
      mon: "night",
      tue: "full day",
      wed: "full day",
      thu: "morning",
      fri: "unavailable",
      sat: "night",
      sun: "full day",
    },
  },
  {
    employeeId: "emp-5",
    weekStart: MOCK_WEEK_START,
    days: {
      mon: "full day",
      tue: "morning",
      wed: "night",
      thu: "unavailable",
      fri: "full day",
      sat: "full day",
      sun: "morning",
    },
  },
  {
    employeeId: "emp-6",
    weekStart: MOCK_WEEK_START,
    days: {
      mon: "unavailable",
      tue: "full day",
      wed: "morning",
      thu: "night",
      fri: "night",
      sat: "full day",
      sun: "full day",
    },
  },
  {
    employeeId: "emp-7",
    weekStart: MOCK_WEEK_START,
    days: {
      mon: "night",
      tue: "night",
      wed: "full day",
      thu: "unavailable",
      fri: "morning",
      sat: "full day",
      sun: "unavailable",
    },
  },
  {
    employeeId: "emp-8",
    weekStart: MOCK_WEEK_START,
    days: {
      mon: "morning",
      tue: "night",
      wed: "unavailable",
      thu: "full day",
      fri: "full day",
      sat: "morning",
      sun: "night",
    },
  },
  {
    employeeId: "emp-9",
    weekStart: MOCK_WEEK_START,
    days: {
      mon: "night",
      tue: "unavailable",
      wed: "full day",
      thu: "full day",
      fri: "morning",
      sat: "night",
      sun: "unavailable",
    },
  },
];

export const mockAssignments: ShiftAssignment[] = [
  {
    id: `${MOCK_WEEK_START}-mon-waiter-morning`,
    day: "mon",
    role: "waiter",
    shiftType: "morning",
    assignedEmployees: [
      { employeeId: "emp-1", startTime: "10:00", endTime: "16:00" },
    ],
  },
  {
    id: `${MOCK_WEEK_START}-mon-sushi-maker-night`,
    day: "mon",
    role: "sushi maker",
    shiftType: "night",
    assignedEmployees: [
      { employeeId: "emp-4", startTime: "16:00", endTime: "21:00" },
    ],
  },
  {
    id: `${MOCK_WEEK_START}-fri-kitchen-night`,
    day: "fri",
    role: "kitchen",
    shiftType: "night",
    assignedEmployees: [
      { employeeId: "emp-6", startTime: "16:00", endTime: "21:00" },
    ],
  },
  {
    id: `${MOCK_WEEK_START}-sat-waiter-night`,
    day: "sat",
    role: "waiter",
    shiftType: "night",
    assignedEmployees: [
      { employeeId: "emp-7", startTime: "16:00", endTime: "21:00" },
    ],
  },
];
