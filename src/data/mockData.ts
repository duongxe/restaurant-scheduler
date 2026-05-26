import type {
  Availability,
  DayAvailabilityMap,
  Employee,
  PayLevelRates,
  Role,
  ShiftAssignment,
} from "../types/schedule";

export const MOCK_WEEK_START = "2026-04-27";
export const OWNER_ACCOUNT = { name: "Sohn", username: "sohn", password: "88888888" };

export const mockPayLevelRates: PayLevelRates = {
  0: 23.5,
  1: 25,
  2: 27,
  3: 30,
  4: 32,
};

function makeEmployee(
  name: string,
  roles: Role[],
  level: Employee["level"],
): Employee {
  const username = name.toLowerCase().replace(/\s+/g, "");

  return {
    id: `emp-${username}`,
    name,
    role: roles[0],
    roles,
    username,
    email: "",
    phone: "",
    level,
    password: "1",
  };
}

export const mockEmployees: Employee[] = [
  makeEmployee("Nick", ["waiter", "kitchen"], 2),
  makeEmployee("Chloe", ["waiter"], 1),
  makeEmployee("Dahami", ["waiter"], 1),
  makeEmployee("Kyra", ["waiter", "sushi maker"], 2),
  makeEmployee("Nam", ["waiter"], 1),
  makeEmployee("Tai", ["waiter"], 1),
  makeEmployee("Tasha", ["waiter"], 1),
  makeEmployee("Chang", ["sushi maker"], 3),
  makeEmployee("Luna", ["sushi maker"], 2),
  makeEmployee("Irenee", ["sushi maker"], 2),
  makeEmployee("Ngoc Minh", ["sushi maker"], 3),
  makeEmployee("Winnie", ["sushi maker"], 2),
  makeEmployee("Lydia", ["sushi maker"], 2),
  makeEmployee("Yuki", ["sushi maker"], 3),
  makeEmployee("Wanice", ["sushi maker"], 2),
  makeEmployee("Zoe", ["sushi maker"], 2),
  makeEmployee("David", ["kitchen"], 2),
  makeEmployee("Max", ["kitchen"], 1),
  makeEmployee("Asher", ["kitchen"], 1),
  makeEmployee("Mishka", ["kitchen"], 2),
];

const availabilityPatterns: DayAvailabilityMap[] = [
  {
    mon: "full day",
    tue: "morning",
    wed: "night",
    thu: "full day",
    fri: "unavailable",
    sat: "night",
    sun: "full day",
  },
  {
    mon: "morning",
    tue: "full day",
    wed: "unavailable",
    thu: "night",
    fri: "full day",
    sat: "morning",
    sun: "night",
  },
  {
    mon: "night",
    tue: "unavailable",
    wed: "full day",
    thu: "morning",
    fri: "night",
    sat: "full day",
    sun: "unavailable",
  },
  {
    mon: "unavailable",
    tue: "night",
    wed: "morning",
    thu: "full day",
    fri: "morning",
    sat: "night",
    sun: "full day",
  },
];

export const mockAvailabilities: Availability[] = mockEmployees.map(
  (employee, index) => ({
    employeeId: employee.id,
    weekStart: MOCK_WEEK_START,
    days: availabilityPatterns[index % availabilityPatterns.length],
  }),
);

export const mockAssignments: ShiftAssignment[] = [
  {
    id: `${MOCK_WEEK_START}-mon-waiter-morning`,
    day: "mon",
    role: "waiter",
    shiftType: "morning",
    assignedEmployees: [
      {
        employeeId: "emp-nick",
        startTime: "10:00",
        endTime: "16:00",
        breakHours: 0,
      },
    ],
  },
  {
    id: `${MOCK_WEEK_START}-mon-sushi-maker-night`,
    day: "mon",
    role: "sushi maker",
    shiftType: "night",
    assignedEmployees: [
      {
        employeeId: "emp-chang",
        startTime: "16:00",
        endTime: "21:00",
        breakHours: 0,
      },
    ],
  },
  {
    id: `${MOCK_WEEK_START}-fri-kitchen-night`,
    day: "fri",
    role: "kitchen",
    shiftType: "night",
    assignedEmployees: [
      {
        employeeId: "emp-david",
        startTime: "16:00",
        endTime: "21:00",
        breakHours: 0,
      },
    ],
  },
  {
    id: `${MOCK_WEEK_START}-sat-waiter-night`,
    day: "sat",
    role: "waiter",
    shiftType: "night",
    assignedEmployees: [
      {
        employeeId: "emp-kyra",
        startTime: "16:00",
        endTime: "21:00",
        breakHours: 0,
      },
    ],
  },
];
