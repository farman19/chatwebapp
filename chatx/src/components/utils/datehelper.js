
import dayjs from 'dayjs';

export const formatChatDate = (dateStr) => {
  const date = dayjs(dateStr).startOf('day');
  const today = dayjs().startOf('day');
  const yesterday = dayjs().subtract(1, 'day').startOf('day');

  if (date.isSame(today)) return 'Today';
  if (date.isSame(yesterday)) return 'Yesterday';
  return date.format('M/D/YYYY');
};