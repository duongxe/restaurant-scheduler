import type {
  Availability,
  AvailabilityValue,
  DayAvailabilityMap,
  DayKey,
  Employee,
  Role,
  ShiftAssignment,
  ShiftSelection,
  ShiftType,
  WeekSchedule,
} from "../types/schedule";
import { DAYS } from "../types/schedule";

export const roleLabels: Record<Role, string> = {
  waiter: "Waiter",
  "sushi maker": "Sushi maker",
  kitchen: "Kitchen",
};

export const shiftLabels: Record<ShiftType, string> = {
  morning: "Morning",
  night: "Night",
};

export const shiftTimeLabels: Record<ShiftType, string> = {
  morning: "10:00-16:00",
  night: "16:00-21:00",
};

export const availabilityLabels: Record<AvailabilityValue, string> = {
  "full day": "Full day",
  morning: "Morning",
  night: "Night",
  unavailable: "Unavailable",
};

export const roleStyles: Record<
  Role,
  { section: string; badge: string; border: string; text: string }
> = {
  waiter: {
    section: "bg-emerald-50 border-emerald-200",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    border: "border-emerald-300",
    text: "text-emerald-900",
  },
  "sushi maker": {
    section: "bg-sky-50 border-sky-200",
    badge: "bg-sky-100 text-sky-800 border-sky-200",
    border: "border-sky-300",
    text: "text-sky-900",
  },
  kitchen: {
    section: "bg-amber-50 border-amber-200",
    badge: "bg-amber-100 text-amber-900 border-amber-200",
    border: "border-amber-300",
    text: "text-amber-950",
  },
};

export function availabilitySupportsShift(
  availability: AvailabilityValue,
  shiftType: ShiftType,
) {
  if (availability === "full day") {
    return true;
  }

  return availability === shiftType;
}

export function getDefaultShiftTime(shiftType: ShiftType) {
  return shiftType === "morning"
    ? { startTime: "10:00", endTime: "16:00" }
    : { startTime: "16:00", endTime: "21:00" };
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function normalizeRestaurantTime(time: string) {
  const [rawHours, minutes] = time.split(":").map(Number);
  const hours = rawHours > 0 && rawHours < 10 ? rawHours + 12 : rawHours;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function calculateShiftHours(startTime: string, endTime: string) {
  const minutes =
    timeToMinutes(normalizeRestaurantTime(endTime)) -
    timeToMinutes(normalizeRestaurantTime(startTime));
  return Math.max(0, minutes / 60);
}

export function formatHours(hours: number) {
  return Number.isInteger(hours) ? `${hours}` : hours.toFixed(1);
}

export function formatShiftTimeRange(startTime: string, endTime: string) {
  return `${normalizeRestaurantTime(startTime)}-${normalizeRestaurantTime(endTime)}`;
}

export function getDayNightEndTime(schedule: WeekSchedule, day: DayKey) {
  const savedEndTime = schedule.nightEndTimes?.[day];

  if (savedEndTime) {
    return savedEndTime;
  }

  const assignedNightEndTimes = schedule.assignments
    .filter(
      (assignment) => assignment.day === day && assignment.shiftType === "night",
    )
    .flatMap((assignment) =>
      assignment.assignedEmployees.map((assignedEmployee) =>
        normalizeRestaurantTime(assignedEmployee.endTime),
      ),
    );

  if (assignedNightEndTimes.length === 0) {
    return getDefaultShiftTime("night").endTime;
  }

  return assignedNightEndTimes.sort(
    (a, b) => timeToMinutes(b) - timeToMinutes(a),
  )[0];
}

function getDefaultAssignedTime(
  schedule: WeekSchedule,
  selection: ShiftSelection,
) {
  const defaultTime = getDefaultShiftTime(selection.shiftType);

  if (selection.shiftType === "night") {
    return {
      ...defaultTime,
      endTime: getDayNightEndTime(schedule, selection.day),
    };
  }

  return defaultTime;
}

export function createEmptyAvailability(
  employeeId: string,
  weekStart: string,
): Availability {
  return {
    employeeId,
    weekStart,
    days: DAYS.reduce((days, day) => {
      days[day.key] = "unavailable";
      return days;
    }, {} as DayAvailabilityMap),
  };
}

export function getEmployeeAvailability(
  availabilities: Availability[],
  employeeId: string,
  weekStart: string,
) {
  return availabilities.find(
    (availability) =>
      availability.employeeId === employeeId && availability.weekStart === weekStart,
  );
}

export function getEmployeeAvailabilityValue(
  availabilities: Availability[],
  employeeId: string,
  weekStart: string,
  day: DayKey,
) {
  return (
    getEmployeeAvailability(availabilities, employeeId, weekStart)?.days[day] ??
    "unavailable"
  );
}

export function upsertAvailability(
  availabilities: Availability[],
  nextAvailability: Availability,
) {
  const exists = availabilities.some(
    (availability) =>
      availability.employeeId === nextAvailability.employeeId &&
      availability.weekStart === nextAvailability.weekStart,
  );

  if (!exists) {
    return [...availabilities, nextAvailability];
  }

  return availabilities.map((availability) =>
    availability.employeeId === nextAvailability.employeeId &&
    availability.weekStart === nextAvailability.weekStart
      ? nextAvailability
      : availability,
  );
}

export function getAssignment(
  schedule: WeekSchedule,
  selection: ShiftSelection,
) {
  return schedule.assignments.find(
    (assignment) =>
      assignment.day === selection.day &&
      assignment.role === selection.role &&
      assignment.shiftType === selection.shiftType,
  );
}

export function getAssignedEmployees(
  schedule: WeekSchedule,
  selection: ShiftSelection,
  employees: Employee[],
) {
  return getAssignedEmployeeEntries(schedule, selection, employees).map(
    (entry) => entry.employee,
  );
}

export function getAssignedEmployeeEntries(
  schedule: WeekSchedule,
  selection: ShiftSelection,
  employees: Employee[],
) {
  const assignment = getAssignment(schedule, selection);

  if (!assignment) {
    return [];
  }

  return assignment.assignedEmployees
    .map((assignedEmployee) => {
      const employee = employees.find(
        (item) => item.id === assignedEmployee.employeeId,
      );

      return employee ? { ...assignedEmployee, employee } : null;
    })
    .filter(
      (
        entry,
      ): entry is {
        employeeId: string;
        startTime: string;
        endTime: string;
        employee: Employee;
      } => Boolean(entry),
    );
}

export function getAssignedShiftLabels(
  schedule: WeekSchedule,
  employeeId: string,
  day: DayKey,
) {
  return schedule.assignments
    .filter(
      (assignment) =>
        assignment.day === day &&
        assignment.assignedEmployees.some(
          (assignedEmployee) => assignedEmployee.employeeId === employeeId,
        ),
    )
    .map(
      (assignment) =>
        `${roleLabels[assignment.role]} ${shiftLabels[assignment.shiftType]}`,
    );
}

export function addEmployeeToSchedule(
  schedules: WeekSchedule[],
  weekStart: string,
  selection: ShiftSelection,
  employeeId: string,
) {
  const scheduleIndex = schedules.findIndex(
    (schedule) => schedule.weekStart === weekStart,
  );
  const existingSchedule =
    scheduleIndex >= 0 ? schedules[scheduleIndex] : { weekStart, assignments: [] };

  let updatedExistingAssignment = false;
  const assignments = existingSchedule.assignments.map((assignment) => {
    const isTargetShift =
      assignment.day === selection.day &&
      assignment.role === selection.role &&
      assignment.shiftType === selection.shiftType;

    if (!isTargetShift) {
      return assignment;
    }

    updatedExistingAssignment = true;

    if (
      assignment.assignedEmployees.some(
        (assignedEmployee) => assignedEmployee.employeeId === employeeId,
      )
    ) {
      return assignment;
    }

    const defaultTime = getDefaultAssignedTime(existingSchedule, selection);

    return {
      ...assignment,
      assignedEmployees: [
        ...assignment.assignedEmployees,
        { employeeId, ...defaultTime },
      ],
    };
  });

  if (!updatedExistingAssignment) {
    const defaultTime = getDefaultAssignedTime(existingSchedule, selection);

    assignments.push({
      id: `${weekStart}-${selection.day}-${selection.role.replace(" ", "-")}-${
        selection.shiftType
      }`,
      ...selection,
      assignedEmployees: [{ employeeId, ...defaultTime }],
    });
  }

  const updatedSchedule: WeekSchedule = {
    ...existingSchedule,
    assignments,
  };

  if (scheduleIndex === -1) {
    return [...schedules, updatedSchedule];
  }

  return schedules.map((schedule, index) =>
    index === scheduleIndex ? updatedSchedule : schedule,
  );
}

export function removeEmployeeFromSchedule(
  schedules: WeekSchedule[],
  weekStart: string,
  selection: ShiftSelection,
  employeeId: string,
) {
  const scheduleIndex = schedules.findIndex(
    (schedule) => schedule.weekStart === weekStart,
  );

  if (scheduleIndex === -1) {
    return schedules;
  }

  const existingSchedule = schedules[scheduleIndex];
  const assignments = existingSchedule.assignments
    .map((assignment) => {
      const isTargetShift =
        assignment.day === selection.day &&
        assignment.role === selection.role &&
        assignment.shiftType === selection.shiftType;

      if (!isTargetShift) {
        return assignment;
      }

      return {
        ...assignment,
        assignedEmployees: assignment.assignedEmployees.filter(
          (assignedEmployee) => assignedEmployee.employeeId !== employeeId,
        ),
      };
    })
    .filter((assignment) => assignment.assignedEmployees.length > 0);

  const updatedSchedule: WeekSchedule = {
    ...existingSchedule,
    assignments,
  };

  return schedules.map((schedule, index) =>
    index === scheduleIndex ? updatedSchedule : schedule,
  );
}

export function updateAssignedEmployeeTime(
  schedules: WeekSchedule[],
  weekStart: string,
  selection: ShiftSelection,
  employeeId: string,
  startTime: string,
  endTime: string,
) {
  const normalizedStartTime = normalizeRestaurantTime(startTime);
  const normalizedEndTime = normalizeRestaurantTime(endTime);
  const scheduleIndex = schedules.findIndex(
    (schedule) => schedule.weekStart === weekStart,
  );
  const existingSchedule =
    scheduleIndex >= 0 ? schedules[scheduleIndex] : { weekStart, assignments: [] };

  const assignments = existingSchedule.assignments.map((assignment) => {
    const isTargetShift =
      assignment.day === selection.day &&
      assignment.role === selection.role &&
      assignment.shiftType === selection.shiftType;

    if (!isTargetShift) {
      return assignment;
    }

    return {
      ...assignment,
      assignedEmployees: assignment.assignedEmployees.map((assignedEmployee) =>
        assignedEmployee.employeeId === employeeId
          ? {
              ...assignedEmployee,
              startTime: normalizedStartTime,
              endTime: normalizedEndTime,
            }
          : assignedEmployee,
      ),
    };
  });

  const updatedSchedule: WeekSchedule = {
    ...existingSchedule,
    assignments,
  };

  if (scheduleIndex === -1) {
    return [...schedules, updatedSchedule];
  }

  return schedules.map((schedule, index) =>
    index === scheduleIndex ? updatedSchedule : schedule,
  );
}

export function updateDayNightEndTime(
  schedules: WeekSchedule[],
  weekStart: string,
  day: DayKey,
  endTime: string,
) {
  const normalizedEndTime = normalizeRestaurantTime(endTime);
  const scheduleIndex = schedules.findIndex(
    (schedule) => schedule.weekStart === weekStart,
  );
  const existingSchedule =
    scheduleIndex >= 0 ? schedules[scheduleIndex] : { weekStart, assignments: [] };

  const assignments = existingSchedule.assignments.map((assignment) => {
    if (assignment.day !== day || assignment.shiftType !== "night") {
      return assignment;
    }

    return {
      ...assignment,
      assignedEmployees: assignment.assignedEmployees.map((assignedEmployee) => ({
        ...assignedEmployee,
        endTime: normalizedEndTime,
      })),
    };
  });

  const updatedSchedule: WeekSchedule = {
    ...existingSchedule,
    assignments,
    nightEndTimes: {
      ...existingSchedule.nightEndTimes,
      [day]: normalizedEndTime,
    },
  };

  if (scheduleIndex === -1) {
    return [...schedules, updatedSchedule];
  }

  return schedules.map((schedule, index) =>
    index === scheduleIndex ? updatedSchedule : schedule,
  );
}

export function getEmployeeWeeklyTotals(
  schedule: WeekSchedule,
  employees: Employee[],
) {
  return employees
    .map((employee) => {
      const assignedShifts = schedule.assignments.flatMap((assignment) =>
        assignment.assignedEmployees.filter(
          (assignedEmployee) => assignedEmployee.employeeId === employee.id,
        ),
      );
      const hours = assignedShifts.reduce(
        (total, assignment) =>
          total + calculateShiftHours(assignment.startTime, assignment.endTime),
        0,
      );

      return {
        employee,
        hours,
        shiftCount: assignedShifts.length,
      };
    })
    .sort(
      (a, b) =>
        a.hours - b.hours || a.employee.name.localeCompare(b.employee.name),
    );
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(value);
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(value: string, daysToAdd: number) {
  const date = parseLocalDate(value);
  date.setDate(date.getDate() + daysToAdd);
  return date;
}

function formatDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function addWeeksToWeekStart(weekStart: string, weeksToAdd: number) {
  return formatDateInputValue(addDays(weekStart, weeksToAdd * 7));
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    month: "short",
    day: "numeric",
  }).format(parseLocalDate(value));
}

export function formatDayDate(weekStart: string, day: DayKey) {
  const dayOffset = DAYS.findIndex((item) => item.key === day);
  return new Intl.DateTimeFormat("en-AU", {
    month: "short",
    day: "numeric",
  }).format(addDays(weekStart, dayOffset));
}

export function formatWeekRange(weekStart: string) {
  return `${formatShortDate(weekStart)} - ${new Intl.DateTimeFormat("en-AU", {
    month: "short",
    day: "numeric",
  }).format(addDays(weekStart, 6))}`;
}

export function summarizeAvailability(days: DayAvailabilityMap) {
  const counts = Object.values(days).reduce<Record<AvailabilityValue, number>>(
    (summary, value) => {
      summary[value] += 1;
      return summary;
    },
    {
      "full day": 0,
      morning: 0,
      night: 0,
      unavailable: 0,
    },
  );

  return [
    `${counts["full day"]} full`,
    `${counts.morning} morning`,
    `${counts.night} night`,
    `${counts.unavailable} unavailable`,
  ].join(", ");
}

export function getDayLabel(day: DayKey) {
  return DAYS.find((item) => item.key === day)?.fullLabel ?? day;
}
