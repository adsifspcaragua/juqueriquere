import { useEffect, useState } from "react";
import {
  Navigate,
  Outlet
} from "react-router-dom";

import { supabase } from "../../lib/supabase";

export default function MasterRoute() {
  const [carregando, setCarregando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    verificarMaster();
  }, []);

  async function verificarMaster() {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      setCarregando(false);
      return;
    }

    const { data, error } = await supabase
      .from("usuarios")
      .select("tipo")
      .eq("auth_id", user.id)
      .single();

    if (!error && data?.tipo === "MASTER") {
      setAutorizado(true);
    }

    setCarregando(false);
  }

  if (carregando) {
    return <div>Verificando permissões...</div>;
  }

  if (!autorizado) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}