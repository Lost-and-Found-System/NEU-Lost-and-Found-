## 1. Overview
A knowledge management web application for NEU students to post lost and found items, comment, and resolve issues.

## 2. KM Framework
- ano po KM framework?

## 3. Team
| Role | Name |
|------|------|
| Project Manager | Alyssa Bernadette Tuliao |
| Full-Stack Developer | Maria Antonette Espinosa |
| UX/UI Designer | Danica Lacandula |
| KM Analyst | Angel Lyn Tolentino |
| QA & Documentation Lead | Venice Marizene Linga |

## 4. Features
- Post lost/found items
- Comment on posts
- Mark items as resolved
- View own resolved issues
- Notifications
- Filter by lost/found + categories (electronics, clothing, ID/cards, keys, jewelry, others)
- Search bar
- View my posts and resolved issues

## 5. Tech Stack
- **Frontend:** React with TypeScript
- **Backend / Database:** Supabase
- **AI API:** Google Gemini
- **Styling:** CSS
- **Hosting:** Vercel

## 6. Setup Instructions
No local installation required. The app is deployed and accessible online.

**Live URL:** [Insert your deployed app link here]

Simply click the link above to access the NEU Found Hub lost and found system.

## 7. Repository Structure
EXAMPLE REPO STRUCTURE ONLY

```
/
├── README.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── /src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── /lib/
│       ├── supabase.ts
│       ├── gemini.ts
│       └── utils.ts
├── /docs/
│   ├── /test-cases/
│   ├── failure-analysis.md
│   ├── prompt-log.md
│   ├── km-report.md
│   ├── km-architecture.md
│   ├── decision-log.md
│   ├── design-rationale.md
│   ├── /wireframes/
│   └── /adr/
├── /public/
└── /tests/
```

## 8. Branch Strategy
We follow a feature-branch workflow to ensure code quality and organized collaboration.

### Main Branches

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code. Only merged via pull requests after review. |
| `qa/test-plan` | QA testing and test case documentation. |

### Feature Branches (Team Members)

| Branch | Owner | Purpose |
|--------|-------|---------|
| `Full-Stack-Developer-1_ESPINOSA` | Espinosa | Core codebase, backend integration, deployment |
| `UI/UX-Designer_LACANDULA` | Lacandula | Wireframes, front-end components, styling |
| `Knowledge-Management-Analyst_TOLENTINO` | Tolentino | KM reports, taxonomy, framework documentation |
| `QA-&-Documentation-Lead_LINGA` | Linga | Test cases, bug tracking, documentation |
| `Scrum-Master_TULIAO` | Tuliao | Project management, decision log, standup notes |
| `ui/filter-bar` | Designer | Filter by lost/found + categories feature |
| `ui/wireframe` | Designer | Initial wireframe development |

### Workflow

1. Each member works on their own feature branch
2. Commits are pushed to individual branches
3. Pull requests are created to merge into `dev`
4. At least one team member reviews before merging
5. No direct commits to `main` allowed


## 9. Contribution Evidence
All 5 team members have contributed to the project through their respective branches.

| Member | Branch | Key Contributions |
|--------|--------|-------------------|
| Tuliao (PM) | `Scrum-Master_TULIAO` | Decision log, standup notes, PR reviews, project coordination |
| Espinosa (Developer) | `Full-Stack-Developer-1_ESPINOSA` | React + Supabase codebase, Gemini AI integration, Vercel deployment |
| Lacandula (Designer) | `UI/UX-Designer_LACANDULA` | Wireframes, front-end components, filter bar, responsive design |
| Tolentino (KM Analyst) | `Knowledge-Management-Analyst_TOLENTINO` | KM Conceptual Report, taxonomy, framework mapping |
| Linga (QA & Docs) | `QA-&-Documentation-Lead_LINGA` | Test cases (TC-001 to TC-010), GitHub issues, README, Wiki, Failure Analysis |

### Pull Requests
- Each member has opened at least 1 PR that has been reviewed and merged
- PRs require at least one reviewer before merging

## 10. Screenshots
*Screenshots will be added once the app is fully deployed.*

| Page | Screenshot |
|------|------------|
| Home Feed / Dashboard | `[Screenshot to be added]` |
| Create Post | `[Screenshot to be added]` |
| Comments Section | `[Screenshot to be added]` |
| Notifications Panel | `[Screenshot to be added]` |
| Resolved Issues Page | `[Screenshot to be added]` |
| Search + Filter Results | `[Screenshot to be added]` |
| Mobile Responsive View | `[Screenshot to be added]` |

## 11. License
Copyright (c) 2026 NEU Found Hub Team
