import { supabase } from "./supabase";

export interface LoggedUserProfile {
  id: number;
  auth_id: string;
  name: string;
  login: string;
  tipo: "MASTER" | "ADMIN";
  foto_url?: string | null;
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

/**
 * Retorna os dados completos do usuário logado diretamente da tabela 'usuarios'.
 */
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