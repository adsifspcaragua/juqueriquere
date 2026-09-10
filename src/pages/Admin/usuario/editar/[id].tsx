import { useEffect, useState, useRef } from "react";
import SimpleButton from "../../../../components/ui/buttons/SimpleButton";
import ImageCropperModal from "../../../../components/ui/ImageCropperModal";
import "../../../_styles/admin.css";
import ProtectedRoute from "../../../../components/Protected";
import { useParams } from "react-router-dom";
import { getCurrentUserProfile } from "../../../../lib/auth";
import { getById, updateById } from "../../../../lib/services/crud";
import { processImageUpdate } from "../../../../lib/services/storage";

interface Usuario {
    id: number;
    name: string;
    login: string;
    tipo: "MASTER" | "ADMIN";
    foto_url?: string | null;
    criado_em?: string;
}

export default function EditarUsuario() {
    const { id } = useParams<{ id: string }>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const [hasPermission, setHasPermission] = useState<boolean>(false);
    const [loggedUserTipo, setLoggedUserTipo] = useState<"MASTER" | "ADMIN" | null>(null);

    const [name, setName] = useState("");
    const [login, setLogin] = useState("");
    const [tipo, setTipo] = useState<"MASTER" | "ADMIN">("ADMIN");

    const [previewFotoUrl, setPreviewFotoUrl] = useState<string | null>(null);
    const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);
    const [pendingAction, setPendingAction] = useState<"none" | "upload" | "remove">("none");

    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);

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
            
            const usuarioLogado = await getCurrentUserProfile();

            if (!usuarioLogado) {
                setHasPermission(false);
                return;
            }

            setLoggedUserTipo(usuarioLogado.tipo);

            const isMaster = usuarioLogado.tipo === "MASTER";
            const isOwnProfile = usuarioLogado.id.toString() === id;

            if (!isMaster && !isOwnProfile) {
                setHasPermission(false);
                return;
            }

            setHasPermission(true);

            const targetUser = await getById<Usuario>("usuarios", id);

            if (!targetUser) {
                setUsuario(null);
                return;
            }

            setUsuario(targetUser);
            setName(targetUser.name || "");
            setLogin(targetUser.login || "");
            setTipo(targetUser.tipo || "ADMIN");
            setPreviewFotoUrl(targetUser.foto_url || null);
        } catch (err) {
            console.error("Erro ao carregar dados do usuário:", err);
            setHasPermission(false);
        } finally {
            setLoading(false);
        }
    }

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setCropImageSrc(reader.result as string);
            setIsCropModalOpen(true);
        };
        reader.readAsDataURL(file);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    function handleCropComplete(croppedBlob: Blob) {
        setIsCropModalOpen(false);
        setCropImageSrc(null);

        setPendingBlob(croppedBlob);
        setPreviewFotoUrl(URL.createObjectURL(croppedBlob));
        setPendingAction("upload");
    }

    function handleRemoveImage() {
        setPendingBlob(null);
        setPreviewFotoUrl(null);
        setPendingAction("remove");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    async function handleSalvar() {
        if (!id || !hasPermission) return;

        setIsSaving(true);
        setMessage(null);

        try {
            // Processa upload/remoção no Storage usando o serviço genérico
            const finalFotoUrl = await processImageUpdate({
                action: pendingAction,
                currentUrl: usuario?.foto_url,
                newBlob: pendingBlob,
                folderPath: `usuarios/${id}`,
            });

            // Monta o payload de atualização
            const payload: Partial<Usuario> = {
                name,
                login,
                foto_url: finalFotoUrl,
            };

            if (loggedUserTipo === "MASTER" && tipo) {
                payload.tipo = tipo;
            }

            // Atualiza no banco de dados via serviço genérico de CRUD
            const updatedUser = await updateById<Usuario>("usuarios", id, payload);

            if (!updatedUser) {
                throw new Error("Erro ao atualizar o cadastro do usuário.");
            }

            setUsuario(updatedUser);
            setPendingAction("none");
            setPendingBlob(null);

            setMessage({ type: "success", text: "Usuário atualizado com sucesso!" });
        } catch (err) {
            console.error("Erro ao salvar:", err);
            setMessage({ type: "error", text: "Erro ao salvar as alterações. Tente novamente." });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <ProtectedRoute>
            <div className="paddingHeader"></div>
            <section className="conteudo vertical gap30">
                {loading ? (
                    <p>Verificando permissões...</p>
                ) : !hasPermission ? (
                    <p>Acesso negado.</p>
                ) : !usuario ? (
                    <p>Usuário não encontrado.</p>
                ) : (
                    <>
                        <div className="vertical gap15">
                            <SimpleButton type="back" icon="setaBack" path={`/admin/usuario/${usuario.id}`}>
                                Voltar para {usuario.name}
                            </SimpleButton>
                            <h1>Editar usuário: {usuario.name}</h1>
                        </div>

                        <div className="card vertical gap15">
                            <h3>Foto de perfil</h3>
                            <div className="horizontal gap15">
                                <img
                                    src={previewFotoUrl || "/assets/images/default-avatar.png"}
                                    alt="Foto do usuário"
                                    className="userImg"
                                />
                                <div className="vertical gap5">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        style={{ display: "none" }}
                                    />
                                    <div onClick={() => fileInputRef.current?.click()}>
                                        <SimpleButton tema="dark" raio="10">
                                            Carregar imagem
                                        </SimpleButton>
                                    </div>
                                    {previewFotoUrl && (
                                        <div onClick={handleRemoveImage}>
                                            <SimpleButton tema="red" raio="10">
                                                Remover imagem
                                            </SimpleButton>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="card vertical gap15">
                            <div className="vertical gap5">
                                <label>Nome</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>

                            <div className="vertical gap5">
                                <label>E-mail</label>
                                <input type="email" value={login} onChange={(e) => setLogin(e.target.value)} />
                            </div>

                            <div className="vertical gap5">
                                <label>Permissão</label>
                                <select
                                    value={tipo}
                                    onChange={(e) => setTipo(e.target.value as "MASTER" | "ADMIN")}
                                    disabled={loggedUserTipo !== "MASTER"}
                                >
                                    <option value="ADMIN">ADMIN</option>
                                    <option value="MASTER">MASTER</option>
                                </select>
                            </div>

                            {message && <p style={{ color: message.type === "error" ? "red" : "green" }}>{message.text}</p>}

                            <div onClick={handleSalvar}>
                                <SimpleButton tema="dark" raio="10">
                                    {isSaving ? "Salvando..." : "Salvar Alterações"}
                                </SimpleButton>
                            </div>
                        </div>
                    </>
                )}
            </section>

            {isCropModalOpen && cropImageSrc && (
                <ImageCropperModal
                    imageSrc={cropImageSrc}
                    title="Ajustar Foto de Perfil"
                    aspectRatio="circle"
                    onCropComplete={handleCropComplete}
                    onCancel={() => {
                        setIsCropModalOpen(false);
                        setCropImageSrc(null);
                    }}
                />
            )}
        </ProtectedRoute>
    );
}