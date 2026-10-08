-- Setup admin user with hashed password
-- Password: InnoTechHub@2o26
-- Hash: $2b$10$mI71eV9RKv4vxPmgj0V.5uWp6HoORqbLaHssH/d1yAduW29LUVL9C

INSERT INTO admin_users (email, password_hash, created_at, updated_at)
VALUES (
  'innotechhub.edu@gmail.com',
  '$2b$10$mI71eV9RKv4vxPmgj0V.5uWp6HoORqbLaHssH/d1yAduW29LUVL9C',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;
