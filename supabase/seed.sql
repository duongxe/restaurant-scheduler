-- ================================================================
-- Seed: insert all 21 employees (auth + employees table)
-- Run in Supabase SQL Editor AFTER schema.sql has been applied.
-- Default password for all employees: 1
-- ================================================================

DO $$
DECLARE
  v_id UUID;
BEGIN

  -- Nick: waiter + kitchen, level 2
  v_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', 'nick@sushirevolution.internal', crypt('1', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES ('nick@sushirevolution.internal', v_id, v_id, format('{"sub":"%s","email":"nick@sushirevolution.internal"}', v_id)::jsonb, 'email', NOW(), NOW(), NOW());
  INSERT INTO employees (id, name, username, role, roles, level) VALUES (v_id, 'Nick', 'nick', 'waiter', ARRAY['waiter','kitchen'], 2);

  -- Chloe: waiter, level 1
  v_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', 'chloe@sushirevolution.internal', crypt('1', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES ('chloe@sushirevolution.internal', v_id, v_id, format('{"sub":"%s","email":"chloe@sushirevolution.internal"}', v_id)::jsonb, 'email', NOW(), NOW(), NOW());
  INSERT INTO employees (id, name, username, role, roles, level) VALUES (v_id, 'Chloe', 'chloe', 'waiter', ARRAY['waiter'], 1);

  -- Dahami: waiter, level 1
  v_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', 'dahami@sushirevolution.internal', crypt('1', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES ('dahami@sushirevolution.internal', v_id, v_id, format('{"sub":"%s","email":"dahami@sushirevolution.internal"}', v_id)::jsonb, 'email', NOW(), NOW(), NOW());
  INSERT INTO employees (id, name, username, role, roles, level) VALUES (v_id, 'Dahami', 'dahami', 'waiter', ARRAY['waiter'], 1);

  -- Kyra: waiter + sushi maker, level 2
  v_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', 'kyra@sushirevolution.internal', crypt('1', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES ('kyra@sushirevolution.internal', v_id, v_id, format('{"sub":"%s","email":"kyra@sushirevolution.internal"}', v_id)::jsonb, 'email', NOW(), NOW(), NOW());
  INSERT INTO employees (id, name, username, role, roles, level) VALUES (v_id, 'Kyra', 'kyra', 'waiter', ARRAY['waiter','sushi maker'], 2);

  -- Nam: waiter, level 1
  v_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', 'nam@sushirevolution.internal', crypt('1', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES ('nam@sushirevolution.internal', v_id, v_id, format('{"sub":"%s","email":"nam@sushirevolution.internal"}', v_id)::jsonb, 'email', NOW(), NOW(), NOW());
  INSERT INTO employees (id, name, username, role, roles, level) VALUES (v_id, 'Nam', 'nam', 'waiter', ARRAY['waiter'], 1);

  -- Tai: waiter, level 1
  v_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', 'tai@sushirevolution.internal', crypt('1', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES ('tai@sushirevolution.internal', v_id, v_id, format('{"sub":"%s","email":"tai@sushirevolution.internal"}', v_id)::jsonb, 'email', NOW(), NOW(), NOW());
  INSERT INTO employees (id, name, username, role, roles, level) VALUES (v_id, 'Tai', 'tai', 'waiter', ARRAY['waiter'], 1);

  -- Tasha: waiter, level 1
  v_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', 'tasha@sushirevolution.internal', crypt('1', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES ('tasha@sushirevolution.internal', v_id, v_id, format('{"sub":"%s","email":"tasha@sushirevolution.internal"}', v_id)::jsonb, 'email', NOW(), NOW(), NOW());
  INSERT INTO employees (id, name, username, role, roles, level) VALUES (v_id, 'Tasha', 'tasha', 'waiter', ARRAY['waiter'], 1);

  -- Chang: sushi maker, level 3
  v_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', 'chang@sushirevolution.internal', crypt('1', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES ('chang@sushirevolution.internal', v_id, v_id, format('{"sub":"%s","email":"chang@sushirevolution.internal"}', v_id)::jsonb, 'email', NOW(), NOW(), NOW());
  INSERT INTO employees (id, name, username, role, roles, level) VALUES (v_id, 'Chang', 'chang', 'sushi maker', ARRAY['sushi maker'], 3);

  -- Luna 1: sushi maker, level 2
  v_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', 'luna1@sushirevolution.internal', crypt('1', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES ('luna1@sushirevolution.internal', v_id, v_id, format('{"sub":"%s","email":"luna1@sushirevolution.internal"}', v_id)::jsonb, 'email', NOW(), NOW(), NOW());
  INSERT INTO employees (id, name, username, role, roles, level) VALUES (v_id, 'Luna 1', 'luna1', 'sushi maker', ARRAY['sushi maker'], 2);

  -- Luna 2: sushi maker, level 2
  v_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', 'luna2@sushirevolution.internal', crypt('1', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES ('luna2@sushirevolution.internal', v_id, v_id, format('{"sub":"%s","email":"luna2@sushirevolution.internal"}', v_id)::jsonb, 'email', NOW(), NOW(), NOW());
  INSERT INTO employees (id, name, username, role, roles, level) VALUES (v_id, 'Luna 2', 'luna2', 'sushi maker', ARRAY['sushi maker'], 2);

  -- Irenee: sushi maker, level 2
  v_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', 'irenee@sushirevolution.internal', crypt('1', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES ('irenee@sushirevolution.internal', v_id, v_id, format('{"sub":"%s","email":"irenee@sushirevolution.internal"}', v_id)::jsonb, 'email', NOW(), NOW(), NOW());
  INSERT INTO employees (id, name, username, role, roles, level) VALUES (v_id, 'Irenee', 'irenee', 'sushi maker', ARRAY['sushi maker'], 2);

  -- Minh: sushi maker, level 3
  v_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', 'minh@sushirevolution.internal', crypt('1', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES ('minh@sushirevolution.internal', v_id, v_id, format('{"sub":"%s","email":"minh@sushirevolution.internal"}', v_id)::jsonb, 'email', NOW(), NOW(), NOW());
  INSERT INTO employees (id, name, username, role, roles, level) VALUES (v_id, 'Minh', 'minh', 'sushi maker', ARRAY['sushi maker'], 3);

  -- Winnie: sushi maker, level 2
  v_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', 'winnie@sushirevolution.internal', crypt('1', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES ('winnie@sushirevolution.internal', v_id, v_id, format('{"sub":"%s","email":"winnie@sushirevolution.internal"}', v_id)::jsonb, 'email', NOW(), NOW(), NOW());
  INSERT INTO employees (id, name, username, role, roles, level) VALUES (v_id, 'Winnie', 'winnie', 'sushi maker', ARRAY['sushi maker'], 2);

  -- Lydia: sushi maker, level 2
  v_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', 'lydia@sushirevolution.internal', crypt('1', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES ('lydia@sushirevolution.internal', v_id, v_id, format('{"sub":"%s","email":"lydia@sushirevolution.internal"}', v_id)::jsonb, 'email', NOW(), NOW(), NOW());
  INSERT INTO employees (id, name, username, role, roles, level) VALUES (v_id, 'Lydia', 'lydia', 'sushi maker', ARRAY['sushi maker'], 2);

  -- Yuki: sushi maker, level 3
  v_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', 'yuki@sushirevolution.internal', crypt('1', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES ('yuki@sushirevolution.internal', v_id, v_id, format('{"sub":"%s","email":"yuki@sushirevolution.internal"}', v_id)::jsonb, 'email', NOW(), NOW(), NOW());
  INSERT INTO employees (id, name, username, role, roles, level) VALUES (v_id, 'Yuki', 'yuki', 'sushi maker', ARRAY['sushi maker'], 3);

  -- Wanice: sushi maker, level 2
  v_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', 'wanice@sushirevolution.internal', crypt('1', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES ('wanice@sushirevolution.internal', v_id, v_id, format('{"sub":"%s","email":"wanice@sushirevolution.internal"}', v_id)::jsonb, 'email', NOW(), NOW(), NOW());
  INSERT INTO employees (id, name, username, role, roles, level) VALUES (v_id, 'Wanice', 'wanice', 'sushi maker', ARRAY['sushi maker'], 2);

  -- Zoe: sushi maker, level 2
  v_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', 'zoe@sushirevolution.internal', crypt('1', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES ('zoe@sushirevolution.internal', v_id, v_id, format('{"sub":"%s","email":"zoe@sushirevolution.internal"}', v_id)::jsonb, 'email', NOW(), NOW(), NOW());
  INSERT INTO employees (id, name, username, role, roles, level) VALUES (v_id, 'Zoe', 'zoe', 'sushi maker', ARRAY['sushi maker'], 2);

  -- David: kitchen, level 2
  v_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', 'david@sushirevolution.internal', crypt('1', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES ('david@sushirevolution.internal', v_id, v_id, format('{"sub":"%s","email":"david@sushirevolution.internal"}', v_id)::jsonb, 'email', NOW(), NOW(), NOW());
  INSERT INTO employees (id, name, username, role, roles, level) VALUES (v_id, 'David', 'david', 'kitchen', ARRAY['kitchen'], 2);

  -- Max: kitchen, level 1
  v_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', 'max@sushirevolution.internal', crypt('1', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES ('max@sushirevolution.internal', v_id, v_id, format('{"sub":"%s","email":"max@sushirevolution.internal"}', v_id)::jsonb, 'email', NOW(), NOW(), NOW());
  INSERT INTO employees (id, name, username, role, roles, level) VALUES (v_id, 'Max', 'max', 'kitchen', ARRAY['kitchen'], 1);

  -- Asher: kitchen, level 1
  v_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', 'asher@sushirevolution.internal', crypt('1', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES ('asher@sushirevolution.internal', v_id, v_id, format('{"sub":"%s","email":"asher@sushirevolution.internal"}', v_id)::jsonb, 'email', NOW(), NOW(), NOW());
  INSERT INTO employees (id, name, username, role, roles, level) VALUES (v_id, 'Asher', 'asher', 'kitchen', ARRAY['kitchen'], 1);

  -- Mishka: kitchen, level 2
  v_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', 'mishka@sushirevolution.internal', crypt('1', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES ('mishka@sushirevolution.internal', v_id, v_id, format('{"sub":"%s","email":"mishka@sushirevolution.internal"}', v_id)::jsonb, 'email', NOW(), NOW(), NOW());
  INSERT INTO employees (id, name, username, role, roles, level) VALUES (v_id, 'Mishka', 'mishka', 'kitchen', ARRAY['kitchen'], 2);

END $$;
