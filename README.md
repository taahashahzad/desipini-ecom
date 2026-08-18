# Meridian — Premium E-Commerce Store

A production-quality e-commerce storefront and admin dashboard built with React, Vite, Tailwind CSS, and Supabase.

## Stack

- **Frontend:** React 19 + Vite + TypeScript
- **Styling:** Tailwind CSS v4 (custom design system — see `src/index.css`)
- **Backend:** Supabase (Postgres, Auth, Storage, RLS)
- **State:** Zustand (cart, wishlist) + React Context (auth)
- **Animation:** Framer Motion
- **Charts:** Recharts
- **Icons:** Lucide React

## 1. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com).
2. Open the SQL Editor and run `supabase_schema.sql` (in the project root, one level up from this folder) once, top to bottom. It creates all tables, RLS policies, triggers, storage buckets, and the `place_order` / `validate_coupon` functions.
3. In your Supabase project settings, grab your **Project URL** and **anon public key**.

## 2. Configure the app

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 3. Install & run

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## 4. Create your admin account

1. Sign up for an account through the app's `/signup` page.
2. In the Supabase SQL Editor, run:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

3. Refresh the app — you'll see an **Admin** link in the header, and `/admin` will be accessible.

## Project Structure

```
src/
├── components/     UI primitives, product/cart/admin/shared components
├── pages/          Route-level pages (storefront, auth, account, admin)
├── layouts/         Layout shells (storefront, account, admin, auth)
├── context/         AuthContext (Supabase Auth + profile/role)
├── store/           Zustand stores (cart, wishlist)
├── services/        All Supabase data access, grouped by domain
├── hooks/           Shared React hooks
├── lib/             Supabase client, utils (cn, formatCurrency, etc.)
├── types/           Domain TypeScript types
├── routes/          Route guards (RequireAuth, RequireAdmin)
└── utils/           Misc helpers (recently viewed, recent searches)
```

## Notes

- **Payments:** Only Cash on Delivery is wired up, by design (per spec). The checkout flow and `place_order` database function are structured so a payment gateway (Stripe, etc.) can be added later without restructuring the order pipeline — swap the "Payment" section in `CheckoutPage.tsx` and set `payment_status` accordingly.
- **Images:** Uploaded through Supabase Storage with client-side compression (resized + converted to WebP) before upload.
- **Security:** All access control is enforced via Postgres Row Level Security — the frontend `isAdmin` check is for UX only, not the security boundary. Stock decrements happen inside the `place_order` SQL function (`SECURITY DEFINER`) so customers never need direct write access to the `products` table.
- **No mock data:** Every list, chart, and dashboard number is a live Supabase query. An empty database will show empty states everywhere, as expected.

## Build

```bash
npm run build
```

Outputs to `dist/`, ready for static hosting (Vercel, Netlify, Cloudflare Pages, etc.). Remember to set the same `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` as environment variables on your host.
