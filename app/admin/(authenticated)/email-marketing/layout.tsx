import { AdminEmailSubnav } from '../../_components/AdminEmailSubnav';

export default function EmailMarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2">
        <h2 className="text-lg font-bold text-foreground">Email Marketing</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Cold outreach templates, company lists, campaigns, and send logs.
        </p>
      </div>
      <AdminEmailSubnav />
      {children}
    </div>
  );
}
