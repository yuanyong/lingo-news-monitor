-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "vector";

-- Webset table
create table "public"."webset" (
    "id" uuid default uuid_generate_v4() primary key,
    "webset_id" text unique not null,
    "name" text not null,
    "data" jsonb,
    "created_at" timestamp with time zone default timezone('utc'::text, now()) not null,
    "updated_at" timestamp with time zone default timezone('utc'::text, now()) not null
);

-- WebsetItem table
create table "public"."webset_item" (
    "id" uuid default uuid_generate_v4() primary key,
    "item_id" text unique not null,
    "webset_id" text not null references "public"."webset"("webset_id") on delete cascade,
    "url" text unique not null,
    "title" text,
    "description" text,
    "content" text,
    "author" text,
    "published_at" timestamp with time zone,
    "enrichments" jsonb,
    "evaluations" jsonb,
    "created_at" timestamp with time zone default timezone('utc'::text, now()) not null,
    "updated_at" timestamp with time zone default timezone('utc'::text, now()) not null,
    "image_url" text,
    "favicon_url" text,
    "embedding" vector(1536)
);

-- Indexes for better query performance
create index "webset_webset_id_idx" on "public"."webset"("webset_id");
create index "webset_item_webset_id_idx" on "public"."webset_item"("webset_id");
create index "webset_item_url_idx" on "public"."webset_item"("url");
create index "webset_item_published_at_idx" on "public"."webset_item"("published_at");

-- Updated at trigger function
create or replace function "public"."handle_updated_at"()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Add updated_at triggers
create trigger "set_webset_updated_at"
    before update on "public"."webset"
    for each row
    execute function "public"."handle_updated_at"();

create trigger "set_webset_item_updated_at"
    before update on "public"."webset_item"
    for each row
    execute function "public"."handle_updated_at"();

-- RLS (Row Level Security) Policies
alter table "public"."webset" enable row level security;
alter table "public"."webset_item" enable row level security;

-- Default policies (modify these according to your authentication requirements)
create policy "Enable read access for all users" on "public"."webset"
    for select
    to authenticated
    using (true);

create policy "Enable read access for all users" on "public"."webset_item"
    for select
    to authenticated
    using (true);

-- Comments
comment on table "public"."webset" is 'Stores webset information';
comment on table "public"."webset_item" is 'Stores individual items within websets';
