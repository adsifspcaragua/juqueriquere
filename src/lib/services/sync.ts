import { supabase } from "../supabase";
import { db } from "../dexie";

export async function sincronizarTrilhas() {
  const { data, error } = await supabase
    .from("trilhas")
    .select("*");


  if (error) throw error;

  await db.trilhas.clear();

  await db.trilhas.bulkPut(data ?? []);

}

export async function sincronizarPontos() {
  const { data, error } = await supabase
    .from("pontos_interesse")
    .select("*");

  if (error) {
    throw error;
  }

  await db.pontos_interesse.clear();

  if (data) {
    await db.pontos_interesse.bulkPut(data);
  }
}