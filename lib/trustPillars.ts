/** Trust / sovereignty messaging (SovereigntyBar + Footer). Icons: lucide keys in `TrustPillarIconId`. */
export type TrustPillarIconId = 'globe' | 'users' | 'shield' | 'workflow';

export const TRUST_PILLARS = [
  {
    icon: 'globe' as const,
    title: 'Engineering Excellence',
    description: 'Scalable, cloud-native systems for distributed environments.',
  },
  {
    icon: 'users' as const,
    title: 'Expert Teams',
    description: 'Professionals delivering production-grade software.',
  },
  {
    icon: 'shield' as const,
    title: 'Privacy & Security',
    description: 'GDPR/DSGVO-aware delivery & architecture',
  },
  {
    icon: 'workflow' as const,
    title: 'Engineering Standards',
    description: 'Clean architecture with TDD and CI/CD',
  },
] as const;
