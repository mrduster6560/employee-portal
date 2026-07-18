# Employee Portal — File Placement Guide

This zip contains the app code. Copy each file into your existing
`employee-portal` project, replacing files with the same name/path.

## Folder structure to create/replace

```
employee-portal/
├── middleware.ts                      (replace/create at project root)
├── lib/
│   └── supabase/
│       ├── client.ts
│       ├── server.ts
│       └── middleware.ts
└── app/
    ├── page.tsx                       (replace the default one)
    ├── login/
    │   ├── page.tsx
    │   └── actions.ts
    ├── dashboard/
    │   ├── page.tsx
    │   └── actions.ts
    └── admin/
        ├── page.tsx
        └── actions.ts
```

## Steps

1. Open your `employee-portal` folder in VS Code.
2. Create the `lib/supabase/` folder if it doesn't exist, and drop in
   `client.ts`, `server.ts`, `middleware.ts`.
3. Put `middleware.ts` directly in the project root (same level as `app/`).
4. In `app/`, replace `page.tsx` with the one here.
5. Create `app/login/`, `app/dashboard/`, `app/admin/` folders and drop
   in their respective `page.tsx` and `actions.ts` files.
6. Make sure your `.env.local` (project root) has:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
7. In your terminal, inside the project folder:
   ```
   npm install @supabase/supabase-js @supabase/ssr
   npm run dev
   ```
8. Open http://localhost:3000 — you should be redirected to /login.

## Notes

- The **first person to sign up becomes admin** automatically (this logic
  lives in the database trigger from the schema, not in this code).
- Email confirmation should be OFF in Supabase (Authentication → Providers →
  Email → toggle off "Confirm email"), otherwise signup won't log you in
  immediately.
- Tailwind classes are used throughout — if your project didn't have
  Tailwind enabled during `create-next-app`, let me know and I'll convert
  the styling to plain CSS instead.
