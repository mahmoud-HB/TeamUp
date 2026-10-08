import { ModerationService } from '@/lib/services/moderation-service';

export default async function AdminPage() {
  const result = await ModerationService.getReports('pending');
  const reports = result.ok ? result.data : [];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-3xl font-bold">Admin - Modération</h1>
        <p className="text-muted-foreground">Gérez les signalements et violations</p>
      </div>
      
      <div className="rounded-lg border p-6">
        <h2 className="mb-4 text-lg font-semibold">Signalements en attente</h2>
        <div className="space-y-2">
          {reports.map((report) => (
            <div key={report.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">
                  {report.type}: {report.content_id.substring(0, 8)}...
                </p>
                <p className="text-xs text-muted-foreground">{report.reason}</p>
              </div>
              <span className="text-xs font-semibold text-amber-600">En attente</span>
            </div>
          ))}
          {reports.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">Aucun signalement en attente</p>
          )}
        </div>
      </div>
    </div>
  );
}
