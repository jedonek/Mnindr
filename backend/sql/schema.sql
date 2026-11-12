CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS users (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text NOT NULL UNIQUE, password_hash text NOT NULL,
 first_name text NOT NULL, last_name text NOT NULL, newsletter boolean NOT NULL DEFAULT false,
 nickname text NOT NULL, age int NOT NULL CHECK(age BETWEEN 1 AND 120), gender text NOT NULL CHECK(gender IN ('kocour','kocka')),
 phone text NOT NULL DEFAULT '', residence text NOT NULL DEFAULT '', photo text, photo_bg text NOT NULL DEFAULT '#FFE08A',
 bio text NOT NULL DEFAULT '', sports jsonb NOT NULL DEFAULT '[]', colors jsonb NOT NULL DEFAULT '[]',
 dream_date text NOT NULL DEFAULT '', verified boolean NOT NULL DEFAULT false, prefs jsonb NOT NULL DEFAULT '{}',
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sessions (token_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at timestamptz NOT NULL);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);
CREATE TABLE IF NOT EXISTS password_resets (user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, code_hash text NOT NULL, expires_at timestamptz NOT NULL, attempts int NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS swipes (user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, target_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, action text NOT NULL CHECK(action IN ('like','dislike','superlike')), created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,target_id), CHECK(user_id<>target_id));
CREATE TABLE IF NOT EXISTS matches (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_a uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, user_b uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_a,user_b), CHECK(user_a<user_b));
CREATE TABLE IF NOT EXISTS messages (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE, from_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, text text NOT NULL CHECK(length(text) BETWEEN 1 AND 2000), created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS messages_match_idx ON messages(match_id,created_at);
CREATE TABLE IF NOT EXISTS typing_activity (
 match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(match_id,user_id)
);
CREATE TABLE IF NOT EXISTS blocks (user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, target_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,target_id), CHECK(user_id<>target_id));
CREATE TABLE IF NOT EXISTS reports (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), reporter_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, target_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, reason text NOT NULL CHECK(reason IN ('spam','obtezovani','falesny-profil','nevhodny-obsah','jine')), created_at timestamptz NOT NULL DEFAULT now(), CHECK(reporter_id<>target_id));
