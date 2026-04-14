export interface Task {
  id: string;
  title: string;
  area: string;
  assigneeIds: string[];
  createdAt: number;
  completedAt: number | null;
}

export const MAX_ASSIGNEES = Infinity;
