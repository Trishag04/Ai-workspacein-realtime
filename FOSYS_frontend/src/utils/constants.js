export const ROLES = {
  INTERN: 'intern',
  EMPLOYEE: 'employee',
  MANAGER: 'manager',
  ADMIN: 'admin'
};

export const TASK_STATUS = {
  COMPLETED: 'Completed',
  IN_PROGRESS: 'InProgress',
  PENDING: 'Pending'
};

export const PR_STATUS = {
  OPEN: 'Open',
  IN_REVIEW: 'InReview',
  APPROVED: 'Approved',
  MERGED: 'Merged',
  CLOSED: 'Closed'
};

export const PROJECT_STATUS = {
  ONGOING: 'Ongoing',
  UPCOMING: 'Upcoming',
  COMPLETED: 'Completed'
};

export const EVENT_TYPES = {
  SCRUM: { label: 'SCRUM', color: 'bg-emerald-500' },
  Holiday: { label: 'Holiday', color: 'bg-rose-500' },
  Meeting: { label: 'Meeting', color: 'bg-blue-500' },
  Personal: { label: 'Personal', color: 'bg-violet-500' }
};

export const getStatusColor = (status) => {
  switch(status) {
    case 'Completed': return 'text-emerald-500 bg-emerald-500/10';
    case 'InProgress': return 'text-blue-500 bg-blue-500/10';
    case 'Pending': return 'text-amber-500 bg-amber-500/10';
    case 'Open': return 'text-blue-500 bg-blue-500/10';
    case 'InReview': return 'text-violet-500 bg-violet-500/10';
    case 'Approved': return 'text-emerald-500 bg-emerald-500/10';
    case 'Merged': return 'text-green-600 bg-green-600/10';
    case 'Closed': return 'text-slate-500 bg-slate-500/10';
    case 'Ongoing': return 'text-blue-500 bg-blue-500/10';
    case 'Upcoming': return 'text-amber-500 bg-amber-500/10';
    default: return 'text-slate-500 bg-slate-500/10';
  }
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};