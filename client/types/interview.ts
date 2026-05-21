/** Populated interview document from GET /interviews */
export interface InterviewApplicationPopulated {
  _id: string;
  student?: {
    _id: string;
    user?: { name?: string; email?: string };
  };
  internship?: {
    title?: string;
    company?: { company_name?: string };
  };
}

export interface InterviewRecord {
  _id: string;
  status: string;
  scheduled_at: string;
  interview_type: "phone" | "video" | "in-person";
  meeting_link?: string;
  instructions?: string;
  round_number?: number;
  application?: InterviewApplicationPopulated | string;
  interviewer_id?: { _id?: string; name?: string; email?: string } | string;
  company?: { company_name?: string } | string;
}

export interface ShortlistedApplicationOption {
  id: string;
  studentName: string;
  studentEmail: string;
  roleTitle: string;
  status: string;
}
