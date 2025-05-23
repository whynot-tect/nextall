// File: C:\Users\hanos\nextall\frontend\src\utils\formatTime.js
import { format, getTime, formatDistanceToNow } from 'date-fns';

// ----------------------------------------------------------------------

export function fDate(date) {
  return format(new Date(date), 'dd MMMM yyyy');
}
export function fDateShortMonth(date) {
  return format(new Date(date), 'MM/dd/yyyy'); // Change format here (e.g., 'dd MMM yyyy')
}
export function fDateShort(date) {
  return format(new Date(date), 'dd MMM yyyy');
}
export function fDateTime(date) {
  return format(new Date(date), 'dd MMM yyyy HH:mm');
}

export function fTimestamp(date) {
  return getTime(new Date(date));
}

export function fDateTimeSuffix(date) {
  return format(new Date(date), 'dd/MM/yyyy hh:mm p');
}

export function fToNow(date) {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true
  });
}
