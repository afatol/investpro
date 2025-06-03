-- a) Remova o trigger que popula profiles automaticamente:
DROP TRIGGER IF EXISTS trigger_auth_insert_profile ON profiles;

-- b) Remova (caso queira) a função padrão, se ela existir:
DROP FUNCTION IF EXISTS public.handle_new_user;

-- c) Crie a sua própria função e trigger para “after insert” em auth.users:
CREATE OR REPLACE FUNCTION public.insert_profile_on_user_signup()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone_number, referral_code, created_at)
  VALUES (
    NEW.id,
    NEW.user_metadata->>'name',
    NEW.email,
    NEW.user_metadata->>'phone_number',
    NEW.user_metadata->>'referral_code',
    NOW()
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.insert_profile_on_user_signup();
