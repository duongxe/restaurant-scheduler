import type {
  Availability,
  AvailabilityValue,
  DayAvailabilityMap,
  DayKey,
  Employee,
  EmployeeScheduleSummary,
  PayLevelRates,
  PenaltyRates,
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

export const payrollPenaltyMultipliers = {
  weekday: 1,
  saturday: 1.25,
  sunday: 1.5,
  publicHoliday: 2.25,
};

export const availabilityLabels: Record<AvailabilityValue, string> = {
  "full day": "Full day",
  morning: "Morning",
  night: "Night",
  unavailable: "Unavailable",
};

export const roleStyles: Record<
  Role,
  { section: string; badge: string; border: string; shift: string; text: string }
> = {
  waiter: {
    section: "bg-slate-50 border-slate-200",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    border: "border-emerald-200",
    shift: "bg-white border-slate-200",
    text: "text-emerald-700",
  },
  "sushi maker": {
    section: "bg-slate-50 border-slate-200",
    badge: "bg-sky-50 text-sky-800 border-sky-200",
    border: "border-sky-200",
    shift: "bg-white border-slate-200",
    text: "text-sky-700",
  },
  kitchen: {
    section: "bg-slate-50 border-slate-200",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
    border: "border-amber-200",
    shift: "bg-white border-slate-200",
    text: "text-amber-700",
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

function timeRangesOverlap(
  firstStartTime: string,
  firstEndTime: string,
  secondStartTime: string,
  secondEndTime: string,
) {
  const firstStart = timeToMinutes(normalizeRestaurantTime(firstStartTime));
  const firstEnd = timeToMinutes(normalizeRestaurantTime(firstEndTime));
  const secondStart = timeToMinutes(normalizeRestaurantTime(secondStartTime));
  const secondEnd = timeToMinutes(normalizeRestaurantTime(secondEndTime));

  return firstStart < secondEnd && secondStart < firstEnd;
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

const DAILY_BREAK_THRESHOLD_HOURS = 6;
const DEFAULT_DAILY_BREAK_HOURS = 1;

function applyDailyBreakDefault(
  assignments: ShiftAssignment[],
  day: DayKey,
  employeeId: string,
) {
  const entries = assignments.flatMap((assignment) => {
    if (assignment.day !== day) {
      return [];
    }

    return assignment.assignedEmployees
      .filter((assignedEmployee) => assignedEmployee.employeeId === employeeId)
      .map((assignedEmployee) => ({ assignment, assignedEmployee }));
  });

  if (entries.length === 0) {
    return assignments;
  }

  const scheduledHours = entries.reduce(
    (total, entry) =>
      total +
      calculateShiftHours(
        entry.assignedEmployee.startTime,
        entry.assignedEmployee.endTime,
      ),
    0,
  );
  const breakHours = entries.reduce(
    (total, entry) => total + (entry.assignedEmployee.breakHours ?? 0),
    0,
  );
  const hasManualBreak = entries.some(
    (entry) => entry.assignedEmployee.breakEdited,
  );

  if (hasManualBreak) {
    return assignments;
  }

  if (scheduledHours <= DAILY_BREAK_THRESHOLD_HOURS) {
    if (breakHours === 0) {
      return assignments;
    }

    return assignments.map((assignment) => {
      if (assignment.day !== day) {
        return assignment;
      }

      return {
        ...assignment,
        assignedEmployees: assignment.assignedEmployees.map((assignedEmployee) =>
          assignedEmployee.employeeId === employeeId
            ? { ...assignedEmployee, breakHours: 0 }
            : assignedEmployee,
        ),
      };
    });
  }

  if (breakHours > 0) {
    return assignments;
  }

  const targetAssignmentId =
    entries.find((entry) => entry.assignment.shiftType === "night")?.assignment
      .id ?? entries[0].assignment.id;

  return assignments.map((assignment) => {
    if (assignment.id !== targetAssignmentId) {
      return assignment;
    }

    return {
      ...assignment,
      assignedEmployees: assignment.assignedEmployees.map((assignedEmployee) =>
        assignedEmployee.employeeId === employeeId
          ? {
              ...assignedEmployee,
              breakHours: DEFAULT_DAILY_BREAK_HOURS,
            }
          : assignedEmployee,
      ),
    };
  });
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

      return employee
        ? {
            ...assignedEmployee,
            breakHours: assignedEmployee.breakHours ?? 0,
            employee,
          }
        : null;
    })
    .filter(
      (
        entry,
      ): entry is {
        employeeId: string;
        startTime: string;
        endTime: string;
        breakHours: number;
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

export function getOverlappingShiftLabels(
  schedule: WeekSchedule,
  employeeId: string,
  selection: ShiftSelection,
) {
  const targetTime = getDefaultAssignedTime(schedule, selection);

  return schedule.assignments
    .filter(
      (assignment) =>
        assignment.day === selection.day &&
        assignment.assignedEmployees.some(
          (assignedEmployee) =>
            assignedEmployee.employeeId === employeeId &&
            timeRangesOverlap(
              assignedEmployee.startTime,
              assignedEmployee.endTime,
              targetTime.startTime,
              targetTime.endTime,
            ),
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
  const defaultTime = getDefaultAssignedTime(existingSchedule, selection);
  const hasOverlappingAssignment = existingSchedule.assignments.some(
    (assignment) =>
      assignment.day === selection.day &&
      assignment.assignedEmployees.some(
        (assignedEmployee) =>
          assignedEmployee.employeeId === employeeId &&
          timeRangesOverlap(
            assignedEmployee.startTime,
            assignedEmployee.endTime,
            defaultTime.startTime,
            defaultTime.endTime,
          ),
      ),
  );

  if (hasOverlappingAssignment) {
    return schedules;
  }

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

    return {
      ...assignment,
      assignedEmployees: [
        ...assignment.assignedEmployees,
        { employeeId, ...defaultTime, breakHours: 0 },
      ],
    };
  });

  if (!updatedExistingAssignment) {
    assignments.push({
      id: `${weekStart}-${selection.day}-${selection.role.replace(" ", "-")}-${
        selection.shiftType
      }`,
      ...selection,
      assignedEmployees: [{ employeeId, ...defaultTime, breakHours: 0 }],
    });
  }

  const assignmentsWithBreaks = applyDailyBreakDefault(
    assignments,
    selection.day,
    employeeId,
  );

  const updatedSchedule: WeekSchedule = {
    ...existingSchedule,
    assignments: assignmentsWithBreaks,
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
  const assignmentsAfterRemoval = existingSchedule.assignments
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
  const assignments = applyDailyBreakDefault(
    assignmentsAfterRemoval,
    selection.day,
    employeeId,
  );

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
  const hasOverlappingAssignment = existingSchedule.assignments.some(
    (assignment) => {
      const isCurrentShift =
        assignment.day === selection.day &&
        assignment.role === selection.role &&
        assignment.shiftType === selection.shiftType;

      if (assignment.day !== selection.day || isCurrentShift) {
        return false;
      }

      return assignment.assignedEmployees.some(
        (assignedEmployee) =>
          assignedEmployee.employeeId === employeeId &&
          timeRangesOverlap(
            assignedEmployee.startTime,
            assignedEmployee.endTime,
            normalizedStartTime,
            normalizedEndTime,
          ),
      );
    },
  );

  if (hasOverlappingAssignment) {
    return schedules;
  }

  const assignmentsAfterTimeUpdate = existingSchedule.assignments.map((assignment) => {
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

  const assignments = applyDailyBreakDefault(
    assignmentsAfterTimeUpdate,
    selection.day,
    employeeId,
  );

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

export function updateAssignedEmployeeBreak(
  schedules: WeekSchedule[],
  weekStart: string,
  selection: ShiftSelection,
  employeeId: string,
  breakHours: number,
) {
  const normalizedBreakHours = Math.max(
    0,
    Number.isFinite(breakHours) ? breakHours : 0,
  );
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
              breakHours: normalizedBreakHours,
              breakEdited: true,
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
  const affectedEmployeeIds = Array.from(
    new Set(
      existingSchedule.assignments
        .filter(
          (assignment) =>
            assignment.day === day && assignment.shiftType === "night",
        )
        .flatMap((assignment) =>
          assignment.assignedEmployees.map(
            (assignedEmployee) => assignedEmployee.employeeId,
          ),
        ),
    ),
  );

  const assignmentsAfterEndUpdate = existingSchedule.assignments.map((assignment) => {
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
  const assignments = affectedEmployeeIds.reduce(
    (nextAssignments, employeeId) =>
      applyDailyBreakDefault(nextAssignments, day, employeeId),
    assignmentsAfterEndUpdate,
  );

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

export function applyScheduleBreakDefaults(schedule: WeekSchedule) {
  let assignments = schedule.assignments;
  const employeeDayKeys = new Set<string>();

  schedule.assignments.forEach((assignment) => {
    assignment.assignedEmployees.forEach((assignedEmployee) => {
      employeeDayKeys.add(`${assignment.day}:${assignedEmployee.employeeId}`);
    });
  });

  employeeDayKeys.forEach((key) => {
    const [day, employeeId] = key.split(":");
    assignments = applyDailyBreakDefault(assignments, day as DayKey, employeeId);
  });

  return {
    ...schedule,
    assignments,
  };
}

export function getEmployeeScheduleSummaries(
  schedule: WeekSchedule,
  employees: Employee[],
): EmployeeScheduleSummary[] {
  const dayOrder = DAYS.reduce<Record<DayKey, number>>((order, day, index) => {
    order[day.key] = index;
    return order;
  }, {} as Record<DayKey, number>);

  return employees
    .map((employee) => {
      const shifts = schedule.assignments.flatMap((assignment) =>
        assignment.assignedEmployees
          .filter((assignedEmployee) => assignedEmployee.employeeId === employee.id)
          .map((assignedEmployee) => ({
            id: `${assignment.id}-${employee.id}`,
            day: assignment.day,
            role: assignment.role,
            shiftType: assignment.shiftType,
            startTime: assignedEmployee.startTime,
            endTime: assignedEmployee.endTime,
            breakHours: assignedEmployee.breakHours ?? 0,
          })),
      );

      return {
        employee,
        shifts: shifts.sort(
          (a, b) =>
            dayOrder[a.day] - dayOrder[b.day] ||
            a.startTime.localeCompare(b.startTime) ||
            roleLabels[a.role].localeCompare(roleLabels[b.role]),
        ),
      };
    })
    .filter((summary) => summary.shifts.length > 0);
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
        b.hours - a.hours || a.employee.name.localeCompare(b.employee.name),
    );
}

export function getPayrollRows(
  schedule: WeekSchedule,
  employees: Employee[],
  payLevelRates: PayLevelRates,
  penaltyRates: PenaltyRates = payrollPenaltyMultipliers,
) {
  const phDays = new Set(schedule.publicHolidays ?? []);

  return employees
    .map((employee) => {
      const assignedShifts = schedule.assignments.flatMap((assignment) =>
        assignment.assignedEmployees
          .filter((assignedEmployee) => assignedEmployee.employeeId === employee.id)
          .map((assignedEmployee) => ({
            ...assignedEmployee,
            day: assignment.day,
          })),
      );

      const paidShiftHours = (day: DayKey, startTime: string, endTime: string, breakHours: number) =>
        phDays.has(day) ? 0 : Math.max(0, calculateShiftHours(startTime, endTime) - breakHours);

      const scheduledHours = assignedShifts.reduce(
        (total, a) => total + calculateShiftHours(a.startTime, a.endTime),
        0,
      );
      const breakHours = assignedShifts.reduce(
        (total, a) => total + (a.breakHours ?? 0),
        0,
      );
      const publicHolidayHours = assignedShifts.reduce((total, a) => {
        if (!phDays.has(a.day)) return total;
        return total + Math.max(0, calculateShiftHours(a.startTime, a.endTime) - (a.breakHours ?? 0));
      }, 0);
      const weekdayHours = assignedShifts.reduce((total, a) => {
        if (a.day === "sat" || a.day === "sun" || phDays.has(a.day)) return total;
        return total + paidShiftHours(a.day, a.startTime, a.endTime, a.breakHours ?? 0);
      }, 0);
      const saturdayHours = assignedShifts.reduce((total, a) => {
        if (a.day !== "sat" || phDays.has(a.day)) return total;
        return total + Math.max(0, calculateShiftHours(a.startTime, a.endTime) - (a.breakHours ?? 0));
      }, 0);
      const sundayHours = assignedShifts.reduce((total, a) => {
        if (a.day !== "sun" || phDays.has(a.day)) return total;
        return total + Math.max(0, calculateShiftHours(a.startTime, a.endTime) - (a.breakHours ?? 0));
      }, 0);

      const paidHours = weekdayHours + saturdayHours + sundayHours + publicHolidayHours;
      const hourlyRate = payLevelRates[employee.level];
      const weekdayPay = weekdayHours * hourlyRate * penaltyRates.weekday;
      const saturdayPay = saturdayHours * hourlyRate * penaltyRates.saturday;
      const sundayPay = sundayHours * hourlyRate * penaltyRates.sunday;
      const publicHolidayPay = publicHolidayHours * hourlyRate * penaltyRates.publicHoliday;

      return {
        employee,
        scheduledHours,
        breakHours,
        weekdayHours,
        saturdayHours,
        sundayHours,
        publicHolidayHours,
        paidHours,
        shiftCount: assignedShifts.length,
        hourlyRate,
        weekdayPay,
        saturdayPay,
        sundayPay,
        publicHolidayPay,
        grossPay: weekdayPay + saturdayPay + sundayPay + publicHolidayPay,
      };
    })
    .sort(
      (a, b) =>
        b.grossPay - a.grossPay ||
        b.paidHours - a.paidHours ||
        a.employee.name.localeCompare(b.employee.name),
    );
}

export function getPayrollTotals(
  schedule: WeekSchedule,
  employees: Employee[],
  payLevelRates: PayLevelRates,
  penaltyRates: PenaltyRates = payrollPenaltyMultipliers,
) {
  return getPayrollRows(schedule, employees, payLevelRates, penaltyRates).reduce(
    (totals, row) => ({
      scheduledHours: totals.scheduledHours + row.scheduledHours,
      breakHours: totals.breakHours + row.breakHours,
      weekdayHours: totals.weekdayHours + row.weekdayHours,
      saturdayHours: totals.saturdayHours + row.saturdayHours,
      sundayHours: totals.sundayHours + row.sundayHours,
      publicHolidayHours: totals.publicHolidayHours + row.publicHolidayHours,
      paidHours: totals.paidHours + row.paidHours,
      grossPay: totals.grossPay + row.grossPay,
    }),
    {
      scheduledHours: 0,
      breakHours: 0,
      weekdayHours: 0,
      saturdayHours: 0,
      sundayHours: 0,
      publicHolidayHours: 0,
      paidHours: 0,
      grossPay: 0,
    },
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
