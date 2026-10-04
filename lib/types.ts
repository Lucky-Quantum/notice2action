export type FriendProfile = {
  name: string;
  situation: string;
  language: "English" | "Hinglish" | "Simple English";
};

export type NoticeResult = {
  title: string;
  one_line: string;
  summary: string[];
  deadline: {
    date: string | null;
    time: string | null;
    timezone: string | null;
    confidence: "high" | "medium" | "low";
  };
  eligibility: {
    status: "likely_eligible" | "possibly_eligible" | "not_enough_information" | "likely_not_eligible";
    reason: string;
    checks: string[];
  };
  documents: Array<{
    name: string;
    required: boolean;
    status: "needed" | "optional" | "unclear";
  }>;
  action_plan: Array<{
    priority: "NOW" | "TODAY" | "NEXT" | "BEFORE DEADLINE";
    task: string;
    why: string;
  }>;
  warnings: string[];
  friend_message: string;
  extracted: Array<{ label: string; value: string }>;
};
