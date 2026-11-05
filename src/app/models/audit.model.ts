export type LighthouseCategory =
  | 'all'
  | 'performance'
  | 'accessibility'
  | 'best-practices'
  | 'seo'
  | 'geo'
  | 'eo'
  | 'security';

export type AuditMode = 'live' | 'demo';
export type AuditRunPhase = 'static' | 'lhr';

export type FlowStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type WorkspaceMode = 'checker' | 'repo-audit';

export type CheckerPillarFilter =
  | 'all'
  | 'seo'
  | 'geo'
  | 'eo'
  | 'links'
  | 'crawlers'
  | 'entities'
  | 'artifacts';

export type ArtifactTabKey = 'llmsTxt' | 'schemaJsonLd' | 'robotsTxt' | 'htmlSnippet';

export interface FresnelLore {
  name: string;
  pronunciation: string;
  origin: string;
  quote: string;
  explanation: string;
}

export interface RepoMetadata {
  owner: string;
  repo: string;
  fullName: string;
  url: string;
  isDemo?: boolean;
}

export interface AuditCommit {
  id: string;
  sha: string;
  fullSha: string;
  category: Exclude<LighthouseCategory, 'all'>;
  categoryLabel: string;
  securityContext?: string;
  securityPattern?: string;
  ruleId: string;
  ruleTitle?: string;
  impact?: string;
  lhrAuditTitle?: string;
  lhrDisplayValue?: string;
  lhrTargetSelector?: string;
  lhrAreaImproved?: string;
  title: string;
  commitMessage: string;
  summary: string;
  files: string[];
  additions: number;
  deletions: number;
  author: string;
  date: string;
  body: string;
  diff: string;
}

export interface TelemetryStep {
  index: number;
  phase: string;
  category: string;
  headline: string;
  narrative: string;
  commitId?: string | null;
  sha?: string;
  ruleId?: string;
}

export interface CategoryImprovedItem {
  id: string;
  label: string;
  focus?: string;
  improved: boolean;
  commitsCount: number;
  rules?: string[];
}

export interface AuditSession {
  id: string;
  interactionId: string;
  mode: AuditMode;
  runPhase: AuditRunPhase;
  categoriesImproved?: CategoryImprovedItem[];
  lhrMeta?: {
    lighthouseVersion: string;
    requestedUrl: string;
    fetchTime: string;
  } | null;
  status: 'in_progress' | 'completed';
  progressPercent: number;
  repo: RepoMetadata;
  branch: string;
  categories: string[];
  currentStep: TelemetryStep;
  steps: TelemetryStep[];
  totalSteps: number;
  commits: AuditCommit[];
  totalCommits: number;
  pr: PullRequestResult | null;
}

export interface PatchBundle {
  filename: string;
  selectedCount: number;
  patchContent: string;
  downloadUrl: string;
  instructions: {
    cloneCmd: string;
    branchCmd: string;
    applyAmCmd: string;
    applyDiffCmd: string;
    verifyCmd: string;
    pushCmd: string;
  };
}

export interface PullRequestResult {
  number: number;
  mode: AuditMode;
  runPhase?: AuditRunPhase;
  title: string;
  body?: string;
  url: string;
  compareUrl?: string;
  repoUrl: string;
  repoFullName: string;
  baseBranch: string;
  headBranch: string;
  patchFilename?: string;
  patchDownloadUrl?: string;
  terminalCommand?: string;
  shortTerminalCommand?: string;
  createdAt: string;
  selectedCommits: AuditCommit[];
  totalAdditions: number;
  totalDeletions: number;
  filesTouched: string[];
}

export interface SeoGeoEoCheckItem {
  id: string;
  pillar: 'seo' | 'geo' | 'eo';
  pillarLabel: string;
  title: string;
  status: 'pass' | 'warn' | 'fail';
  impact: 'High' | 'Medium' | 'Low';
  currentValue: string;
  recommendation: string;
  fixSnippet: string;
}

export interface AiCrawlerItem {
  bot: string;
  engine: string;
  purpose: string;
  status: string;
  directive: string;
}

export interface EntityGraphNode {
  id: string;
  type: string;
  label: string;
  role: string;
  status: string;
  connectedTo: string[];
}

export interface LinkEquityItem {
  href: string;
  anchorText: string;
  rel: string;
  isDofollow: boolean;
  isNofollow: boolean;
  isExternal: boolean;
  isMarcoPartner: boolean;
}

export interface SeoGeoEoArtifacts {
  llmsTxt: string;
  schemaJsonLd: string;
  robotsTxt: string;
  htmlSnippet: string;
}

export interface SeoGeoEoReport {
  targetUrl: string;
  brandName: string;
  primaryKeywords: string;
  fetchMeta: {
    status: string;
    statusCode: number;
    fetchedLiveHtml: boolean;
    hasLiveLlmsTxt: boolean;
    hasLiveRobotsTxt: boolean;
    error: string | null;
    analyzedAt: string;
  };
  summary: {
    totalChecks: number;
    passCount: number;
    warnCount: number;
    failCount: number;
    seoPassCount: number;
    seoTotal: number;
    geoPassCount: number;
    geoTotal: number;
    eoPassCount: number;
    eoTotal: number;
    dofollowLinksCount: number;
    nofollowLinksCount: number;
  };
  pageSnapshot: {
    title: string;
    titleLength: number;
    metaDescription: string;
    metaDescriptionLength: number;
    canonicalUrl: string;
    wordCount: number;
    h1Text: string;
    h1Count: number;
    h2Count: number;
    h3Count: number;
    questionHeadingsCount: number;
    jsonLdCount: number;
    detectedEntityTypes: string[];
  };
  checks: SeoGeoEoCheckItem[];
  aiCrawlerMatrix: AiCrawlerItem[];
  entityGraphNodes: EntityGraphNode[];
  linkEquity: LinkEquityItem[];
  artifacts: SeoGeoEoArtifacts;
  authorityNetwork: {
    agency: string;
    description: string;
    partners: {
      name: string;
      url: string;
      rel: string;
      role: string;
    }[];
  };
}
