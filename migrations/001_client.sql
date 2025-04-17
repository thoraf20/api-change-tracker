-- Create clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  name TEXT NOT NULL,
  webhook TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  client_id UUID REFERENCES clients (id),
  url TEXT NOT NULL,
  method TEXT NOT NULL,
  body JSONB,
  headers JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);