import dayjs from 'dayjs';

export const getDistance = (day1: string, day2: string): number => {
  const date1 = dayjs(day1).startOf('day'); 
  const date2 = dayjs(day2).startOf('day');
  return Math.abs(date2.diff(date1, 'day')); 
};
