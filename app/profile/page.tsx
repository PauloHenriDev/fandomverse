'use client';

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { UserFandomsSection } from "@/components/templates";
import Header from "@/components/ui/Header";

// Interface que define a estrutura de uma fandom
interface Fandom {
  id: string;           // ID único da fandom
  name: string;         // Nome da fandom
  description: string;  // Descrição da fandom
  created_at: string;   // Data de criação
  image_url?: string;   // URL da imagem (opcional)
}

// Interface para as configurações de perfil
interface ProfileSettings {
  headerColor: string;
  headerImage?: string;
  backgroundColor: string;
  aboutBackgroundColor: string;
  textColor: string;
  about: string;
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
  
  // Estados para o modal de edição
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>({
    headerColor: "#f97316", // orange-500
    backgroundColor: "#ffffff",
    aboutBackgroundColor: "#ef4444", // red-500
    textColor: "#000000",
    about: ""
  });
  
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
    try {
      // Primeiro, tenta carregar o nickname do metadata do usuário
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser?.user_metadata?.nickname) {
        setNickname(currentUser.user_metadata.nickname);
      }

      // Tenta carregar dados do perfil do banco de dados
      const { data, error } = await supabase
        .from('profiles')
        .select('nickname, avatar_url, profile_settings')
        .eq('id', userId)
        .single();

      if (error) {
        console.log('Perfil não encontrado ou tabela não existe:', error.message);
        // Se não encontrar o perfil, usa os dados do usuário atual
        return;
      }

      if (data) {
        // Só atualiza o nickname se não tiver sido carregado do metadata
        if (!nickname && data.nickname) {
          setNickname(data.nickname);
        }
        setAvatarUrl(data.avatar_url || "");
        
        // Carrega configurações de perfil se existirem
        if (data.profile_settings) {
          setProfileSettings(prev => ({
            ...prev,
            ...data.profile_settings
          }));
        }
      }
    } catch (error) {
      console.log('Erro ao carregar perfil:', error);
      // Se houver erro, pelo menos tenta carregar o nickname do metadata
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser?.user_metadata?.nickname) {
        setNickname(currentUser.user_metadata.nickname);
      }
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
   */
  const handleUpdateProfile = async () => {
    if (!user) return;

    setLoading(true);
    setMessage("");

    try {
      // Primeiro, verifica se a tabela profiles existe e tem a estrutura correta
      const { data: tableExists } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (!tableExists) {
        // Se a tabela não existe, cria um perfil básico primeiro
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            nickname: nickname,
            avatar_url: avatarUrl,
            profile_settings: profileSettings
          });

        if (insertError) {
          throw insertError;
        }
      } else {
        // Se a tabela existe, faz o upsert
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            nickname: nickname,
            avatar_url: avatarUrl,
            profile_settings: profileSettings,
            updated_at: new Date().toISOString()
          });

        if (error) {
          throw error;
        }
      }

      setMessage("Perfil atualizado com sucesso!");
      setShowEditModal(false);
    } catch (error: unknown) {
      console.error('Erro ao atualizar perfil:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setMessage("Erro ao atualizar perfil: " + errorMessage);
    } finally {
      setLoading(false);
    }
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
   * Faz upload de uma imagem para o cabeçalho
   * @param e - Evento de mudança do input de arquivo
   */
  const handleHeaderImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      // Gera nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `header-${user.id}-${Date.now()}.${fileExt}`;
      
      // Tenta fazer upload para o bucket 'headers', se não existir, usa 'avatars'
      let uploadResult;
      try {
        uploadResult = await supabase.storage
          .from('headers')
          .upload(fileName, file);
      } catch (bucketError) {
        console.log('Bucket headers não existe, usando avatars:', bucketError);
        // Se o bucket headers não existir, usa o bucket avatars
        uploadResult = await supabase.storage
          .from('avatars')
          .upload(fileName, file);
      }

      if (uploadResult.error) {
        throw uploadResult.error;
      }

      // Gera URL pública da imagem
      const { data: { publicUrl } } = supabase.storage
        .from('avatars') // Sempre usa avatars para gerar a URL
        .getPublicUrl(fileName);

      setProfileSettings(prev => ({
        ...prev,
        headerImage: publicUrl
      }));
      
      setMessage("Imagem do cabeçalho atualizada com sucesso!");
      
    } catch (error: unknown) {
      console.error("Header upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setMessage("Erro ao fazer upload da imagem do cabeçalho: " + errorMessage);
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
    <div className="" style={{ backgroundColor: profileSettings.backgroundColor }}>
      <Header />
      {/* Botão de navegação para voltar à home */}
      <div className="">
        <Link href="/" className="inline-flex items-center text-[#926DF6] hover:text-[#A98AF8] transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar para Home
        </Link>
      </div>

      {/* Cabeçalho de Perfil */}
      <div 
        className="h-[300px] relative"
        style={{ 
          backgroundColor: profileSettings.headerColor,
          backgroundImage: profileSettings.headerImage ? `url(${profileSettings.headerImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Imagem de Perfil, Nome e Botão */}
        <div className="flex justify-between pl-[100px] pr-[100px]">
          {/* Imagem de Perfil e Nome*/}
          <div className="flex mt-[150px]">
            {/* Imagem de Perfil */}
            <div className="relative">
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

            {/* Nome */}
            <div className="ml-[30px]">
              <p className="text-[40px] font-bold" style={{ color: profileSettings.textColor }}>
                {nickname || "Apelido"}
              </p>
            </div>
          </div>
          {/* Botão */}
          <div className="mt-[240px]">
            <button 
              onClick={() => setShowEditModal(true)}
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-[#A98AF8] transition-colors"
            >
              Editar Perfil
            </button>
          </div>
        </div>
      </div>

      {/* Seção de Fandoms */}
      <div className="flex pl-[100px] pr-[100px] gap-[20px] pb-[10px] border-b border-gray-300 mt-[10px]">
        <div className="flex flex-col items-center">
          <p className="text-[30px] font-bold" style={{ color: profileSettings.textColor }}>
            {userFandoms.length}
          </p>
          <p className="text-[18px]" style={{ color: profileSettings.textColor }}>Fandoms</p>
        </div>
        <div className="flex flex-col items-center blur-sm">
          <p className="text-[30px] font-bold">X</p>
          <p className="text-[18px]">Publicações</p>
        </div>
        <div className="flex flex-col items-center blur-sm">
          <p className="text-[30px] font-bold">X</p>
          <p className="text-[18px]">Seguidores</p>
        </div>
        <div className="flex flex-col items-center blur-sm">
          <p className="text-[30px] font-bold">X</p>
          <p className="text-[18px]">Seguindo</p>
        </div>
        <div className="flex flex-col items-center blur-sm">
          <p className="text-[30px] font-bold">X</p>
          <p className="text-[18px]">Amigos</p>
        </div>
        <div className="flex flex-col items-center blur-sm">
          <p className="text-[30px] font-bold">X</p>
          <p className="text-[18px]">Conquistas</p>
        </div>
      </div>

      {/* Seção de Buttons */}
      <div className="flex gap-[10px] pl-[100px] pr-[100px] pt-[25px] pb-[10px] border-b border-gray-300">
        <button className="text-[20px]" style={{ color: profileSettings.textColor }}>Visão Geral</button>
        <button className="text-[20px]" style={{ color: profileSettings.textColor }}>Fandoms</button>
        <button className="text-[20px]" style={{ color: profileSettings.textColor }}>Publicações</button>
        <button className="text-[20px]" style={{ color: profileSettings.textColor }}>Seguidores</button>
        <button className="text-[20px]" style={{ color: profileSettings.textColor }}>Seguindo</button>
        <button className="text-[20px]" style={{ color: profileSettings.textColor }}>Amigos</button>
        <button className="text-[20px]" style={{ color: profileSettings.textColor }}>Conquistas</button>
      </div>

      {/* Seção de Visão Geral */}
      <main className="pl-[100px] pr-[100px]">
        <div className="mt-[20px] flex">
          {/* Seção da Esquerda */}
          <div className="flex flex-col gap-[20px]">
            {/* Seção do Sobre */}
            <div 
              className="flex flex-col w-[350px] min-h-[250px] p-[20px] rounded-[10px]"
              style={{ backgroundColor: profileSettings.aboutBackgroundColor }}
            >
              <p className="text-[30px] font-bold" style={{ color: profileSettings.textColor }}>Sobre</p>
              <p className="text-[16px]" style={{ color: profileSettings.textColor }}>
                {profileSettings.about || "Adicione uma descrição sobre você..."}
              </p>
            </div>
            {/* Seção de Suas Fandoms */}
            <div className="flex flex-col bg-red-500 w-[350px] min-h-[250px] p-[20px] rounded-[10px] blur-sm">
              <p>Suas Fandoms</p>
            </div>
            {/* Seção de Amigos */}
            <div className="flex flex-col bg-red-500 w-[350px] min-h-[250px] p-[20px] rounded-[10px]">
              <p>Amigos</p>
            </div>
          </div>
          {/* Seção da Direita */}
          <div>
            {/* Seção 1 */}
            <div className="flex">
              <div>
                <p>Nível de Fã</p>
              </div>
              <div>
                <p>Atividade</p>
              </div>
            </div>
            {/* Seção 2 */}
            <div>
              <p>Publicações</p>
            </div>
            {/* Seção 3 */}
            <div>
              <p>Fandoms Populares</p>
            </div>
          </div>
        </div>
      </main>

      {/* Layout em grid responsivo */}
      <div className="">
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

      {/* Modal de Edição de Perfil */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[500px] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Editar Perfil</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Nickname */}
              <div>
                <label className="block text-sm font-medium mb-2">Apelido</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Digite seu apelido"
                />
              </div>

              {/* Sobre */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Sobre ({profileSettings.about.length}/500 caracteres)
                </label>
                <textarea
                  value={profileSettings.about}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setProfileSettings(prev => ({ ...prev, about: e.target.value }));
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded h-24 resize-none"
                  placeholder="Conte um pouco sobre você..."
                  maxLength={500}
                />
              </div>

              {/* Cor do Cabeçalho */}
              <div>
                <label className="block text-sm font-medium mb-2">Cor do Cabeçalho</label>
                <input
                  type="color"
                  value={profileSettings.headerColor}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, headerColor: e.target.value }))}
                  className="w-full h-10 border border-gray-300 rounded"
                />
              </div>

              {/* Imagem do Cabeçalho */}
              <div>
                <label className="block text-sm font-medium mb-2">Imagem do Cabeçalho</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleHeaderImageUpload}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              {/* Cor de Fundo do Perfil */}
              <div>
                <label className="block text-sm font-medium mb-2">Cor de Fundo do Perfil</label>
                <input
                  type="color"
                  value={profileSettings.backgroundColor}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  className="w-full h-10 border border-gray-300 rounded"
                />
              </div>

              {/* Cor de Fundo do Sobre */}
              <div>
                <label className="block text-sm font-medium mb-2">Cor de Fundo do Sobre</label>
                <input
                  type="color"
                  value={profileSettings.aboutBackgroundColor}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, aboutBackgroundColor: e.target.value }))}
                  className="w-full h-10 border border-gray-300 rounded"
                />
              </div>

              {/* Cor do Texto */}
              <div>
                <label className="block text-sm font-medium mb-2">Cor do Texto</label>
                <input
                  type="color"
                  value={profileSettings.textColor}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, textColor: e.target.value }))}
                  className="w-full h-10 border border-gray-300 rounded"
                />
              </div>

              {/* Mensagem de feedback */}
              {message && (
                <div className={`p-2 rounded ${message.includes('sucesso') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {message}
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 