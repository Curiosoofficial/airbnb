-- Einmalig ausführen, NACH dem Anlegen der Tabellen (`npm run db:push`).
-- Wo: Supabase-Dashboard → SQL Editor, oder bei der Vercel-Integration
-- unter Storage → <Datenbank> → Query.

-- 1) Öffentlicher Bucket für die Inserat-Bilder (max. 4 MB, nur Bilder).
--    Lesen braucht keine Regel, weil der Bucket öffentlich ist.
--    Hochladen macht die App nur auf dem Server mit dem Service-Key
--    (SUPABASE_SERVICE_ROLE_KEY). Der umgeht Row Level Security, darum braucht
--    es keine Upload-Regel für anonyme Nutzer.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('images', 'images', true, 4194304, array['image/*'])
on conflict (id) do nothing;

-- 2) Row Level Security für die Prisma-Tabellen einschalten.
--    Prisma verbindet sich als Tabellen-Besitzer und ist davon nicht betroffen.
--    Aber über die automatische Supabase-REST-API kann so niemand mehr mit
--    dem öffentlichen anon key Daten lesen oder ändern.
alter table "User" enable row level security;
alter table "Home" enable row level security;
alter table "Favorite" enable row level security;
