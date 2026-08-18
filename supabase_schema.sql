-- =====================================================================
-- MERIDIAN — E-COMMERCE DATABASE SCHEMA
-- Run this entire file once in the Supabase SQL editor on a fresh project.
-- It is safe to re-run (uses IF NOT EXISTS / OR REPLACE / DROP ... IF EXISTS).
-- =====================================================================

create extension if not exists "pgcrypto";

-- =====================================================================
-- 1. ENUMS
-- =====================================================================

do $$ begin
  create type user_role as enum ('customer', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum (
    'pending', 'confirmed', 'processing', 'packed',
    'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type discount_type as enum ('percentage', 'fixed');
exception when duplicate_object then null; end $$;

-- =====================================================================
-- 2. CORE TABLES
-- =====================================================================

-- ---- profiles ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  role user_role not null default 'customer',
  is_disabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---- categories ---------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  parent_id uuid references public.categories(id) on delete set null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_categories_parent on public.categories(parent_id);
create index if not exists idx_categories_slug on public.categories(slug);

-- ---- products ---------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  short_description text,
  category_id uuid references public.categories(id) on delete set null,
  brand text,
  price numeric(12,2) not null check (price >= 0),
  sale_price numeric(12,2) check (sale_price is null or sale_price >= 0),
  sku text unique,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  reserved_quantity integer not null default 0 check (reserved_quantity >= 0),
  low_stock_threshold integer not null default 5,
  tags text[] not null default '{}',
  specifications jsonb not null default '{}'::jsonb,
  rating_avg numeric(3,2) not null default 0,
  rating_count integer not null default 0,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_published on public.products(is_published);
create index if not exists idx_products_featured on public.products(is_featured);
create index if not exists idx_products_search on public.products
  using gin (to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,'')));

-- ---- product_images ---------------------------------------------------------
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt text,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_product_images_product on public.product_images(product_id);

-- ---- product_variants ---------------------------------------------------------
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_type text not null,        -- e.g. 'Size', 'Color', 'Material'
  variant_value text not null,       -- e.g. 'M', 'Red', 'Cotton'
  price_adjustment numeric(12,2) not null default 0,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  sku text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (product_id, variant_type, variant_value)
);
create index if not exists idx_variants_product on public.product_variants(product_id);

-- ---- addresses ---------------------------------------------------------
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text,
  postal_code text,
  country text not null default 'Pakistan',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_addresses_user on public.addresses(user_id);

-- ---- carts / cart_items ---------------------------------------------------------
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, product_id, variant_id)
);
create index if not exists idx_cart_items_cart on public.cart_items(cart_id);

-- ---- wishlists / wishlist_items ---------------------------------------------------------
create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlists(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (wishlist_id, product_id)
);
create index if not exists idx_wishlist_items_wishlist on public.wishlist_items(wishlist_id);

-- ---- coupons / coupon_usage ---------------------------------------------------------
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type discount_type not null,
  discount_value numeric(12,2) not null check (discount_value >= 0),
  min_order_amount numeric(12,2) not null default 0,
  max_discount_amount numeric(12,2),
  expires_at timestamptz,
  usage_limit integer,
  used_count integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.coupon_usage (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists idx_coupon_usage_user on public.coupon_usage(user_id);

-- ---- orders / order_items / order_status_history ---------------------------------------------------------
create sequence if not exists public.order_number_seq start 1000;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('ORD-' || nextval('public.order_number_seq')::text),
  user_id uuid references auth.users(id) on delete set null,
  status order_status not null default 'pending',
  payment_method text not null default 'cod',
  payment_status payment_status not null default 'pending',
  subtotal numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  shipping_amount numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  coupon_id uuid references public.coupons(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  shipping_address jsonb not null,
  tracking_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created on public.orders(created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_image text,
  variant_info jsonb,
  unit_price numeric(12,2) not null,
  quantity integer not null check (quantity > 0),
  subtotal numeric(12,2) not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_order_items_order on public.order_items(order_id);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status order_status not null,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists idx_status_history_order on public.order_status_history(order_id);

-- ---- reviews ---------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);
create index if not exists idx_reviews_product on public.reviews(product_id);

-- ---- store_settings ---------------------------------------------------------
create table if not exists public.store_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.store_settings (key, value) values
  ('store_info', '{"name":"Meridian","description":"Considered goods, made to last.","contact_email":"hello@meridian.store","phone":"","address":"","logo_url":"","favicon_url":""}'),
  ('shipping', '{"flat_rate":250,"free_shipping_threshold":5000}'),
  ('tax', '{"percentage":0}'),
  ('order', '{"default_status":"pending"}')
on conflict (key) do nothing;

-- =====================================================================
-- 3. HELPER FUNCTIONS
-- =====================================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), 'customer')
  on conflict (id) do nothing;

  insert into public.carts (user_id) values (new.id) on conflict (user_id) do nothing;
  insert into public.wishlists (user_id) values (new.id) on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['profiles','categories','products','addresses','carts','cart_items','orders']
  loop
    execute format(
      'drop trigger if exists trg_set_updated_at on public.%I;
       create trigger trg_set_updated_at before update on public.%I
       for each row execute function public.set_updated_at();', t, t);
  end loop;
end $$;

-- Recompute a product's rating from its approved reviews
create or replace function public.recalc_product_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pid uuid := coalesce(new.product_id, old.product_id);
begin
  update public.products p
  set rating_avg = coalesce((
        select round(avg(rating)::numeric, 2) from public.reviews
        where product_id = pid and is_approved = true
      ), 0),
      rating_count = coalesce((
        select count(*) from public.reviews
        where product_id = pid and is_approved = true
      ), 0)
  where p.id = pid;
  return null;
end;
$$;

drop trigger if exists trg_recalc_rating on public.reviews;
create trigger trg_recalc_rating
  after insert or update or delete on public.reviews
  for each row execute function public.recalc_product_rating();

-- Log a status history row whenever an order's status changes
create or replace function public.log_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.order_status_history (order_id, status, note)
    values (new.id, new.status, 'Order placed');
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    insert into public.order_status_history (order_id, status, note)
    values (new.id, new.status, null);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_order_status_history on public.orders;
create trigger trg_order_status_history
  after insert or update on public.orders
  for each row execute function public.log_order_status_change();

-- Atomically validate + redeem a coupon (call via RPC from the app)
create or replace function public.validate_coupon(p_code text, p_order_amount numeric)
returns public.coupons
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.coupons;
begin
  select * into c from public.coupons where code = upper(p_code) and is_active = true;

  if c is null then
    raise exception 'Invalid coupon code';
  end if;
  if c.expires_at is not null and c.expires_at < now() then
    raise exception 'Coupon has expired';
  end if;
  if c.usage_limit is not null and c.used_count >= c.usage_limit then
    raise exception 'Coupon usage limit reached';
  end if;
  if p_order_amount < c.min_order_amount then
    raise exception 'Order does not meet minimum amount for this coupon';
  end if;

  return c;
end;
$$;

-- Place an order atomically: validates stock, creates the order + items,
-- decrements product stock, and records coupon usage. Runs as SECURITY
-- DEFINER because customers may not write to `products` directly under RLS.
create or replace function public.place_order(
  p_items jsonb,              -- [{product_id, variant_id, quantity, unit_price, product_name, product_image, variant_info}]
  p_shipping jsonb,           -- ShippingAddressSnapshot
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_payment_method text,
  p_shipping_amount numeric,
  p_tax_amount numeric,
  p_coupon_code text default null
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item jsonb;
  v_product public.products;
  v_subtotal numeric := 0;
  v_discount numeric := 0;
  v_total numeric := 0;
  v_coupon public.coupons;
  v_order public.orders;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to place an order';
  end if;

  -- validate stock + compute subtotal
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_product from public.products where id = (v_item->>'product_id')::uuid for update;
    if v_product is null then
      raise exception 'Product not found';
    end if;
    if v_product.stock_quantity < (v_item->>'quantity')::int then
      raise exception 'Insufficient stock for %', v_product.name;
    end if;
    v_subtotal := v_subtotal + (v_item->>'unit_price')::numeric * (v_item->>'quantity')::int;
  end loop;

  -- validate + apply coupon
  if p_coupon_code is not null and length(trim(p_coupon_code)) > 0 then
    v_coupon := public.validate_coupon(p_coupon_code, v_subtotal);
    if v_coupon.discount_type = 'percentage' then
      v_discount := round(v_subtotal * v_coupon.discount_value / 100, 2);
      if v_coupon.max_discount_amount is not null then
        v_discount := least(v_discount, v_coupon.max_discount_amount);
      end if;
    else
      v_discount := least(v_coupon.discount_value, v_subtotal);
    end if;
  end if;

  v_total := v_subtotal - v_discount + coalesce(p_shipping_amount, 0) + coalesce(p_tax_amount, 0);

  insert into public.orders (
    user_id, status, payment_method, payment_status, subtotal, discount_amount,
    shipping_amount, tax_amount, total_amount, coupon_id,
    customer_name, customer_email, customer_phone, shipping_address
  ) values (
    auth.uid(), 'pending', coalesce(p_payment_method, 'cod'), 'pending', v_subtotal, v_discount,
    coalesce(p_shipping_amount, 0), coalesce(p_tax_amount, 0), v_total,
    case when v_coupon is not null then v_coupon.id else null end,
    p_customer_name, p_customer_email, p_customer_phone, p_shipping
  ) returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    insert into public.order_items (
      order_id, product_id, product_name, product_image, variant_info, unit_price, quantity, subtotal
    ) values (
      v_order.id,
      (v_item->>'product_id')::uuid,
      v_item->>'product_name',
      v_item->>'product_image',
      case when v_item ? 'variant_info' then v_item->'variant_info' else null end,
      (v_item->>'unit_price')::numeric,
      (v_item->>'quantity')::int,
      (v_item->>'unit_price')::numeric * (v_item->>'quantity')::int
    );

    update public.products
    set stock_quantity = stock_quantity - (v_item->>'quantity')::int
    where id = (v_item->>'product_id')::uuid;

    if v_item ? 'variant_id' and v_item->>'variant_id' is not null then
      update public.product_variants
      set stock_quantity = greatest(stock_quantity - (v_item->>'quantity')::int, 0)
      where id = (v_item->>'variant_id')::uuid;
    end if;
  end loop;

  if v_coupon is not null then
    update public.coupons set used_count = used_count + 1 where id = v_coupon.id;
    insert into public.coupon_usage (coupon_id, user_id, order_id) values (v_coupon.id, auth.uid(), v_order.id);
  end if;

  -- empty the user's cart after a successful order
  delete from public.cart_items where cart_id = (select id from public.carts where user_id = auth.uid());

  return v_order;
end;
$$;

grant execute on function public.place_order to authenticated;
grant execute on function public.validate_coupon to authenticated;

-- Low-stock products need a column-to-column comparison (stock <= threshold),
-- which PostgREST's query builder can't express directly, so expose it as a view.
create or replace view public.low_stock_products
  with (security_invoker = true) as
  select * from public.products where stock_quantity <= low_stock_threshold;

grant select on public.low_stock_products to authenticated, anon;

-- =====================================================================
-- 4. ROW LEVEL SECURITY
-- =====================================================================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.addresses enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_usage enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.reviews enable row level security;
alter table public.store_settings enable row level security;

-- ---- profiles ----
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- ---- categories ----
drop policy if exists "categories_select_public" on public.categories;
create policy "categories_select_public" on public.categories
  for select using (is_active = true or public.is_admin());

drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- products ----
drop policy if exists "products_select_public" on public.products;
create policy "products_select_public" on public.products
  for select using (is_published = true or public.is_admin());

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- product_images ----
drop policy if exists "product_images_select_public" on public.product_images;
create policy "product_images_select_public" on public.product_images
  for select using (true);

drop policy if exists "product_images_admin_write" on public.product_images;
create policy "product_images_admin_write" on public.product_images
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- product_variants ----
drop policy if exists "product_variants_select_public" on public.product_variants;
create policy "product_variants_select_public" on public.product_variants
  for select using (true);

drop policy if exists "product_variants_admin_write" on public.product_variants;
create policy "product_variants_admin_write" on public.product_variants
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- addresses ----
drop policy if exists "addresses_owner_all" on public.addresses;
create policy "addresses_owner_all" on public.addresses
  for all using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- ---- carts ----
drop policy if exists "carts_owner_all" on public.carts;
create policy "carts_owner_all" on public.carts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---- cart_items ----
drop policy if exists "cart_items_owner_all" on public.cart_items;
create policy "cart_items_owner_all" on public.cart_items
  for all using (
    exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
  );

-- ---- wishlists ----
drop policy if exists "wishlists_owner_all" on public.wishlists;
create policy "wishlists_owner_all" on public.wishlists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---- wishlist_items ----
drop policy if exists "wishlist_items_owner_all" on public.wishlist_items;
create policy "wishlist_items_owner_all" on public.wishlist_items
  for all using (
    exists (select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = auth.uid())
  );

-- ---- coupons ----
drop policy if exists "coupons_select_active_or_admin" on public.coupons;
create policy "coupons_select_active_or_admin" on public.coupons
  for select using (is_active = true or public.is_admin());

drop policy if exists "coupons_admin_write" on public.coupons;
create policy "coupons_admin_write" on public.coupons
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- coupon_usage ----
drop policy if exists "coupon_usage_owner_select" on public.coupon_usage;
create policy "coupon_usage_owner_select" on public.coupon_usage
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "coupon_usage_owner_insert" on public.coupon_usage;
create policy "coupon_usage_owner_insert" on public.coupon_usage
  for insert with check (auth.uid() = user_id);

-- ---- orders ----
drop policy if exists "orders_owner_select" on public.orders;
create policy "orders_owner_select" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "orders_owner_insert" on public.orders;
create policy "orders_owner_insert" on public.orders
  for insert with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update" on public.orders
  for update using (public.is_admin());

-- ---- order_items ----
drop policy if exists "order_items_owner_select" on public.order_items;
create policy "order_items_owner_select" on public.order_items
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
  );

drop policy if exists "order_items_owner_insert" on public.order_items;
create policy "order_items_owner_insert" on public.order_items
  for insert with check (
    exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
  );

-- ---- order_status_history ----
drop policy if exists "order_status_history_select" on public.order_status_history;
create policy "order_status_history_select" on public.order_status_history
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
  );

drop policy if exists "order_status_history_admin_insert" on public.order_status_history;
create policy "order_status_history_admin_insert" on public.order_status_history
  for insert with check (public.is_admin() or exists (
    select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()
  ));

-- ---- reviews ----
drop policy if exists "reviews_select_approved_or_own_or_admin" on public.reviews;
create policy "reviews_select_approved_or_own_or_admin" on public.reviews
  for select using (is_approved = true or auth.uid() = user_id or public.is_admin());

drop policy if exists "reviews_owner_insert" on public.reviews;
create policy "reviews_owner_insert" on public.reviews
  for insert with check (auth.uid() = user_id);

drop policy if exists "reviews_owner_update" on public.reviews;
create policy "reviews_owner_update" on public.reviews
  for update using (auth.uid() = user_id or public.is_admin());

drop policy if exists "reviews_owner_delete" on public.reviews;
create policy "reviews_owner_delete" on public.reviews
  for delete using (auth.uid() = user_id or public.is_admin());

-- ---- store_settings ----
drop policy if exists "store_settings_select_public" on public.store_settings;
create policy "store_settings_select_public" on public.store_settings
  for select using (true);

drop policy if exists "store_settings_admin_write" on public.store_settings;
create policy "store_settings_admin_write" on public.store_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- 5. STORAGE BUCKETS
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('category-images', 'category-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('store-assets', 'store-assets', true)
on conflict (id) do nothing;

drop policy if exists "public_read_product_images" on storage.objects;
create policy "public_read_product_images" on storage.objects
  for select using (bucket_id in ('product-images','category-images','avatars','store-assets'));

drop policy if exists "admin_write_product_images" on storage.objects;
create policy "admin_write_product_images" on storage.objects
  for insert with check (
    bucket_id in ('product-images','category-images','store-assets') and public.is_admin()
  );

drop policy if exists "admin_update_product_images" on storage.objects;
create policy "admin_update_product_images" on storage.objects
  for update using (
    bucket_id in ('product-images','category-images','store-assets') and public.is_admin()
  );

drop policy if exists "admin_delete_product_images" on storage.objects;
create policy "admin_delete_product_images" on storage.objects
  for delete using (
    bucket_id in ('product-images','category-images','store-assets') and public.is_admin()
  );

drop policy if exists "user_manage_own_avatar" on storage.objects;
create policy "user_manage_own_avatar" on storage.objects
  for all using (bucket_id = 'avatars' and owner = auth.uid())
  with check (bucket_id = 'avatars' and owner = auth.uid());

-- =====================================================================
-- 6. MAKE YOURSELF AN ADMIN (run manually after you sign up)
-- =====================================================================
-- 1. Sign up for an account in the app first.
-- 2. Then run this, replacing the email:
--
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'you@example.com');

-- =====================================================================
-- END OF SCHEMA
-- =====================================================================
