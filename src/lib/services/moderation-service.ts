/**
 * ModerationService: gestion de la modération et admin
 */

import { ServiceResult, ok, err } from "./index";

export interface ReportedContent {
  id: string;
  type: 'post' | 'user' | 'comment';
  content_id: string;
  reporter_id: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'rejected' | 'actioned';
  created_at: string;
}

export interface UserFlag {
  id: string;
  user_id: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  is_active: boolean;
  created_at: string;
}

const MOCK_REPORTS: ReportedContent[] = [];
const MOCK_FLAGS: UserFlag[] = [];

export const ModerationService = {
  async getReports(status?: string): Promise<ServiceResult<ReportedContent[]>> {
    return ok(
      status ? MOCK_REPORTS.filter((r) => r.status === status) : MOCK_REPORTS
    );
  },

  async reportContent(
    reporter_id: string,
    type: 'post' | 'user' | 'comment',
    content_id: string,
    reason: string
  ): Promise<ServiceResult<ReportedContent>> {
    const report: ReportedContent = {
      id: `report-${Date.now()}`,
      type,
      content_id,
      reporter_id,
      reason,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    MOCK_REPORTS.push(report);
    return ok(report);
  },

  async reviewReport(reportId: string, action: 'approve' | 'reject'): Promise<ServiceResult<ReportedContent>> {
    const report = MOCK_REPORTS.find((r) => r.id === reportId);
    if (!report) return err('Report not found');
    report.status = action === 'approve' ? 'actioned' : 'rejected';
    return ok(report);
  },

  async flagUser(userId: string, reason: string, severity: 'low' | 'medium' | 'high'): Promise<ServiceResult<UserFlag>> {
    const flag: UserFlag = {
      id: `flag-${Date.now()}`,
      user_id: userId,
      reason,
      severity,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    MOCK_FLAGS.push(flag);
    return ok(flag);
  },

  async getUserFlags(userId: string): Promise<ServiceResult<UserFlag[]>> {
    return ok(MOCK_FLAGS.filter((f) => f.user_id === userId && f.is_active));
  },
};
