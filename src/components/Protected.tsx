import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [logado, setLogado] = useState(false);

  useEffect(() => {
    async function verificar() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setLogado(!!session);
      setLoading(false);
    }

    verificar();
  }, []);

  if (loading) return <p>Carregando...</p>;

  if (!logado) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}