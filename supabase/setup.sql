-- Einmalig im Supabase SQL Editor ausführen, NACH `npm run db:push`
-- (die Tabellen "User", "Home" und "Favorite" müssen schon existieren).

-- 1) Öffentlicher Bucket für die Inserat-Bilder (max. 4 MB, nur Bilder)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('images', 'images', true, 4194304, array['image/*'])
on conflict (id) do nothing;

-- 2) Upload erlauben. Die App lädt serverseitig mit dem anon/publishable key hoch.
--    Ohne diese Policy blockiert Row Level Security jeden Upload.
--    Lesen braucht keine Policy, weil der Bucket öffentlich ist.
create policy "Bilder hochladen erlaubt"
on storage.objects for insert
to anon
with check (bucket_id = 'images');

-- 3) Row Level Security für die Prisma-Tabellen einschalten.
--    Prisma verbindet sich als Tabellen-Besitzer und ist davon nicht betroffen.
--    Aber über die automatische Supabase-REST-API kann so niemand mehr mit
--    dem anon key Daten lesen oder ändern.
alter table "User" enable row level security;
alter table "Home" enable row level security;
alter table "Favorite" enable row level security;
