export type TechnologyCategory =
  | 'framework'
  | 'cms'
  | 'analytics'
  | 'hosting'
  | 'css'
  | 'payments'
  | 'support';

export interface DetectedTechnology {
  /** Stable id, e.g. 'nextjs'. */
  id: string;
  name: string;
  category: TechnologyCategory;
  /** 0–1. A `__NEXT_DATA__` script is near-certain; a class-name heuristic
   *  is not. */
  confidence: number;
  /** What we matched on, e.g. 'script#__NEXT_DATA__'. */
  evidence: string;
}

/** Unscored. Reported as findings only. See spec D3. */
export interface TechnologyFindings {
  detected: DetectedTechnology[];
}
