# Preproute — Test Management Application

A 5-page React + TypeScript application for creating, managing, and publishing tests.

## Tech Stack

- **React 19** + **TypeScript** (Vite)
- **React Router v7** — client-side routing
- **React Hook Form** + **Zod** — form handling & validation
- **Axios** — API integration with JWT interceptors
- **React Hot Toast** — notifications
- **Lucide React** — icons

## Project Structure

```
src/
├── api/
│   ├── client.ts           # Axios instance with auth interceptors
│   └── endpoints.ts        # All API functions
|── assets/
│   ├── images              # All images/icons
│   └── scss/
|       ├── base/_font.scss      # font family added
|       ├── components/
|       |── ├── _add-questions.scss
|       |   ├── _create-test.scss
|       |   ├── _preview-publish.scss
|       ├── layout/layout.scss
|       ├── modules/
|       |   ├── _breadcrumb.scss
|       |   ├── _button.scss
|       |   ├── _form.scss
|       ├── utilities
|       |   ├── _functions.scss
|       |   ├── _variables.scss
|       |── dashboard.scss
|       |── login.scss
|       |── main.scss        # Main scss files
|           
├── components/
│   ├── Layout.tsx           # Navbar + page wrapper
│   ├── ProtectedRoute.tsx
│   └── BreadCrumb.tsx
├── context/
│   ├── AuthContext.tsx      # JWT auth state
│   └── TestContext.tsx      # Cross-page test/question state
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── CreateTestPage.tsx
│   ├── AddQuestionsPage.tsx
│   └── PreviewPublishPage.tsx
├── types/index.ts
└── index.css
```

## Getting Started

```bash
npm install
npm run dev      # Dev server at http://localhost:5173
npm run build    # Production build
```

## API Base URL

`https://admin-moderator-backend-staging.up.railway.app/api`

## Application Flow

1. **Login** → JWT stored in localStorage
2. **Dashboard** → all tests, search/filter, edit/delete
3. **Create/Edit Test** → subject-topic cascade, marking scheme, save as draft
4. **Add Questions** → MCQ form, bulk save, edit/delete per question
5. **Preview & Publish** → full overview, expandable questions, one-click publish

## Key Features

- JWT auth with Axios interceptor auto-attaching token
- Cascading Subject → Topics → Sub-topics dropdowns
- Multi-select topic chips
- Save as Draft at any point
- Bulk question creation API
- Responsive design
- Full form validation with Zod
