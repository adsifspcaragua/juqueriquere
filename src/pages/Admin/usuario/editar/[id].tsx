import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import SimpleButton from "../../../../components/ui/buttons/SimpleButton";
import "../../../_styles/admin.css";
import ProtectedRoute from "../../../../components/Protected";
import { useParams } from "react-router-dom";

interface Usuario {
    id: number;
    name: string;
    login: string;
    tipo: "MASTER" | "ADMIN";
    criado_em?: string;
}

export default function EditarUsuario() {
    const { id } = useParams<{ id: string }>();

    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    
    // Controle de permissão
    const [hasPermission, setHasPermission] = useState<boolean>(false);
    const [loggedUserTipo, setLoggedUserTipo] = useState<"MASTER" | "ADMIN" | null>(null);

    // Estados do formulário
    const [name, setName] = useState("");
    const [login, setLogin] = useState("");
    const [tipo, setTipo] = useState<"MASTER" | "ADMIN">("ADMIN");

    useEffect(() => {
        carregarDadosEChecarPermissao();
    }, [id]);

    async function carregarDadosEChecarPermissao() {
        if (!id) {
            setLoading(false);
            setHasPermission(false);
            return;
        }

        setLoading(true);
        setHasPermission(false);
        setUsuario(null);

        try {
            // 1. Valida a sessão de autenticação ativa no Supabase
            const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
            
            if (authError || !authUser) {
                setHasPermission(false);
                return;
            }

            // 2. Busca o perfil do usuário logado via 'auth_id' de forma segura
            const { data: usuarioLogado, error: userError } = await supabase
                .from("usuarios")
                .select("id, tipo")
                .eq("auth_id", authUser.id)
                .single();

            if (userError || !usuarioLogado) {
                setHasPermission(false);
                return;
            }

            setLoggedUserTipo(usuarioLogado.tipo);

            // 3. Validação de Autorização:
            // - MASTER possui acesso total a qualquer ID.
            // - ADMIN só pode editar se o ID do parâmetro for o seu próprio ID.
            const isMaster = usuarioLogado.tipo === "MASTER";
            const isOwnProfile = usuarioLogado.id.toString() === id;

            if (!isMaster && !isOwnProfile) {
                setHasPermission(false);
                return; // Bloqueia a execução antes de consultar dados do usuário alvo
            }

            // Autorização confirmada
            setHasPermission(true);

            // 4. Busca os dados do usuário alvo apenas após autorização
            const { data: targetUser, error: targetError } = await supabase
                .from("usuarios")
                .select("id, name, login, tipo, criado_em")
                .eq("id", id)
                .single();

            if (targetError || !targetUser) {
                console.error("Erro ao carregar dados do usuário:", targetError);
                setUsuario(null);
                return;
            }

            setUsuario(targetUser);
            setName(targetUser.name || "");
            setLogin(targetUser.login || "");
            setTipo(targetUser.tipo || "ADMIN");

        } catch (err) {
            console.error("Erro de validação:", err);
            setHasPermission(false);
        } finally {
            setLoading(false);
        }
    }

    async function handleSalvar() {
        if (!id || !hasPermission) return;

        setIsSaving(true);
        setMessage(null);

        try {
            // Prepara a carga de atualização limitando campos por nível de acesso
            const payload: { name: string; login: string; tipo?: "MASTER" | "ADMIN" } = {
                name,
                login,
            };

            // Apenas permissão MASTER pode alterar a propriedade 'tipo'
            if (loggedUserTipo === "MASTER" && tipo) {
                payload.tipo = tipo;
            }

            const { error } = await supabase
                .from("usuarios")
                .update(payload)
                .eq("id", id);

            if (error) throw error;

            setMessage({ type: "success", text: "Usuário atualizado com sucesso!" });
            
            setUsuario(prev => prev ? { ...prev, name, login, tipo: payload.tipo || prev.tipo } : prev);
        } catch (err) {
            console.error("Erro ao atualizar usuário:", err);
            setMessage({ type: "error", text: "Erro ao atualizar os dados. Tente novamente." });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <ProtectedRoute>
            <div className="paddingHeader"></div>
            <section className="conteudo vertical gap30">
                
                {loading ? (
                    <>
                        <SimpleButton type="back" icon="setaBack" path="/admin/usuario/list">
                            Voltar para Usuários
                        </SimpleButton>
                        <p>Verificando permissões...</p>
                    </>
                ) : !hasPermission ? (
                    <div className="vertical gap15">
                        <SimpleButton type="back" icon="setaBack" path="/admin/usuario/list">
                            Voltar para Usuários
                        </SimpleButton>
                        <div className="card vertical gap5">
                            <h2 style={{ color: "red" }}>Acesso Negado</h2>
                            <p>Você não possui privilégios para acessar ou editar este usuário.</p>
                        </div>
                    </div>
                ) : !usuario ? (
                    <div className="vertical gap15">
                        <SimpleButton type="back" icon="setaBack" path="/admin/usuario/list">
                            Voltar para Usuários
                        </SimpleButton>
                        <p>Usuário não encontrado.</p>
                    </div>
                ) : (
                    <>
                        <div className="vertical gap15">
                            <SimpleButton type="back" icon="setaBack" path={`/admin/usuario/${usuario.id}`}>
                                Voltar para {usuario.name}
                            </SimpleButton>
                            <div className="vertical gap5">
                                <h1>Editar usuário: {usuario.name}</h1>
                                <p>Gerencie as informações da conta de forma simples e segura.</p>
                            </div>
                        </div>

                        <div className="linhaPontilhadaLight" />

                        {/* Foto de Perfil */}
                        <div className="card vertical gap15">
                            <h3>Foto de perfil</h3>
                            <div className="horizontal gap15">
                                <img src="#" alt="Foto do usuário" className="userImg" />
                                <div className="vertical gap5">
                                    <SimpleButton tema="dark" raio="10">Carregar imagem</SimpleButton>
                                    <SimpleButton tema="red" raio="10">Remover imagem</SimpleButton>
                                </div>
                            </div>
                        </div>

                        {/* Dados do Usuário */}
                        <div className="card vertical gap15">
                            <h3>Dados de Acesso</h3>
                            
                            <div className="vertical gap5">
                                <label>Nome</label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    placeholder="Digite o nome do usuário"
                                />
                            </div>

                            <div className="vertical gap5">
                                <label>E-mail (Login)</label>
                                <input 
                                    type="email" 
                                    value={login} 
                                    onChange={(e) => setLogin(e.target.value)} 
                                    placeholder="usuario@email.com"
                                />
                            </div>

                            <div className="vertical gap5">
                                <label>Nível de Permissão</label>
                                <select 
                                    value={tipo} 
                                    onChange={(e) => setTipo(e.target.value as "MASTER" | "ADMIN")}
                                    disabled={loggedUserTipo !== "MASTER"}
                                >
                                    <option value="ADMIN">Administrador (ADMIN)</option>
                                    <option value="MASTER">Master (MASTER)</option>
                                </select>
                                {loggedUserTipo !== "MASTER" && (
                                    <small style={{ color: "gray" }}>
                                        Apenas usuários com perfil Master podem alterar níveis de permissão.
                                    </small>
                                )}
                            </div>

                            {message && (
                                <p style={{ color: message.type === "error" ? "red" : "green" }}>
                                    {message.text}
                                </p>
                            )}

                            <div className="horizontal gap15">
                                <div 
                                    onClick={handleSalvar} 
                                    style={{ 
                                        pointerEvents: isSaving ? "none" : "auto", 
                                        opacity: isSaving ? 0.7 : 1 
                                    }}
                                >
                                    <SimpleButton tema="dark" raio="10">
                                        {isSaving ? "Salvando..." : "Salvar Alterações"}
                                    </SimpleButton>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </section>
        </ProtectedRoute>
    );
}