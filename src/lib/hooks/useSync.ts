import { useEffect } from "react";
import { sincronizarImagens, sincronizarTrilhas, sincronizarPontos } from "../services/sync";

export function useSync() {
  useEffect(() => {
    async function run() {
      if (!navigator.onLine) return;

      try {
        await sincronizarTrilhas();
        await sincronizarPontos();
        await sincronizarImagens();
      } catch (err) {
        console.error("Erro na sincronização:", err);
      }
    }

    run();
  }, []);
}