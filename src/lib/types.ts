export type TaskPriority = "must" | "should" | "could";
export type TaskStatus = "inbox" | "planned" | "in_progress" | "done" | "skipped" | "cancelled";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  notes: string | null;
  area: "university" | "personal";
  course_id: string | null;
  goal_id: string | null;
  milestone_id: string | null;
  parent_task_id: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  estimated_minutes: number | null;
  energy_level: "low" | "medium" | "high" | null;
  tags: string[];
  order_index: number;
};

export type AssessmentType = "assignment" | "project" | "exam" | "quiz";
export type AssessmentStatus = "upcoming" | "in_progress" | "submitted" | "graded";

export type Assessment = {
  id: string;
  course_id: string;
  type: AssessmentType;
  title: string;
  due_date: string | null;
  grade_earned: number | null;
  grade_possible: number | null;
  status: AssessmentStatus;
};

export type TopicStatus = "not_started" | "in_progress" | "done";

export type CourseTopic = {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  status: TopicStatus;
};

export type Note = {
  id: string;
  owner_type: "course" | "goal";
  owner_id: string;
  kind: "note" | "link";
  title: string | null;
  content: string | null;
  url: string | null;
  created_at: string;
};

export type ClassSlot = {
  id: string;
  course_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location: string | null;
};

export type Course = {
  id: string;
  user_id: string;
  name: string;
  code: string | null;
  color: string;
  term_start: string | null;
  term_end: string | null;
  credit_hours: number | null;
  archived: boolean;
};

export type GoalCategory =
  | "career"
  | "certification"
  | "skill"
  | "project"
  | "health"
  | "habit"
  | "other";
export type GoalPriority = "low" | "medium" | "high";
export type GoalStatus = "flexible" | "active" | "paused" | "completed";
export type ProgressMode = "auto" | "manual";

export type Goal = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: GoalCategory;
  color: string;
  icon: string | null;
  priority: GoalPriority;
  status: GoalStatus;
  deadline: string | null;
  progress_percent: number;
  progress_mode: ProgressMode;
  created_at: string;
};

export type MilestoneStatus = "not_started" | "in_progress" | "done";

export type Milestone = {
  id: string;
  goal_id: string;
  title: string;
  order_index: number;
  status: MilestoneStatus;
  weight: number | null;
};

export type ProgressHistoryEntry = {
  id: string;
  goal_id: string;
  recorded_at: string;
  percent: number;
  note: string | null;
};
