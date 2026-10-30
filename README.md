# React + Vite

## Supabase user accounts

Apply [`supabase/migrations/20261029195500_create_users_table.sql`](./supabase/migrations/20261029195500_create_users_table.sql)
to your Supabase project (for example, in the Supabase SQL Editor). It creates
`public.users` and a database trigger that records each new auth user's name,
email, preferred language, and signup time. Existing auth users are backfilled
when the migration runs.

The signup form currently collects a name, email, and password. Additional
farmer details are stored separately in `public.farmer_profiles`.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
