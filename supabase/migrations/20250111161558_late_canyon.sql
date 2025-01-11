
-- playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  description text,
  thumbnail_url text,
  item_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- playlist_items table
CREATE TABLE IF NOT EXISTS playlist_items (
  id text PRIMARY KEY,
  playlist_id text REFERENCES playlists ON DELETE CASCADE NOT NULL,
  video_id text NOT NULL,
  title text NOT NULL,
  description text,
  thumbnail_url text,
  position integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
