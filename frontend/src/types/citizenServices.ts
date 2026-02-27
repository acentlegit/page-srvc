// Type definitions for Citizen Services Intake System

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'number' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'textarea' | 'file';
  required?: boolean;
  options?: string[];
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface FormTemplate {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
  created_at: string;
  updated_at: string;
}

export interface IntakeForm {
  id: string;
  template_id?: string;
  name: string;
  description?: string;
  fields_config: FormField[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Citizen {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  zip_code?: string;
  created_at: string;
}

export interface IntakeSubmission {
  id: string;
  form_id?: string;
  citizen_id?: string;
  citizen?: {
    fullName?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  consent_given?: boolean;
  urgency_level?: 'Emergency' | 'High' | 'Standard';
  status?: 'Open' | 'In Progress' | 'Completed' | 'Closed' | 'pending' | 'Pending';
  submitted_at?: string;
  created_at?: string;
  case_id?: string;
  services_requested?: string[];
}

export interface SubmissionData {
  submission_id: string;
  field_name: string;
  field_value: string | string[] | number | boolean;
  field_type: string;
}

export interface Program {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface ProgramApplication {
  id: string;
  submission_id: string;
  program_id: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Waitlisted';
  created_at: string;
}

export interface AnalyticsOverview {
  total_intakes: number;
  active_programs: number;
  pending_applications: number;
  completed_cases: number;
  total_referrals?: number;
  referral_success_rate?: number;
}

export interface ProgramStatistics {
  program_id: string;
  program_name: string;
  total_applications: number;
  approved: number;
  pending: number;
  rejected: number;
  waitlisted: number;
}

export interface DemographicsBreakdown {
  age_ranges: Record<string, number>;
  household_sizes: Record<string, number>;
  income_ranges: Record<string, number>;
  service_types: Record<string, number>;
}

export interface UploadedFile {
  file: File;
  type: 'excel' | 'word' | 'pdf';
  extractedFields?: FormField[];
}
