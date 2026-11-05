import {
  DestroyRef,
  Injectable,
  computed,
  effect,
  inject,
  linkedSignal,
  signal
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  ArtifactTabKey,
  AuditCommit,
  AuditMode,
  AuditSession,
  CheckerPillarFilter,
  FlowStep,
  FresnelLore,
  LighthouseCategory,
  PatchBundle,
  PullRequestResult,
  SeoGeoEoCheckItem,
  SeoGeoEoReport,
  WorkspaceMode
} from '../models/audit.model';

export const DEFAULT_SAMPLE_LHR_JSON = JSON.stringify(
  {
    lighthouseVersion: '12.2.0',
    fetchTime: '2026-10-06T13:35:00.000Z',
    requestedUrl: 'https://websitedesigncompany.site/',
    finalDisplayedUrl: 'https://websitedesigncompany.site/',
    categories: {
      performance: {
        id: 'performance',
        title: 'Performance',
        score: 0.68,
        auditRefs: [
          { id: 'largest-contentful-paint-element', weight: 25, group: 'diagnostics' },
          { id: 'render-blocking-resources', weight: 15, group: 'load-opportunities' },
          { id: 'unsized-images', weight: 10, group: 'diagnostics' }
        ]
      },
      accessibility: {
        id: 'accessibility',
        title: 'Accessibility',
        score: 0.74,
        auditRefs: [
          { id: 'color-contrast', weight: 7, group: 'a11y-color-contrast' },
          { id: 'button-name', weight: 10, group: 'a11y-names-labels' }
        ]
      },
      'best-practices': {
        id: 'best-practices',
        title: 'Best Practices',
        score: 0.83,
        auditRefs: [{ id: 'csp-xss', weight: 5, group: 'trust-safety' }]
      },
      seo: {
        id: 'seo',
        title: 'SEO',
        score: 0.82,
        auditRefs: [{ id: 'structured-data', weight: 5, group: 'seo-content' }]
      }
    },
    audits: {
      'largest-contentful-paint-element': {
        id: 'largest-contentful-paint-element',
        title: 'Largest Contentful Paint element',
        score: 0.28,
        scoreDisplayMode: 'metricSavings',
        numericValue: 3420,
        displayValue: '3,420 ms',
        metricSavings: { LCP: 1180 },
        details: {
          type: 'table',
          items: [
            {
              node: {
                selector: 'section.hero-stage > picture > img.hero-banner-media',
                snippet: '<img class="hero-banner-media" src="/assets/hero-lens.jpg">'
              }
            }
          ]
        }
      },
      'render-blocking-resources': {
        id: 'render-blocking-resources',
        title: 'Eliminate render-blocking resources',
        score: 0.42,
        scoreDisplayMode: 'metricSavings',
        displayValue: 'Potential savings of 640 ms',
        metricSavings: { FCP: 640, LCP: 480 }
      },
      'unsized-images': {
        id: 'unsized-images',
        title: 'Image elements do not have explicit width and height',
        score: 0.0,
        scoreDisplayMode: 'binary',
        displayValue: '3 elements found',
        metricSavings: { CLS: 0.14 }
      },
      'color-contrast': {
        id: 'color-contrast',
        title: 'Background and foreground colors do not have a sufficient contrast ratio',
        score: 0.0,
        scoreDisplayMode: 'binary',
        displayValue: '2 elements fail WCAG AA (3.1:1 vs 4.5:1)'
      }
    }
  },
  null,
  2
);

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  readonly workspaceMode = signal<WorkspaceMode>('checker');
  readonly step = signal<FlowStep>(1);
  readonly isTransitioning = signal<boolean>(false);
  readonly theme = signal<'light' | 'dark'>('light');
  readonly mode = signal<AuditMode>('live');

  readonly lore = signal<FresnelLore>({
    name: 'Marco Marketing · Fresnel Engine',
    pronunciation: '/ˈmɑːrkoʊ/ · /freɪˈnɛl/',
    origin:
      'Engineered by Marco Marketing on top of the Fresnel stepped-prism optical architecture (Augustin-Jean Fresnel, 1788–1827).',
    quote:
      '“Where traditional audits scatter recommendations across dashboards, Marco Marketing’s Fresnel lens refracts SEO, GEO, EO, Performance, Accessibility, and Security signals into self-contained code and schema.”',
    explanation:
      'Built for modern web engineering and digital authority, Marco Marketing combines GitHub source-code remediation with a 24-point SEO (Search Engine Optimization), GEO (Generative Engine Optimization), and EO (Entity & Answer Optimization) engine—complete with llms.txt manifests, JSON-LD @graph schemas, and verified dofollow authority graphs.'
  });

  readonly session = signal<AuditSession | null>(null);
  readonly selectedCommitIds = signal<Set<string>>(new Set());
  readonly expandedDiffIds = signal<Set<string>>(new Set());

  private readonly sessionScopeKey = computed(
    () => `${this.session()?.id ?? 'init'}:${this.session()?.runPhase ?? 'static'}`
  );

  /** Automatically resets to 'all' whenever a new session or runPhase begins, while remaining writable */
  readonly categoryFilter = linkedSignal<string, LighthouseCategory>({
    source: this.sessionScopeKey,
    computation: () => 'all'
  });

  readonly patchBundle = signal<PatchBundle | null>(null);
  readonly isPatchDrawerOpen = signal<boolean>(false);
  readonly prResult = signal<PullRequestResult | null>(null);
  readonly isCreatingPr = signal<boolean>(false);

  /** Automatically defaults to 'inline' whenever a new PR bundle is generated, while remaining writable */
  readonly prCliMode = linkedSignal<PullRequestResult | null, 'inline' | 'short'>({
    source: this.prResult,
    computation: () => 'inline'
  });

  readonly lhrJsonInput = signal<string>('');
  readonly lhrFileName = signal<string>('');

  // =========================================================================
  // SEO · GEO · EO LIVE CHECKER & ARTIFACT GENERATOR STATE
  // =========================================================================
  readonly checkerUrl = signal<string>('https://websitedesigncompany.site/');
  readonly checkerBrandName = signal<string>('Marco Marketing');
  readonly checkerKeywords = signal<string>(
    'Website Design Company, Enterprise Web Development, Technical SEO, Generative Engine Optimization (GEO), Entity Optimization (EO)'
  );
  readonly checkerRawHtml = signal<string>('');
  readonly showRawHtmlInput = signal<boolean>(false);
  readonly isAnalyzingChecker = signal<boolean>(false);
  readonly checkerReport = signal<SeoGeoEoReport | null>(null);
  readonly checkerFilter = signal<CheckerPillarFilter>('all');
  readonly activeArtifactTab = signal<ArtifactTabKey>('llmsTxt');
  readonly expandedCheckIds = signal<Set<string>>(new Set());

  readonly filteredCheckerItems = computed<SeoGeoEoCheckItem[]>(() => {
    const report = this.checkerReport();
    if (!report) return [];
    const filter = this.checkerFilter();
    if (filter === 'seo' || filter === 'geo' || filter === 'eo') {
      return report.checks.filter((item) => item.pillar === filter);
    }
    return report.checks;
  });

  readonly allCommits = computed<AuditCommit[]>(() => this.session()?.commits ?? []);

  readonly filteredCommits = computed<AuditCommit[]>(() => {
    const commits = this.allCommits();
    const filter = this.categoryFilter();
    if (filter === 'all') return commits;
    return commits.filter((c) => c.category === filter);
  });

  readonly selectedCount = computed<number>(() => this.selectedCommitIds().size);
  readonly totalCommitsCount = computed<number>(() => this.allCommits().length);

  readonly categoryCounts = computed<Record<LighthouseCategory, number>>(() => {
    const commits = this.allCommits();
    return {
      all: commits.length,
      performance: commits.filter((c) => c.category === 'performance').length,
      accessibility: commits.filter((c) => c.category === 'accessibility').length,
      'best-practices': commits.filter((c) => c.category === 'best-practices').length,
      seo: commits.filter((c) => c.category === 'seo').length,
      geo: commits.filter((c) => c.category === 'geo').length,
      eo: commits.filter((c) => c.category === 'eo').length,
      security: commits.filter((c) => c.category === 'security').length
    };
  });

  constructor() {
    const savedTheme =
      typeof localStorage !== 'undefined'
        ? (localStorage.getItem('fresnel-theme') as 'light' | 'dark' | null)
        : null;
    if (savedTheme === 'dark' || savedTheme === 'light') {
      this.theme.set(savedTheme);
    }

    effect(() => {
      const activeTheme = this.theme();
      this.document?.documentElement?.setAttribute('data-theme', activeTheme);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('fresnel-theme', activeTheme);
      }
    });

    this.destroyRef.onDestroy(() => this.stopPolling());

    // Automatically run initial SEO · GEO · EO audit so the workspace is populated immediately
    setTimeout(() => {
      void this.runSeoGeoEoChecker();
    }, 80);
  }

  setWorkspaceMode(mode: WorkspaceMode): void {
    this.workspaceMode.set(mode);
    if (mode === 'checker' && !this.checkerReport() && !this.isAnalyzingChecker()) {
      void this.runSeoGeoEoChecker();
    }
  }

  setTheme(nextTheme: 'light' | 'dark'): void {
    this.theme.set(nextTheme);
  }

  toggleTheme(): void {
    this.theme.update((current) => (current === 'light' ? 'dark' : 'light'));
  }

  transitionToStep(nextStep: FlowStep): void {
    if (this.step() === nextStep) return;
    this.isTransitioning.set(true);
    setTimeout(() => {
      this.step.set(nextStep);
      this.isTransitioning.set(false);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 240);
  }

  async runSeoGeoEoChecker(presetUrl?: string, presetBrand?: string): Promise<void> {
    if (presetUrl) {
      this.checkerUrl.set(presetUrl);
    }
    if (presetBrand) {
      this.checkerBrandName.set(presetBrand);
    }

    this.isAnalyzingChecker.set(true);
    try {
      const report = await firstValueFrom(
        this.http.post<SeoGeoEoReport>('/api/checker/analyze', {
          url: this.checkerUrl().trim() || 'https://websitedesigncompany.site/',
          brandName: this.checkerBrandName().trim() || 'Marco Marketing',
          primaryKeywords: this.checkerKeywords().trim(),
          rawHtml: this.checkerRawHtml().trim()
        })
      );
      this.checkerReport.set(report);
      const firstFailOrWarn = report.checks.find((c) => c.status !== 'pass') ?? report.checks[0];
      if (firstFailOrWarn) {
        this.expandedCheckIds.set(new Set([firstFailOrWarn.id]));
      }
    } catch (err) {
      console.error('SEO/GEO/EO checker error:', err);
    } finally {
      this.isAnalyzingChecker.set(false);
    }
  }

  toggleCheckSnippet(checkId: string): void {
    const next = new Set(this.expandedCheckIds());
    if (next.has(checkId)) {
      next.delete(checkId);
    } else {
      next.add(checkId);
    }
    this.expandedCheckIds.set(next);
  }

  async startAudit(repoUrl: string, mode: AuditMode = 'live'): Promise<void> {
    this.stopPolling();
    this.workspaceMode.set('repo-audit');
    this.mode.set(mode);
    this.isPatchDrawerOpen.set(false);

    const response = await firstValueFrom(
      this.http.post<AuditSession>('/api/audit/start', {
        repoUrl: mode === 'demo' ? 'https://github.com/fresnel-sandbox/lumina-web-app' : repoUrl,
        mode,
        branch: 'main',
        categories: [
          'performance',
          'accessibility',
          'best-practices',
          'seo',
          'geo',
          'eo',
          'security'
        ]
      })
    );

    this.session.set(response);
    this.transitionToStep(2);

    this.pollTimer = setInterval(() => {
      void this.pollStatus();
    }, 680);
  }

  openLighthouseJsonStep(): void {
    this.isPatchDrawerOpen.set(false);
    if (!this.lhrJsonInput()) {
      this.loadSampleLhrJson();
    }
    this.transitionToStep(5);
  }

  loadSampleLhrJson(): void {
    this.lhrJsonInput.set(DEFAULT_SAMPLE_LHR_JSON);
    this.lhrFileName.set('lighthouse-report-lhr.json (sample LHR)');
  }

  async startLhrAudit(): Promise<void> {
    this.stopPolling();
    this.isPatchDrawerOpen.set(false);
    const currentId = this.session()?.id || 'demo';

    const response = await firstValueFrom(
      this.http.post<AuditSession>(`/api/audit/${currentId}/lhr-start`, {
        lhrJson: this.lhrJsonInput() || DEFAULT_SAMPLE_LHR_JSON
      })
    );

    this.session.set(response);
    this.transitionToStep(6);

    this.pollTimer = setInterval(() => {
      void this.pollStatus();
    }, 680);
  }

  stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private async pollStatus(): Promise<void> {
    const current = this.session();
    if (!current) return;

    try {
      const updated = await firstValueFrom(
        this.http.get<AuditSession>(`/api/audit/${current.id}/status`)
      );
      this.session.set(updated);

      if (updated.status === 'completed') {
        this.stopPolling();
        setTimeout(() => {
          if (this.step() === 2) {
            this.prepareReportState(updated);
            this.transitionToStep(3);
          } else if (this.step() === 6) {
            this.prepareReportState(updated);
            this.transitionToStep(7);
          }
        }, 650);
      }
    } catch (err) {
      this.stopPolling();
      console.error(
        'Status poll error:',
        err instanceof Error
          ? err
          : new Error(
              err instanceof Object && 'message' in err
                ? String((err as { message: unknown }).message)
                : String(err)
            )
      );
    }
  }

  async skipToReport(): Promise<void> {
    const current = this.session();
    if (!current || (current.mode !== 'demo' && this.mode() !== 'demo')) return;
    this.stopPolling();

    const updated = await firstValueFrom(
      this.http.post<AuditSession>(`/api/audit/${current.id}/fast-forward`, {})
    );
    this.session.set(updated);
    this.prepareReportState(updated);
    this.transitionToStep(updated.runPhase === 'lhr' ? 7 : 3);
  }

  private prepareReportState(sessionData: AuditSession): void {
    const allIds = new Set(sessionData.commits.map((c) => c.id));
    this.selectedCommitIds.set(allIds);
    const firstId = sessionData.commits[0]?.id;
    this.expandedDiffIds.set(firstId ? new Set([firstId]) : new Set());
    this.categoryFilter.set('all');
    void this.refreshPatchBundle();
  }

  toggleCommitSelection(commitId: string): void {
    const next = new Set(this.selectedCommitIds());
    if (next.has(commitId)) {
      next.delete(commitId);
    } else {
      next.add(commitId);
    }
    this.selectedCommitIds.set(next);
    void this.refreshPatchBundle();
  }

  selectAllCommits(): void {
    this.selectedCommitIds.set(new Set(this.allCommits().map((c) => c.id)));
    void this.refreshPatchBundle();
  }

  clearAllCommits(): void {
    this.selectedCommitIds.set(new Set());
    void this.refreshPatchBundle();
  }

  toggleDiff(commitId: string): void {
    const next = new Set(this.expandedDiffIds());
    if (next.has(commitId)) {
      next.delete(commitId);
    } else {
      next.add(commitId);
    }
    this.expandedDiffIds.set(next);
  }

  buildClientSidePatchFallback(): { filename: string; content: string } {
    const current = this.session();
    const selectedSet = this.selectedCommitIds();
    const chosen = (current?.commits ?? []).filter((c) => selectedSet.has(c.id));
    const suffix = current?.runPhase === 'lhr' ? 'lhr-fixes' : 'code-audit';
    const filename = `marco-marketing-fresnel-${current?.repo?.repo || 'repository'}-${suffix}.patch`;
    const total = chosen.length;
    if (total === 0) {
      return { filename, content: '# No commits selected\n' };
    }
    const content = chosen
      .map((c, idx) =>
        [
          `From ${c.fullSha || c.sha} Mon Sep 17 00:00:00 2001`,
          `From: ${c.author || 'Marco Marketing Fresnel <fresnel@noreplies.github.com>'}`,
          `Date: ${c.date || new Date().toUTCString()}`,
          `Subject: [PATCH ${idx + 1}/${total}] ${c.commitMessage || c.title}`,
          ``,
          c.summary,
          `---`,
          c.diff,
          `-- `,
          `2.47.0`,
          ``
        ].join('\n')
      )
      .join('\n');
    return { filename, content };
  }

  async refreshPatchBundle(): Promise<PatchBundle | null> {
    const current = this.session();
    if (!current) return null;

    const bundle = await firstValueFrom(
      this.http.post<PatchBundle>(`/api/audit/${current.id}/patch`, {
        selectedCommitIds: Array.from(this.selectedCommitIds())
      })
    );
    this.patchBundle.set(bundle);
    return bundle;
  }

  openPatchGuideAndDownload(): void {
    this.isPatchDrawerOpen.set(true);
    const cached = this.patchBundle();
    if (cached && cached.patchContent) {
      this.triggerBrowserDownload(cached.filename, cached.patchContent, cached.downloadUrl);
    } else {
      const fallback = this.buildClientSidePatchFallback();
      this.triggerBrowserDownload(fallback.filename, fallback.content);
    }
    void this.refreshPatchBundle();
  }

  triggerBrowserDownload(filename: string, content: string, downloadUrl?: string): void {
    if (!this.document?.body) return;
    try {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = this.document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.style.display = 'none';
      this.document.body.appendChild(anchor);
      anchor.click();
      setTimeout(() => {
        anchor.remove();
        URL.revokeObjectURL(url);
      }, 250);
    } catch {
      if (downloadUrl && typeof window !== 'undefined') {
        window.open(downloadUrl, '_blank');
      }
    }
  }

  async createPullRequest(): Promise<void> {
    const current = this.session();
    if (!current || this.selectedCommitIds().size === 0) return;

    this.isCreatingPr.set(true);
    try {
      const pr = await firstValueFrom(
        this.http.post<PullRequestResult>(`/api/audit/${current.id}/pr`, {
          selectedCommitIds: Array.from(this.selectedCommitIds())
        })
      );
      this.prResult.set(pr);
      this.prCliMode.set('inline');
      this.transitionToStep(4);
    } finally {
      this.isCreatingPr.set(false);
    }
  }
}
