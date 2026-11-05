# Marco Marketing GEO & EO Visual Analytics Dashboard & Schema.org Entity Optimization Suite

This upgrade introduces an interactive **D3.js Visual Analytics Dashboard** and a **Schema.org Entity Optimization Cross-Reference Engine** into both the **Live URL SEO · GEO · EO Checker** and the **Git Repository Code Audit** report flows. Users can visually inspect multi-engine compatibility scores, entity coverage radar profiles, interactive `@graph` force networks, and toggle missing Schema.org structured data properties with live JSON-LD and git diff synthesis.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and UX decisions were confirmed during Phase 1 and govern this implementation:

- **Confirmed Placement**: The new **GEO & EO Visual Dashboard** and **Entity Optimization** cross-reference engine will appear in **both** the **Live URL SEO · GEO · EO Checker** report view and the **Git Repo Code Audit** report flow (Steps 3 & 7).
- **Confirmed Visualization Architecture**: Built with **D3.js (`d3`)** natively integrated into a standalone Angular component featuring three coordinated views:
  1. **Search & AI Engine Compatibility Gauges**: Radial arc gauges quantifying compatibility across Google Search + AI Overviews, ChatGPT Search (`OAI-SearchBot`), Perplexity (`PerplexityBot`), Claude (`ClaudeBot`), and Knowledge Graph Readiness.
  2. **6-Axis Entity & Signal Coverage Radar Chart**: Interactive D3 polygon radar plotting **Organization Identity**, **Service / Offer Graph**, **E-E-A-T Provenance**, **FAQ / Answer Readiness**, **Dofollow Link Equity**, and **AI Crawler Manifests (`/llms.txt`)**—showing current baseline vs. post-optimization coverage.
  3. **Interactive Schema.org `@graph` Force-Directed Network**: Draggable D3 force simulation mapping how `@id` nodes (`Organization`, `WebSite`, `ProfessionalService`, `SoftwareApplication`, `FAQPage`, `WebPage`) and `sameAs` / `rel="dofollow"` authority partners (`https://websitedesigncompany.site/` and `https://websitedesign.group/`) connect, highlighting missing entity links in amber/crimson.
- **Confirmed Entity Optimization Workflow**: An **Interactive Field Checklist with Live JSON-LD Generator & Patch Diff** that cross-references detected source code / DOM against official Schema.org type specifications, letting users check/uncheck missing required and recommended properties to dynamically rebuild the `@graph` JSON-LD payload and unified git diff patch in real time.

---

## 1. Overview & Core Concept

- **What It Does**:
  - **D3 GEO & EO Visual Dashboard**: Transforms raw audit findings into an interactive visual command center showing Search & Generative Engine compatibility scores, multi-axis entity coverage, and a live node-link graph of structured data relationships.
  - **Schema.org Entity Optimization Engine**: Cross-references HTML templates, existing JSON-LD scripts, and repository source files against Schema.org standards (`Organization`, `WebSite`, `ProfessionalService`, `SoftwareApplication`, `FAQPage`, `BreadcrumbList`). It pinpoints missing required and recommended fields (such as `@id`, `sameAs`, `knowsAbout`, `areaServed`, `founder`, `publishingPrinciples`, `hasOfferCatalog`, `mainEntity`) and lets users interactively toggle them into a ready-to-deploy JSON-LD `@graph` or git patch.
- **Target Audience / Persona**: Technical SEO architects, full-stack engineers, and digital authority teams at **Marco Marketing** auditing live client properties (`https://websitedesigncompany.site/`, `https://websitedesign.group/`, or custom URLs) and GitHub repositories.
- **Key Value**: Bridges the gap between abstract Schema.org/LLM citation standards and actionable engineering by pairing visual D3 diagnostics with instant, standards-compliant code generation.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Live URL Checker Flow**:
     - After running a check on any URL or preset Marco Marketing partner domain, the **GEO & EO Visual Dashboard** renders above the diagnostic tabs with interactive D3 Radial Compatibility Gauges, the 6-Axis Coverage Radar Chart, and the `@graph` Force Network.
     - Selecting a node in the D3 force graph or switching to the **Entity Optimization (Schema.org Cross-Reference)** panel reveals each Schema.org entity type, its current code status (`Detected`, `Partial`, `Missing`), and an interactive checklist of missing Schema.org fields.
     - Toggling fields in the checklist immediately updates the **Projected Coverage Overlay** on the D3 radar chart and regenerates the **Live JSON-LD `@graph` Code** and **Unified Git Diff** for one-click copy or download.
  2. **Git Repository Code Audit Flow (Steps 3 & 7)**:
     - Inside the Code Audit Report, a dedicated **GEO · EO Visual Dashboard & Entity Optimization** section sits alongside the commit filter bar.
     - Displays how the repository's source files map against Schema.org standards, visualizes before/after compatibility scores as commits are selected or deselected, and allows engineers to customize missing Schema.org properties before downloading the `.patch` or running the 1-click PR terminal command.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: High-precision optical instrumentation inspired by Augustin-Jean Fresnel’s stepped prism lens and **Marco Marketing** editorial authority—clean single-elevation surfaces, crisp 1px structural borders, and zero nested card clutter.
  - *Color Palette & Mood*:
    - Light Mode: Crisp white canvas (`#FFFFFF`), soft lavender-tinted structural surface (`#F6F4FC`), deep plum ink (`#351A55`), violet optical accent (`#713FB9`), and semantic data indicators (Emerald `#059669` for verified schema/dofollow, Amber `#D97706` for partial/recommended fields, Crimson `#DC2626` for missing required schema).
    - Dark Mode: Deep nocturnal plum canvas (`#190B28`), structural surface (`#2B1544`), luminous periwinkle (`#8A88FF`), and lavender (`#B9A4DF`) with automatic D3 SVG theme adaptation.
  - *Typography & Hierarchy*: `Google Sans` / `Plus Jakarta Sans` for crisp editorial hierarchy paired with `Google Sans Code` / `JetBrains Mono` (`tabular-nums`) for all compatibility percentages, Schema.org property keys, `@id` URIs, and unified git diffs.
- **Interactive Feedback & Motion**:
  - Smooth D3 arc and polygon transitions (`cubic-bezier(0.22, 1, 0.36, 1)`) when toggling missing Schema.org properties or selecting/deselecting git commits.
  - Hover tooltips on D3 radar vertices and force-graph nodes displaying exact Schema.org property coverage and `rel="dofollow"` authority status.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: D3.js Over Recharts for Angular Native SVG Rendering**
  - *Chosen Approach*: Use **D3.js (`d3` + `@types/d3`)** inside a dedicated standalone Angular component (`GeoEoDashboardComponent`) with reactive Angular `effect()` hooks bound to signal state.
  - *Why*: Recharts is tightly coupled to React's virtual DOM, whereas D3 integrates natively with Angular's SVG template and signal reactivity, enabling custom radial gauges, dual-polygon radar overlays (Baseline vs. Optimized), and interactive force-directed `@graph` node networks with zero framework friction.
- **Decision 2: Live Bi-Directional Coupling Between Field Checklist, D3 Charts, and Code Output**
  - *Chosen Approach*: Checking or unchecking a suggested Schema.org field in the **Entity Optimization** panel immediately recalculates the entity coverage score, animates the "Projected Optimization" polygon on the D3 radar chart, and updates both the JSON-LD `@graph` block and unified git diff.
  - *Why*: Gives engineers immediate visual confirmation of how each structured data attribute improves Search Engine and AI Answer Engine compatibility.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌────────────────────────────────────────────────────────────────────────────┐
│                   MARCO MARKETING · FRESNEL APPLICATION                    │
├──────────────────────────────────────┬─────────────────────────────────────┤
│   Live SEO · GEO · EO Checker View   │   Git Repo Code Audit Report View   │
└──────────────────┬───────────────────┴──────────────────┬──────────────────┘
                   │                                      │
                   ▼                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│             GeoEoDashboardComponent (Standalone D3 + Schema UI)            │
│  ┌──────────────────────┐ ┌──────────────────────┐ ┌────────────────────┐  │
│  │ D3 Compatibility     │ │ D3 6-Axis Entity     │ │ D3 Schema @graph   │  │
│  │ Radial Arc Gauges    │ │ Coverage Radar Chart │ │ Force Network      │  │
│  └──────────┬───────────┘ └──────────┬───────────┘ └─────────┬──────────┘  │
│             └────────────────────────┼───────────────────────┘             │
│                                      ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │     Entity Optimization Cross-Reference & Missing Field Checklist    │  │
│  │  • Schema.org Type Inspector (Organization, WebSite, Service, FAQ)   │  │
│  │  • Interactive Field Toggles (@id, sameAs, knowsAbout, offers, etc.) │  │
│  │  • Live JSON-LD @graph Synthesizer & Unified Git Patch Diff Viewer   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────┬─────────────────────────────────────┘
                                       │
                                       ▼
┌────────────────────────────────────────────────────────────────────────────┐
│            AuditService (Angular Signals)  ◄──►  Express API               │
│  • POST /api/checker/analyze (24 checks + Schema.org Cross-Reference)      │
│  • POST /api/audit/start & /status (7-Pillar Repo Audit + Entity Metrics)  │
└────────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - **Compatibility Scores**: Structured metrics for `googleSearch`, `aiOverviews`, `chatgptSearch`, `perplexity`, `claude`, and `entityKnowledgeGraph` (0–100 scale with baseline and optimized projections).
  - **Entity Coverage Radar Axes**: 6 normalized dimensions (`Organization Identity`, `Service & Offer Schema`, `E-E-A-T Provenance`, `FAQ & Answer Readiness`, `Dofollow Authority Graph`, `AI Crawler & llms.txt`).
  - **Schema.org Cross-Reference Spec**: Array of Schema.org entity specifications (`Organization`, `WebSite`, `ProfessionalService`, `FAQPage`, `WebPage`), each containing detected source locations, present properties, and toggleable missing properties (`key`, `expectedType`, `requirementLevel: 'Required' | 'Recommended'`, `seoImpact`, `suggestedValue`, `selected`).
- **Interactive Component & State Mapping**:
  - **Engine Gauge & Radar Hover**: Hovering any gauge or radar vertex highlights the corresponding Schema.org entity rules and GEO/EO checks.
  - **Force Graph Node Selection**: Clicking an entity node in the D3 force graph filters or scrolls to that entity's missing properties in the Schema.org Cross-Reference checklist.
  - **Missing Property Toggle**: Toggling any property updates the `selectedSchemaFields` signal, recomputes the live `@graph` JSON-LD and unified git diff, and animates the D3 radar chart and compatibility gauges.
  - **One-Click Copy & Patch Export**: Users can copy the customized JSON-LD `<script type="application/ld+json">`, download the `.jsonld` file, or copy/download the unified `.patch` diff directly.
