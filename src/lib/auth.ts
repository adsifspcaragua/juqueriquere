import { createClient } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export interface LoggedUserProfile {
  id: number;
  auth_id: string;
  name: string;
  login: string;
  tipo: "MASTER" | "ADMIN";
  foto_url?: string | null;
}

export async function signUpWithoutLogin(email: string, password: string) {
  const tempSupabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );

  return await tempSupabase.auth.signUp({ email, password });
}

export async function signUp(email: string, password: string) {
  return await supabase.auth.signUp({ email, password });
}

export async function login(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function logout() {
  await supabase.auth.signOut();
}

export async function getUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getCurrentUserProfile(): Promise<LoggedUserProfile | null> {
  const authUser = await getUser();

  if (!authUser) return null;

  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("auth_id", authUser.id)
    .single();

  if (error || !data) {
    console.error("[auth.getCurrentUserProfile] Erro ao buscar perfil:", error);
    return null;
  }

  return data as LoggedUserProfile;
}