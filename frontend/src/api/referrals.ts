// API client for Referrals
import { apiCall } from './apiClient';

export interface Referral {
  referral_id: string;
  case_id: string;
  submission_id: string;
  citizen_name: string;
  citizen_email?: string;
  citizen_phone?: string;
  nonprofit_type: string;
  nonprofit_name?: string;
  status: 'Pending' | 'Sent' | 'Accepted' | 'Rejected' | 'Waitlisted' | 'Completed';
  priority: string;
  reason: string;
  notes?: string;
  sent_at?: string;
  responded_at?: string;
}

const BASE_PATH = '/custom-applications/citizen-services';

export const referralsApi = {
  // List all referrals
  list: async (): Promise<Referral[]> => {
    try {
      return await apiCall<Referral[]>(`${BASE_PATH}/referrals`);
    } catch (err: any) {
      if (err.status === 404 || err.message?.includes('404')) {
        return [];
      }
      throw err;
    }
  },

  // Update referral status
  updateStatus: async (
    submissionId: string,
    referralIndex: number,
    data: { status?: string; notes?: string; nonprofit_name?: string; nonprofit_id?: string }
  ): Promise<{ success: boolean; referral: any }> => {
    return apiCall<{ success: boolean; referral: any }>(
      `${BASE_PATH}/referrals/${submissionId}/${referralIndex}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  // Add case worker notes
  addNotes: async (submissionId: string, notes: string): Promise<{ success: boolean; case_worker_notes: string }> => {
    return apiCall<{ success: boolean; case_worker_notes: string }>(
      `${BASE_PATH}/referrals/${submissionId}/notes`,
      {
        method: 'PUT',
        body: JSON.stringify({ notes }),
      }
    );
  },
};
