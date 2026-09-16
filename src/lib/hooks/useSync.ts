import { useEffect } from "react";
import { sincronizarImagens, sincronizarTrilhas, sincronizarPontos } from "../services/sync";

export function useSync() {
  useEffect(() => {
    async function run() {
      if (!navigator.onLine) return;

      try {
        await sincronizarTrilhas();
        await sincronizarPontos();
        //await sincronizarImagens();
      } catch (err) {
        console.error("Erro na sincronização:", err);
      }
    }

    run();
  }, []);
}

export function syncImages() {
  useEffect(() => {
    async function run() {
      if (!navigator.onLine) return;

      try {
        await sincronizarImagens();
      } 
      catch (err) {
        console.error("Erro na sincronização de imagens:", err);
      }
    } 
    run();
  }, []);
}