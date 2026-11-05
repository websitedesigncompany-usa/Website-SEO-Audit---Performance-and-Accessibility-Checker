import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { AuditService } from '../../services/audit.service';

@Component({
  selector: 'app-fresnel-logo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fresnel-identity"
      [class.fresnel-identity--horizontal]="isHorizontal()"
    >
      <div
        class="brand-hover-target"
        [class.brand-hover-target--horizontal]="isHorizontal()"
        tabindex="0"
        aria-describedby="marco-fresnel-lore-tooltip"
      >
        <div class="logo-showcase" aria-hidden="true">
          <!-- Marco Marketing × Fresnel Lighthouse Silhouette -->
          <svg
            class="fresnel-hero-logo"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              class="fresnel-lighthouse-silhouette"
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M49.65 14.8C50.25 14.8 50.75 15.3 50.75 15.9V17.95C54.65 18.55 57.62 20.85 57.62 23.65C57.62 24.05 57.25 24.35 56.54 24.45V29.45C57.95 30.15 59.18 31.35 59.18 32.95C59.18 34.65 57.85 35.95 56.25 36.75L59.08 78.55H60.35V81.85H63.38V85.15H36.52V81.85H39.55V78.55H40.82L43.65 36.75C42.05 35.95 40.72 34.65 40.72 32.95C40.72 31.35 41.95 30.15 43.36 29.45V24.45C42.65 24.35 42.28 24.05 42.28 23.65C42.28 20.85 45.25 18.55 49.15 17.95V15.9C49.15 15.3 49.35 14.8 49.65 14.8ZM44.73 24.95V29.05H54.69V24.95H44.73Z"
              fill="currentColor"
            />
          </svg>
        </div>

        <div class="brand-lockup-stack">
          <span class="brand-kicker">MARCO MARKETING · FRESNEL OPTICAL ENGINE</span>
          <span class="brand-display">
            SEO · GEO · EO &amp; Code Audit Suite
            <span class="brand-info-dot" aria-hidden="true">?</span>
          </span>
        </div>
      </div>

      <div id="marco-fresnel-lore-tooltip" role="tooltip" class="fresnel-tooltip">
        <div class="fresnel-tooltip__header">
          <span class="fresnel-tooltip__name">{{ lore().name }}</span>
          <span class="fresnel-tooltip__phonetic">{{ lore().pronunciation }}</span>
        </div>
        <blockquote class="fresnel-tooltip__quote">
          {{ lore().quote }}
        </blockquote>
        <p class="fresnel-tooltip__desc">
          {{ lore().explanation }}
        </p>
      </div>
    </div>
  `
})
export class FresnelLogoComponent {
  readonly auditService = inject(AuditService);
  readonly layout = input<'stacked' | 'horizontal'>('stacked');
  readonly isHorizontal = computed(() => this.layout() === 'horizontal');
  readonly lore = computed(() => this.auditService.lore());
}
