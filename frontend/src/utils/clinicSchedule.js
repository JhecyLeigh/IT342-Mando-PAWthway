const DAY_INDEX = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6
};

function parseTimeToMinutes(timeValue) {
  const match = timeValue.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return null;
  }

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (meridiem === 'PM' && hour !== 12) {
    hour += 12;
  }

  if (meridiem === 'AM' && hour === 12) {
    hour = 0;
  }

  return hour * 60 + minute;
}

function formatMinutesToTimeLabel(totalMinutes) {
  const normalizedMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const hour24 = Math.floor(normalizedMinutes / 60);
  const minute = normalizedMinutes % 60;
  const meridiem = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;

  return `${hour12}:${String(minute).padStart(2, '0')} ${meridiem}`;
}

function formatMinutesToInputValue(totalMinutes) {
  const normalizedMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const hour24 = Math.floor(normalizedMinutes / 60);
  const minute = normalizedMinutes % 60;

  return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function getManilaDateParts(referenceDate = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return formatter.formatToParts(referenceDate).reduce((accumulator, part) => {
    accumulator[part.type] = part.value;
    return accumulator;
  }, {});
}

export function getManilaTodayDateValue() {
  const parts = getManilaDateParts();
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function getManilaNowMinutes() {
  const parts = getManilaDateParts();
  return Number(parts.hour) * 60 + Number(parts.minute);
}

function expandDays(startDay, endDay) {
  if (/^daily$/i.test(startDay)) {
    return [0, 1, 2, 3, 4, 5, 6];
  }

  const startIndex = DAY_INDEX[startDay];
  if (startIndex === undefined) {
    return [];
  }

  if (!endDay) {
    return [startIndex];
  }

  const endIndex = DAY_INDEX[endDay];
  if (endIndex === undefined) {
    return [];
  }

  const days = [];
  let day = startIndex;

  while (true) {
    days.push(day);
    if (day === endIndex) {
      break;
    }
    day = (day + 1) % 7;
  }

  return days;
}

function parseScheduleWindows(schedule) {
  if (!schedule) {
    return [];
  }

  if (/24\/7/i.test(schedule)) {
    return [{
      days: [0, 1, 2, 3, 4, 5, 6],
      openMinutes: 0,
      closeMinutes: 1439
    }];
  }

  if (/available on request|booking-based|appointment only|appointment/i.test(schedule)) {
    return [];
  }

  const segments = schedule
    .split(',')
    .map((segment) => segment.trim())
    .filter(Boolean);

  const explicitClosedDays = new Set();
  const windows = [];

  for (const segment of segments) {
    const closedMatch = segment.match(/^(Daily|Mon|Tue|Wed|Thu|Fri|Sat|Sun)(?:-(Mon|Tue|Wed|Thu|Fri|Sat|Sun))?\s+Closed$/i);
    if (!closedMatch) {
      continue;
    }

    expandDays(closedMatch[1], closedMatch[2]).forEach((day) => explicitClosedDays.add(day));
  }

  for (const segment of segments) {
    if (/closed/i.test(segment)) {
      continue;
    }

    const rangeMatch = segment.match(
      /^(Daily|Mon|Tue|Wed|Thu|Fri|Sat|Sun)(?:-(Mon|Tue|Wed|Thu|Fri|Sat|Sun))?\s+(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M)$/i
    );

    if (!rangeMatch) {
      continue;
    }

    const days = expandDays(rangeMatch[1], rangeMatch[2]).filter((day) => !explicitClosedDays.has(day));
    const openMinutes = parseTimeToMinutes(rangeMatch[3]);
    const closeMinutes = parseTimeToMinutes(rangeMatch[4]);

    if (openMinutes === null || closeMinutes === null) {
      continue;
    }

    windows.push({
      days,
      openMinutes,
      closeMinutes
    });
  }

  return windows;
}

function getManilaDayIndexForDate(appointmentDate) {
  if (!appointmentDate) {
    return null;
  }

  const [year, month, day] = appointmentDate.split('-').map(Number);
  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    weekday: 'short'
  }).format(date);

  return DAY_INDEX[weekday] ?? null;
}

function getAppointmentMinutes(appointmentTime) {
  if (!appointmentTime) {
    return null;
  }

  const match = appointmentTime.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  return hour * 60 + minute;
}

function expandWindowSlots(window, intervalMinutes, currentDateValue, todayDateValue, currentMinutes) {
  const slots = [];
  const maxMinutes = window.closeMinutes;
  const openMinutes = window.openMinutes;

  const pushSlot = (minutes) => {
    if (currentDateValue === todayDateValue && minutes <= currentMinutes) {
      return;
    }

    slots.push({
      value: formatMinutesToInputValue(minutes),
      label: formatMinutesToTimeLabel(minutes),
      minutes
    });
  };

  if (openMinutes <= maxMinutes) {
    for (let minutes = openMinutes; minutes <= maxMinutes; minutes += intervalMinutes) {
      pushSlot(minutes);
    }

    if (maxMinutes % intervalMinutes !== 0) {
      pushSlot(maxMinutes);
    }
    return slots;
  }

  for (let minutes = openMinutes; minutes < 1440; minutes += intervalMinutes) {
    pushSlot(minutes);
  }

  for (let minutes = 0; minutes <= maxMinutes; minutes += intervalMinutes) {
    pushSlot(minutes);
  }

  if (maxMinutes % intervalMinutes !== 0) {
    pushSlot(maxMinutes);
  }

  return slots;
}

export function getClinicHoursForDate(schedule, appointmentDate) {
  const dayIndex = getManilaDayIndexForDate(appointmentDate);
  if (dayIndex === null) {
    return [];
  }

  return parseScheduleWindows(schedule)
    .filter((window) => window.days.includes(dayIndex))
    .map((window) => ({
      openMinutes: window.openMinutes,
      closeMinutes: window.closeMinutes,
      label: `${formatMinutesToTimeLabel(window.openMinutes)} - ${formatMinutesToTimeLabel(window.closeMinutes)}`
    }));
}

export function getClinicBookingTimeSlots(schedule, appointmentDate, intervalMinutes = 30) {
  const dayIndex = getManilaDayIndexForDate(appointmentDate);
  if (dayIndex === null) {
    return [];
  }

  const todayDateValue = getManilaTodayDateValue();
  const currentMinutes = getManilaNowMinutes();
  const windows = parseScheduleWindows(schedule).filter((window) => window.days.includes(dayIndex));
  const slotMap = new Map();

  windows.forEach((window) => {
    expandWindowSlots(window, intervalMinutes, appointmentDate, todayDateValue, currentMinutes).forEach((slot) => {
      if (!slotMap.has(slot.value)) {
        slotMap.set(slot.value, slot);
      }
    });
  });

  return Array.from(slotMap.values()).sort((left, right) => left.minutes - right.minutes);
}

export function getClinicBookingHoursLabel(schedule, appointmentDate) {
  if (!appointmentDate) {
    return 'Select a date to see available hours';
  }

  if (/24\/7/i.test(schedule)) {
    return 'Available anytime';
  }

  const hours = getClinicHoursForDate(schedule, appointmentDate);
  if (hours.length === 0) {
    return 'No booking hours available for this date';
  }

  return `Open: ${hours.map((window) => window.label).join(', ')}`;
}

export function isAppointmentWithinClinicHours(schedule, appointmentDate, appointmentTime) {
  const appointmentMinutes = getAppointmentMinutes(appointmentTime);
  const dayIndex = getManilaDayIndexForDate(appointmentDate);

  if (appointmentMinutes === null || dayIndex === null) {
    return false;
  }

  if (/24\/7/i.test(schedule)) {
    return true;
  }

  if (/available on request|booking-based|appointment only|appointment/i.test(schedule)) {
    return false;
  }

  const windows = parseScheduleWindows(schedule).filter((window) => window.days.includes(dayIndex));

  return windows.some((window) => {
    if (window.openMinutes <= window.closeMinutes) {
      return appointmentMinutes >= window.openMinutes && appointmentMinutes <= window.closeMinutes;
    }

    return appointmentMinutes >= window.openMinutes || appointmentMinutes <= window.closeMinutes;
  });
}

export function getDeviceNow() {
  const now = new Date();

  return {
    dayIndex: now.getDay(),
    minutesNow: now.getHours() * 60 + now.getMinutes()
  };
}

export function isClinicOpen(schedule, currentTime = getDeviceNow()) {
  if (!schedule) {
    return false;
  }

  if (/24\/7/i.test(schedule)) {
    return true;
  }

  if (/available on request|booking-based|appointment only|appointment/i.test(schedule)) {
    return false;
  }

  const segments = schedule
    .split(',')
    .map((segment) => segment.trim())
    .filter(Boolean);

  const explicitClosedDays = new Set();

  for (const segment of segments) {
    const closedMatch = segment.match(/^(Daily|Mon|Tue|Wed|Thu|Fri|Sat|Sun)(?:-(Mon|Tue|Wed|Thu|Fri|Sat|Sun))?\s+Closed$/i);
    if (!closedMatch) {
      continue;
    }

    expandDays(closedMatch[1], closedMatch[2]).forEach((day) => explicitClosedDays.add(day));
  }

  for (const segment of segments) {
    if (/closed/i.test(segment)) {
      continue;
    }

    const rangeMatch = segment.match(
      /^(Daily|Mon|Tue|Wed|Thu|Fri|Sat|Sun)(?:-(Mon|Tue|Wed|Thu|Fri|Sat|Sun))?\s+(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M)$/i
    );

    if (!rangeMatch) {
      continue;
    }

    const days = expandDays(rangeMatch[1], rangeMatch[2]).filter((day) => !explicitClosedDays.has(day));
    const openMinutes = parseTimeToMinutes(rangeMatch[3]);
    const closeMinutes = parseTimeToMinutes(rangeMatch[4]);

    if (openMinutes === null || closeMinutes === null) {
      continue;
    }

    const matchesDay = days.includes(currentTime.dayIndex);
    const matchesTime =
      openMinutes <= closeMinutes
        ? currentTime.minutesNow >= openMinutes && currentTime.minutesNow <= closeMinutes
        : currentTime.minutesNow >= openMinutes || currentTime.minutesNow <= closeMinutes;

    if (matchesDay && matchesTime) {
      return true;
    }
  }

  return false;
}
