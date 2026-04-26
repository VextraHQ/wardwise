import { format } from "date-fns";

export type DateRange = {
  from?: Date;
  to?: Date;
};

export type DateRangePreset = "today" | "7d" | "30d" | "month" | "all";

export const REPORTING_DATE_PICKER_START_YEAR = 2020;

export function getToday() {
  return new Date();
}

export function getReportingDatePickerStartMonth() {
  return new Date(REPORTING_DATE_PICKER_START_YEAR, 0);
}

export function getReportingDatePickerEndMonth(now = getToday()) {
  return new Date(now.getFullYear(), now.getMonth());
}

export function formatQueryDate(date: Date | undefined): string | undefined {
  return date ? format(date, "yyyy-MM-dd") : undefined;
}

export function getPresetRange(
  preset: DateRangePreset,
  now = getToday(),
): DateRange {
  switch (preset) {
    case "today": {
      const from = new Date(now);
      from.setHours(0, 0, 0, 0);
      return { from, to: now };
    }
    case "7d": {
      const from = new Date(now);
      from.setDate(from.getDate() - 6);
      return { from, to: now };
    }
    case "30d": {
      const from = new Date(now);
      from.setDate(from.getDate() - 29);
      return { from, to: now };
    }
    case "month": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from, to: now };
    }
    default:
      return {};
  }
}

export function formatDateRangeLabel(
  range: DateRange,
  options: {
    dateFormat?: string;
    allTimeLabel?: string;
  } = {},
) {
  const dateFormat = options.dateFormat ?? "dd MMM yyyy";
  const allTimeLabel = options.allTimeLabel ?? "All time";

  if (!range.from && !range.to) return allTimeLabel;
  if (range.from && range.to) {
    const fromLabel = format(range.from, dateFormat);
    const toLabel = format(range.to, dateFormat);
    return fromLabel === toLabel ? fromLabel : `${fromLabel} - ${toLabel}`;
  }
  if (range.from) return `From ${format(range.from, dateFormat)}`;
  return `To ${format(range.to as Date, dateFormat)}`;
}
