import { AdminSiteAnalytics } from '../../_components/AdminSiteAnalytics';

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Unique visitors and page views on the public site (homepage and pages). Admin routes are not counted.
        Switch between daily, weekly, and monthly views below.
      </p>
      <AdminSiteAnalytics />
    </div>
  );
}
