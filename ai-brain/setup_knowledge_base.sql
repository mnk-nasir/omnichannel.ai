-- Enable the pgvector extension to store AI embeddings
create extension if not exists vector with schema public;

-- Table to track documents and website crawls
create table if not exists public.knowledge_sources (
    id uuid default gen_random_uuid() primary key,
    business_id uuid not null,
    source_type text not null, -- 'file' or 'web'
    source_name text not null,
    source_url text,           
    status text not null default 'queued', -- 'queued', 'processing', 'completed', 'error'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table to store the mathematical chunks (vectors) of the text
create table if not exists public.knowledge_nodes (
    id uuid default gen_random_uuid() primary key,
    business_id uuid not null,
    source_id uuid references public.knowledge_sources(id) on delete cascade not null,
    content text not null,
    chunk_index integer not null,
    embedding vector(1536), -- text-embedding-3-small generates 1536-dimensional vectors
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create the storage bucket for PDFs if it doesn't exist
insert into storage.buckets (id, name, public) 
values ('knowledge-base', 'knowledge-base', true)
on conflict (id) do nothing;

-- Ensure RLS is disabled for these tables so the backend can freely insert/read
alter table public.knowledge_sources disable row level security;
alter table public.knowledge_nodes disable row level security;
