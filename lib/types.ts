export type AppRole = "admin" | "family";
export type InteractionType =
  | "call"
  | "missed_call_returned"
  | "text_exchange"
  | "fortnite"
  | "visit"
  | "manual_activity"
  | "life_event"
  | "birthday_remembered"
  | "admin_bonus"
  | "admin_penalty";
export type InteractionDirection = "inbound" | "outbound" | "mutual";
export type InteractionSource = "manual" | "import" | "admin";
export type ApprovalStatus = "pending" | "approved" | "denied";
export type ScorePeriod = "week" | "month" | "year" | "all_time";
export type AgeBracket = "kid" | "teen" | "adult" | "unknown";

export type Profile = {
  id: string;
  role: AppRole;
  display_name: string | null;
  created_at: string;
};

export type Person = {
  id: string;
  user_id: string | null;
  name: string;
  relationship: string;
  birthday: string | null;
  age_bracket: AgeBracket;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  active: boolean;
  created_at: string;
};

export type Interaction = {
  id: string;
  person_id: string;
  type: InteractionType;
  direction: InteractionDirection;
  initiated_by_person: boolean;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number;
  message_count: number;
  is_group_chat: boolean;
  source: InteractionSource;
  status: ApprovalStatus;
  notes: string | null;
  created_by: string | null;
  created_at: string;
};

export type ScoringWeight = {
  id: string;
  interaction_type: string;
  base_points: number;
  points_per_minute: number;
  points_per_message: number;
  cap_per_event: number | null;
  initiative_bonus: number;
  returned_call_bonus: number;
  active: boolean;
};

export type Score = {
  person_id: string;
  total_score: number;
  call_score: number;
  text_score: number;
  initiative_score: number;
  time_together_score: number;
  reliability_score: number;
  bonus_score: number;
  penalty_score: number;
  period: ScorePeriod;
  calculated_at: string;
};

export type PersonWithScore = Person & {
  score?: Score;
  topCategory?: string;
  trend?: "up" | "down" | "flat";
};
