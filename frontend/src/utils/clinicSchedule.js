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
