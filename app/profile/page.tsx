'use client';

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { UserFandomsSection } from "@/components/templates";

// Interface que define a estrutura de uma fandom
interface Fandom {
  id: string;           // ID único da fandom
  name: string;         // Nome da fandom
  description: string;  // Descrição da fandom
  created_at: string;   // Data de criação
  image_url?: string;   // URL da imagem (opcional)
}

/**
 * Página de perfil do usuário
 * 
 * Esta página permite que usuários logados:
 * - Visualizem e editem suas informações de perfil
 * - Gerenciem suas fandoms criadas
 * - Façam upload de avatar
 * - Façam logout da aplicação
 */
export default function ProfilePage() {
  // Estados para gerenciar dados do usuário
  const [user, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  // Estados para gerenciar fandoms do usuário
  const [userFandoms, setUserFandoms] = useState<Fandom[]>([]);
  const [loadingFandoms, setLoadingFandoms] = useState(false);
  
  const router = useRouter();

  // Hook que executa quando o componente é montado
  useEffect(() => {
    // Verifica se o usuário está logado
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        // Se não estiver logado, redireciona para login
        router.push("/auth/login");
        return;
      }
      setUser(user);
      // Carrega dados do perfil se existirem
      loadProfile(user.id);
      // Carrega fandoms do usuário
      loadUserFandoms(user.id);
    });
  }, [router]);

  /**
   * Carrega os dados do perfil do usuário do banco de dados
   * @param userId - ID do usuário logado
   */
  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('nickname, avatar_url')
      .eq('id', userId)
      .single();

    if (data) {
      setNickname(data.nickname || "");
      setAvatarUrl(data.avatar_url || "");
    }
  };

  /**
   * Carrega as fandoms criadas pelo usuário
   * @param userId - ID do usuário logado
   */
  const loadUserFandoms = async (userId: string) => {
    setLoadingFandoms(true);
    try {
      // Busca fandoms onde o usuário é o criador
      const { data, error } = await supabase
        .from('fandoms')
        .select('id, name, description, created_at, image_url')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar fandoms:', error);
        return;
      }

      setUserFandoms(data || []);
    } catch (error) {
      console.error('Erro ao carregar fandoms:', error);
    } finally {
      setLoadingFandoms(false);
    }
  };

  /**
   * Atualiza os dados do perfil do usuário
   * @param e - Evento do formulário
   */
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage("");

    // Atualiza ou cria o perfil usando upsert
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        nickname: nickname,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      });

    if (error) {
      setMessage("Erro ao atualizar perfil: " + error.message);
    } else {
      setMessage("Perfil atualizado com sucesso!");
    }
    setLoading(false);
  };

  /**
   * Faz logout do usuário e redireciona para home
   */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  /**
   * Faz upload de uma nova imagem de avatar
   * @param e - Evento de mudança do input de arquivo
   */
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setLoading(true);
    setMessage("");
    
    try {
      // Gera nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      // Upload da imagem para o storage do Supabase
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Gera URL pública da imagem
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);
      setMessage("Foto atualizada com sucesso!");
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setMessage("Erro ao fazer upload da imagem: " + errorMessage);
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Redireciona para a página de criação de nova fandom
   */
  const handleCreateNewFandom = () => {
    router.push("/create-fandom");
  };

  /**
   * Redireciona para a página de edição de uma fandom específica
   * @param fandomId - ID da fandom a ser editada
   */
  const handleEditFandom = (fandomId: string) => {
    router.push(`/fandom/${fandomId}/edit`);
  };

  /**
   * Exclui uma fandom após confirmação do usuário
   * @param fandomId - ID da fandom a ser excluída
   */
  const handleDeleteFandom = async (fandomId: string) => {
    // Confirmação antes de excluir
    if (!confirm("Tem certeza que deseja excluir esta fandom? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      // Exclui a fandom do banco de dados
      const { error } = await supabase
        .from('fandoms')
        .delete()
        .eq('id', fandomId)
        .eq('creator_id', user?.id); // Garante que só o criador pode excluir

      if (error) {
        console.error('Erro ao excluir fandom:', error);
        setMessage("Erro ao excluir fandom: " + error.message);
        return;
      }

      // Remove a fandom da lista local
      setUserFandoms(prev => prev.filter(f => f.id !== fandomId));
      setMessage("Fandom excluída com sucesso!");
    } catch (error) {
      console.error('Erro ao excluir fandom:', error);
      setMessage("Erro ao excluir fandom");
    }
  };

  // Mostra loading enquanto verifica autenticação
  if (!user) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      {/* Botão de navegação para voltar à home */}
      <div className="mb-4">
        <Link href="/" className="inline-flex items-center text-[#926DF6] hover:text-[#A98AF8] transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar para Home
        </Link>
      </div>

      {/* Layout em grid responsivo */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Seção do Perfil - Coluna esquerda */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Meu Perfil</h1>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {/* Seção de Avatar com upload */}
            <div className="text-center">
              <div className="relative inline-block">
                <Image
                  src={avatarUrl || `https://ui-avatars.com/api/?name=${user.email}&size=100&background=926DF6&color=fff`}
                  alt="Avatar"
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-[#926DF6]"
                />
                {/* Botão de upload de avatar */}
                <label className="absolute bottom-0 right-0 bg-[#926DF6] text-white p-2 rounded-full cursor-pointer hover:bg-[#A98AF8] transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Campo de email (somente leitura) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                value={user.email || ""}
                disabled
                className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-500"
              />
            </div>

            {/* Campo de nickname (editável) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nickname</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Digite seu nickname"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
              />
            </div>

            {/* Mensagem de feedback para o usuário */}
            {message && (
              <div className={`p-3 rounded ${message.includes('Erro') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {message}
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#926DF6] text-white py-2 px-4 rounded hover:bg-[#A98AF8] transition-colors disabled:opacity-50"
              >
                {loading ? "Salvando..." : "Salvar Perfil"}
              </button>
              
              <button
                type="button"
                onClick={handleLogout}
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </form>
        </div>

        {/* Seção de Fandoms - Ocupa toda a largura */}
        <div className="lg:col-span-2">
          <UserFandomsSection
            fandoms={userFandoms}
            isLoading={loadingFandoms}
            onCreateNewFandom={handleCreateNewFandom}
            onEditFandom={handleEditFandom}
            onDeleteFandom={handleDeleteFandom}
          />
        </div>
      </div>
    </div>
  );
} 