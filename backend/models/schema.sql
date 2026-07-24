create type user_role as enum ('tenant', 'owner', 'admin');
create type listing_status as enum ('pending', 'approved', 'rejected', 'rented');
create type report_status as enum ('pending', 'reviewed', 'dismissed');

create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password_hash text not null,
  mobile text,
  role user_role not null default 'tenant',
  is_suspended boolean default false,
  created_at timestamp default now()
);

create table properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references users(id) on delete cascade,
  title text not null,
  property_type text,
  bhk text,
  rent numeric not null,
  deposit numeric,
  maintenance numeric,
  area text,
  address text,
  pincode text,
  latitude float,
  longitude float,
  description text,
  amenities text[],
  parking boolean default false,
  furnishing text,
  tenant_pref text,       -- family/bachelor/students
  pets_allowed boolean default false,
  available_date date,
  status listing_status default 'pending',
  views integer default 0,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  image_url text not null,
  is_primary boolean default false
);

create table favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  property_id uuid references properties(id) on delete cascade,
  created_at timestamp default now(),
  unique(user_id, property_id)
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  reported_by uuid references users(id),
  reason text,
  status report_status default 'pending',
  created_at timestamp default now()
);

-- Fast GPS radius search
create index idx_properties_lat_lng on properties (latitude, longitude);