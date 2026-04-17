export type CompanyType = 'established' | 'startup';

export type ApplicationStatus = 
  | 'not_applied' 
  | 'applied' 
  | 'interview' 
  | 'offer' 
  | 'successful' 
  | 'rejected' 
  | 'pending';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'cv' | 'cover_letter' | 'other';
  uploaded_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  company: string;
  role: string | null;
  company_type: CompanyType | null;
  location: string | null;
  industry: string | null;
  status: ApplicationStatus;
  deadline: string | null; // ISO date string
  website: string | null;
  notes: string | null;
  attachments: Attachment[] | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationInsert {
  user_id?: string;
  company: string;
  role?: string | null;
  company_type?: CompanyType | null;
  location?: string | null;
  industry?: string | null;
  status?: ApplicationStatus;
  deadline?: string | null;
  website?: string | null;
  notes?: string | null;
  attachments?: Attachment[] | null;
}

export interface ApplicationUpdate {
  company?: string;
  role?: string | null;
  company_type?: CompanyType | null;
  location?: string | null;
  industry?: string | null;
  status?: ApplicationStatus;
  deadline?: string | null;
  website?: string | null;
  notes?: string | null;
  attachments?: Attachment[] | null;
}
