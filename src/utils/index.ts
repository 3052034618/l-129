export const formatDate = (dateStr: string): string => {
  return dateStr;
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}小时`;
  }
  return `${hours}小时${mins}分钟`;
};

export const generateOrderNo = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `WO${year}${month}${day}${random}`;
};

export const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: '待接单',
    processing: '处理中',
    completed: '已完成',
    closed: '已关闭'
  };
  return statusMap[status] || status;
};

export const getPriorityText = (priority: string): string => {
  const priorityMap: Record<string, string> = {
    urgent: '紧急',
    high: '高',
    medium: '中',
    low: '低'
  };
  return priorityMap[priority] || priority;
};

export const formatDateTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const isOrderTimeout = (order: { priority: string; status: string; acceptTime?: string; completedTime?: string }): boolean => {
  const priorityMap: Record<string, number> = { urgent: 60, high: 120, medium: 240, low: 240 };
  const expectedDuration = priorityMap[order.priority] || 240;

  if (order.status === 'completed' || order.status === 'closed') {
    if (!order.acceptTime || !order.completedTime) return false;
    const accept = new Date(order.acceptTime).getTime();
    const complete = new Date(order.completedTime).getTime();
    const duration = (complete - accept) / (1000 * 60);
    return duration > expectedDuration;
  }

  if (order.status === 'processing') {
    if (!order.acceptTime) return false;
    const accept = new Date(order.acceptTime).getTime();
    const now = new Date().getTime();
    const duration = (now - accept) / (1000 * 60);
    return duration > expectedDuration;
  }

  return false;
};
