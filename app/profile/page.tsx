'use client';

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UserFandomsSection } from "@/components/templates";
import Header from "@/components/ui/Header";
import Link from "next/link";

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
  backgroundImage?: string;
  aboutBackgroundColor: string;
  textColor: string;
  nicknameColor: string;
  aboutTitleColor: string;
  aboutTextColor: string;
  buttonBackgroundColor: string;
  buttonTextColor: string;
  buttonHoverBackgroundColor: string;
  buttonHoverTextColor: string;
  buttonHasBackground: boolean;
  about: string;
}

// Tipo para as seções disponíveis
type ActiveSection = 'visao-geral' | 'fandoms' | 'publicacoes' | 'seguindo' | 'configuracoes';

// | 'amigos' | 'conquistas'

interface FandomDB {
  id: string;
  name?: string;
}
interface PageDB {
  id: string;
  fandom_id: string;
}
interface SectionDB {
  id: string;
  fandom_page_id: string;
  section_title?: string;
}
interface ItemDB {
  id: string;
  section_id: string;
  item_title: string;
  item_description?: string;
  item_image_url?: string;
  created_at?: string;
  sectionTitle?: string;
  fandomId?: string;
  fandomName?: string;
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
  // Estado para fandoms seguidas
  const [followedFandoms, setFollowedFandoms] = useState<Fandom[]>([]);
  const [loadingFollowed, setLoadingFollowed] = useState(false);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [userPosts, setUserPosts] = useState<ItemDB[]>([]);
  const [loadingUserPosts, setLoadingUserPosts] = useState(false);
  
  // Estados para o modal de edição
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>({
    headerColor: "#f97316", // orange-500
    backgroundColor: "#ffffff",
    aboutBackgroundColor: "#ef4444", // red-500
    textColor: "#000000",
    nicknameColor: "#000000",
    aboutTitleColor: "#000000",
    aboutTextColor: "#000000",
    buttonBackgroundColor: "#ffffff",
    buttonTextColor: "#000000",
    buttonHoverBackgroundColor: "#f3f4f6",
    buttonHoverTextColor: "#000000",
    buttonHasBackground: true,
    about: ""
  });
  
  // Estado para controlar qual seção está ativa
  const [activeSection, setActiveSection] = useState<ActiveSection>('visao-geral');
  
  // Cores padrão para reset
  const defaultColors: ProfileSettings = {
    headerColor: "#f97316", // orange-500
    backgroundColor: "#ffffff",
    aboutBackgroundColor: "#ef4444", // red-500
    textColor: "#000000",
    nicknameColor: "#000000",
    aboutTitleColor: "#000000",
    aboutTextColor: "#000000",
    buttonBackgroundColor: "#ffffff",
    buttonTextColor: "#000000",
    buttonHoverBackgroundColor: "#f3f4f6",
    buttonHoverTextColor: "#000000",
    buttonHasBackground: true,
    about: ""
  };

  const router = useRouter();

  // Função de carregar perfil precisa vir antes do useEffect!
  const loadProfile = useCallback(async (userId: string) => {
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
  }, [nickname]);

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
  }, [router, loadProfile]);

  useEffect(() => {
    if (user) {
      loadFollowedFandoms(user.id);
      loadFollowersCount(user.id);
      loadFollowingCount(user.id);
      loadTotalPosts(user.id);
      loadUserPosts(user.id);
    }
  }, [router, user]);

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
   * Carrega as fandoms seguidas pelo usuário
   */
  const loadFollowedFandoms = async (userId: string) => {
    setLoadingFollowed(true);
    try {
      // Busca os fandom_ids que o usuário segue
      const { data: follows, error: followsError } = await supabase
        .from('fandom_followers')
        .select('fandom_id')
        .eq('user_id', userId);
      if (followsError) {
        setFollowedFandoms([]);
        return;
      }
      const fandomIds = follows.map((f: { fandom_id: string }) => f.fandom_id);
      if (fandomIds.length === 0) {
        setFollowedFandoms([]);
        return;
      }
      // Busca os dados das fandoms seguidas
      const { data: fandomsData, error: fandomsError } = await supabase
        .from('fandoms')
        .select('*')
        .in('id', fandomIds);
      if (fandomsError) {
        setFollowedFandoms([]);
        return;
      }
      setFollowedFandoms(fandomsData || []);
    } finally {
      setLoadingFollowed(false);
    }
  };

  /**
   * Carrega o número de seguidores do usuário (quantas pessoas seguem as fandoms dele)
   */
  const loadFollowersCount = async (userId: string) => {
    // Busca todas as fandoms criadas pelo usuário
    const { data: fandoms, error: fandomsError } = await supabase
      .from('fandoms')
      .select('id')
      .eq('creator_id', userId);
    if (fandomsError || !fandoms || fandoms.length === 0) {
      setFollowersCount(0);
      return;
    }
    const fandomIds = fandoms.map((f: { id: string }) => f.id);
    // Conta quantos seguidores todas as fandoms do usuário têm
    const { count } = await supabase
      .from('fandom_followers')
      .select('id', { count: 'exact', head: true })
      .in('fandom_id', fandomIds);
    setFollowersCount(count || 0);
  };

  /**
   * Carrega o número de fandoms que o usuário está seguindo
   */
  const loadFollowingCount = async (userId: string) => {
    const { count } = await supabase
      .from('fandom_followers')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    setFollowingCount(count || 0);
  };

  /**
   * Carrega o número total de posts (itens) de todas as fandoms do usuário
   */
  const loadTotalPosts = async (userId: string) => {
    // Busca todas as fandoms criadas pelo usuário
    const { data: fandoms, error: fandomsError } = await supabase
      .from('fandoms')
      .select('id')
      .eq('creator_id', userId);
    if (fandomsError || !fandoms || fandoms.length === 0) {
      setTotalPosts(0);
      return;
    }
    const fandomIds = fandoms.map((f: { id: string }) => f.id);
    // Busca todas as páginas dessas fandoms
    const { data: pages, error: pagesError } = await supabase
      .from('fandom_pages')
      .select('id, fandom_id')
      .in('fandom_id', fandomIds);
    if (pagesError || !pages || pages.length === 0) {
      setTotalPosts(0);
      return;
    }
    const pageIds = pages.map((p: { id: string }) => p.id);
    // Busca todas as seções dessas páginas
    const { data: sections, error: sectionsError } = await supabase
      .from('fandom_sections')
      .select('id, fandom_page_id')
      .in('fandom_page_id', pageIds);
    if (sectionsError || !sections || sections.length === 0) {
      setTotalPosts(0);
      return;
    }
    const sectionIds = sections.map((s: { id: string }) => s.id);
    // Conta todos os itens (posts) dessas seções
    const { count } = await supabase
      .from('section_items')
      .select('id', { count: 'exact', head: true })
      .in('section_id', sectionIds)
      .eq('is_active', true);
    setTotalPosts(count || 0);
  };

  /**
   * Carrega todos os posts (itens) das fandoms do usuário
   */
  const loadUserPosts = async (userId: string) => {
    setLoadingUserPosts(true);
    try {
      // Busca todas as fandoms criadas pelo usuário
      const { data: fandoms, error: fandomsError } = await supabase
        .from('fandoms')
        .select('id, name')
        .eq('creator_id', userId);
      if (fandomsError || !fandoms || fandoms.length === 0) {
        setUserPosts([]);
        return;
      }
      const fandomIds = (fandoms as FandomDB[]).map((f) => f.id);
      // Busca todas as páginas dessas fandoms
      const { data: pages, error: pagesError } = await supabase
        .from('fandom_pages')
        .select('id, fandom_id')
        .in('fandom_id', fandomIds);
      if (pagesError || !pages || pages.length === 0) {
        setUserPosts([]);
        return;
      }
      const pageIds = (pages as PageDB[]).map((p) => p.id);
      // Busca todas as seções dessas páginas
      const { data: sections, error: sectionsError } = await supabase
        .from('fandom_sections')
        .select('id, fandom_page_id, section_title')
        .in('fandom_page_id', pageIds);
      if (sectionsError || !sections || sections.length === 0) {
        setUserPosts([]);
        return;
      }
      const sectionIds = (sections as SectionDB[]).map((s) => s.id);
      // Busca todos os itens (posts) dessas seções
      const { data: items, error: itemsError } = await supabase
        .from('section_items')
        .select('*')
        .in('section_id', sectionIds)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (itemsError || !items) {
        setUserPosts([]);
        return;
      }
      // Enriquecer cada item com o nome da seção e da fandom
      const sectionMap = Object.fromEntries((sections as SectionDB[]).map((s) => [s.id, s]));
      const pageMap = Object.fromEntries((pages as PageDB[]).map((p) => [p.id, p]));
      const fandomMap = Object.fromEntries((fandoms as FandomDB[]).map((f) => [f.id, f]));
      const enrichedItems = (items as ItemDB[]).map((item) => {
        const section = sectionMap[item.section_id] as SectionDB | undefined;
        const page = section ? (pageMap[section.fandom_page_id] as PageDB | undefined) : undefined;
        const fandom = page ? (fandomMap[page.fandom_id] as FandomDB | undefined) : undefined;
        return {
          ...item,
          sectionTitle: section ? section.section_title : '',
          fandomId: fandom ? fandom.id : '',
          fandomName: fandom ? fandom.name : '',
        };
      });
      setUserPosts(enrichedItems);
    } finally {
      setLoadingUserPosts(false);
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
   * Faz upload de uma imagem de fundo para o perfil
   * @param e - Evento de mudança do input de arquivo
   */
  const handleBackgroundImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      // Gera nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `background-${user.id}-${Date.now()}.${fileExt}`;
      
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

      setProfileSettings(prev => ({
        ...prev,
        backgroundImage: publicUrl
      }));
      
      setMessage("Imagem de fundo atualizada com sucesso!");
      
    } catch (error: unknown) {
      console.error("Background upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setMessage("Erro ao fazer upload da imagem de fundo: " + errorMessage);
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
   * Reseta as cores para os valores padrão
   */
  const handleResetColors = () => {
    setProfileSettings(prev => ({
      ...prev,
      headerColor: defaultColors.headerColor,
      backgroundColor: defaultColors.backgroundColor,
      aboutBackgroundColor: defaultColors.aboutBackgroundColor,
      textColor: defaultColors.textColor,
      nicknameColor: defaultColors.nicknameColor,
      aboutTitleColor: defaultColors.aboutTitleColor,
      aboutTextColor: defaultColors.aboutTextColor,
      buttonBackgroundColor: defaultColors.buttonBackgroundColor,
      buttonTextColor: defaultColors.buttonTextColor,
      buttonHoverBackgroundColor: defaultColors.buttonHoverBackgroundColor,
      buttonHoverTextColor: defaultColors.buttonHoverTextColor,
      buttonHasBackground: defaultColors.buttonHasBackground,
      backgroundImage: undefined,
      headerImage: undefined
    }));
    setMessage("Cores e imagens resetadas para o padrão!");
  };

  /**
   * Muda a seção ativa do perfil
   * @param section - Seção para ativar
   */
  const handleSectionChange = (section: ActiveSection) => {
    setActiveSection(section);
  };

  /**
   * Faz logout do usuário e redireciona para a home page
   */
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/"); // Redireciona para a home page
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      setMessage("Erro ao fazer logout");
    }
  };

  /**
   * Renderiza o conteúdo da seção Visão Geral
   */
  const renderVisaoGeral = () => (
    <div className="mt-[20px] flex flex-col lg:flex-row gap-6">
      {/* Seção da Esquerda */}
      <div className="flex flex-col gap-[20px] w-full lg:w-auto">
        {/* Seção do Sobre */}
        <div 
          className="flex flex-col w-full lg:w-[350px] min-h-[200px] lg:min-h-[250px] p-[20px] rounded-[10px]"
          style={{ backgroundColor: profileSettings.aboutBackgroundColor }}
        >
          <p className="text-[24px] sm:text-[28px] lg:text-[30px] font-bold" style={{ color: profileSettings.aboutTitleColor }}>Sobre</p>
          <p 
            className="text-[14px] sm:text-[15px] lg:text-[16px] whitespace-pre-wrap" 
            style={{ color: profileSettings.aboutTextColor }}
          >
            {profileSettings.about || "Adicione uma descrição sobre você..."}
          </p>
        </div>
        {/* Seção de Suas Fandoms */}
        {/* <div className="flex flex-col bg-red-500 w-full lg:w-[350px] min-h-[200px] lg:min-h-[250px] p-[20px] rounded-[10px]">
          <p>Suas Fandoms</p>
        </div> */}
        {/* Seção de Amigos */}
        {/* <div className="flex flex-col bg-red-500 w-full lg:w-[350px] min-h-[200px] lg:min-h-[250px] p-[20px] rounded-[10px]">
          <p>Amigos</p>
        </div> */}
      </div>
      {/* Seção da Direita */}
      {/* <div className="w-full lg:w-auto lg:flex-1">
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <p className="text-lg font-semibold">Nível de Fã</p>
          </div>
          <div className="flex-1">
            <p className="text-lg font-semibold">Atividade</p>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-lg font-semibold">Publicações</p>
        </div>
        
        <div>
          <p className="text-lg font-semibold">Fandoms Populares</p>
        </div>
      </div> */}
    </div>
  );

  /**
   * Renderiza o conteúdo da seção Fandoms
   */
  const renderFandoms = () => (
    <div className="mt-[20px]">
      <UserFandomsSection
        fandoms={userFandoms}
        isLoading={loadingFandoms}
        onCreateNewFandom={handleCreateNewFandom}
        onEditFandom={handleEditFandom}
        onDeleteFandom={handleDeleteFandom}
      />
    </div>
  );

  /**
   * Renderiza o conteúdo da seção Publicações
   */
  const renderPublicacoes = () => (
    <div className="mt-[20px]">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Publicações</h2>
        {loadingUserPosts ? (
          <p className="text-gray-600">Carregando publicações...</p>
        ) : userPosts.length === 0 ? (
          <>
            <p className="text-gray-600">Nenhuma publicação encontrada.</p>
            <p className="text-sm text-gray-500 mt-2">As publicações aparecerão aqui quando você criar conteúdo.</p>
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {userPosts.map((item) => (
              <div key={item.id} className="bg-[#F3F4F6] rounded-lg p-4 flex flex-col items-center">
                {item.item_image_url && (
                  <Image src={item.item_image_url} alt={item.item_title} width={300} height={128} className="w-full h-32 object-cover rounded mb-2" unoptimized />
                )}
                <p className="text-lg font-bold text-[#5047E5] mb-1">{item.item_title}</p>
                <p className="text-sm text-gray-700 text-center mb-1">
                  {item.item_description && item.item_description.length > 100 ? item.item_description.substring(0, 100) + '...' : item.item_description}
                </p>
                <p className="text-xs text-gray-500 mb-1">Seção: {item.sectionTitle}</p>
                <p className="text-xs text-gray-500 mb-2">Fandom: {item.fandomName}</p>
                <a href={`/fandom/${item.fandomId}`} className="text-xs text-[#5047E5] hover:underline">Ver Fandom</a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /**
   * Renderiza o conteúdo da seção Seguidores
   */
  // const renderSeguidores = () => (
  //   <div className="mt-[20px]">
  //     <div className="bg-white p-6 rounded-lg shadow">
  //       <h2 className="text-2xl font-bold mb-4">Seguidores</h2>
  //       <p className="text-gray-600">Nenhum seguidor encontrado.</p>
  //       <p className="text-sm text-gray-500 mt-2">Quando pessoas seguirem você, elas aparecerão aqui.</p>
  //     </div>
  //   </div>
  // );

  /**
   * Renderiza o conteúdo da seção Seguindo
   */
  const renderSeguindo = () => (
    <div className="mt-[20px]">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Seguindo</h2>
        {loadingFollowed ? (
          <p className="text-gray-600">Carregando fandoms seguidas...</p>
        ) : followedFandoms.length === 0 ? (
          <>
            <p className="text-gray-600">Você não está seguindo nenhuma fandom ainda.</p>
            <p className="text-sm text-gray-500 mt-2">Quando você seguir fandoms, elas aparecerão aqui.</p>
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {followedFandoms.map(fandom => (
              <div key={fandom.id} className="mb-4">
                <div className="bg-[#8D6FF5] rounded-lg p-4 flex flex-col items-center">
                  <p className="text-lg font-bold text-white mb-2">{fandom.name}</p>
                  <p className="text-sm text-[#DBD1FC] text-center mb-2">
                    {fandom.description.length > 100 ? fandom.description.substring(0, 100) + '...' : fandom.description}
                  </p>
                  <Link href={`/fandom/${fandom.id}`} className="mt-2">
                    <button className="bg-[#A28BF7] hover:bg-[#AE9AF8] rounded-[5px] p-[8px] w-[100px] text-white transition-all duration-200">
                      Explorar
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /**
   * Renderiza o conteúdo da seção Amigos
   */
  // const renderAmigos = () => (
  //   <div className="mt-[20px]">
  //     <div className="bg-white p-6 rounded-lg shadow">
  //       <h2 className="text-2xl font-bold mb-4">Amigos</h2>
  //       <p className="text-gray-600">Nenhum amigo encontrado.</p>
  //       <p className="text-sm text-gray-500 mt-2">Quando você adicionar amigos, eles aparecerão aqui.</p>
  //     </div>
  //   </div>
  // );

  /**
   * Renderiza o conteúdo da seção Conquistas
   */
  // const renderConquistas = () => (
  //   <div className="mt-[20px]">
  //     <div className="bg-white p-6 rounded-lg shadow">
  //       <h2 className="text-2xl font-bold mb-4">Conquistas</h2>
  //       <p className="text-gray-600">Nenhuma conquista desbloqueada ainda.</p>
  //       <p className="text-sm text-gray-500 mt-2">Continue participando para desbloquear conquistas!</p>
  //     </div>
  //   </div>
  // );

  /**
   * Renderiza o conteúdo da seção Configurações
   */
  const renderConfiguracoes = () => (
    <div className="mt-[20px]">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Configurações</h2>
        <p className="text-gray-600 mb-6">Gerencie suas configurações de perfil e conta.</p>
        
        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold mb-2">Perfil</h3>
            <p className="text-gray-600 mb-3">Personalize seu perfil, cores e informações.</p>
            <button 
              onClick={() => setShowEditModal(true)}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
              Editar Perfil
            </button>
          </div>
          
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold mb-2">Conta</h3>
            <p className="text-gray-600 mb-3">Gerencie sua conta e sessão.</p>
            <button 
              onClick={handleLogout}
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
            >
              Fazer Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  /**
   * Renderiza o conteúdo baseado na seção ativa
   */
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'visao-geral':
        return renderVisaoGeral();
      case 'fandoms':
        return renderFandoms();
      case 'publicacoes':
        return renderPublicacoes();
      // case 'seguidores':
      //   return renderSeguidores();
      case 'seguindo':
        return renderSeguindo();
      // case 'amigos':
      //   return renderAmigos();
      // case 'conquistas':
      //   return renderConquistas();
      case 'configuracoes':
        return renderConfiguracoes();
      default:
        return renderVisaoGeral();
    }
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
    <div 
      className="min-h-screen" 
      style={{ 
        backgroundColor: profileSettings.backgroundColor
      }}
    >
      <Header />
      {/* Cabeçalho de Perfil */}
      <div 
        className="h-[200px] sm:h-[250px] lg:h-[300px] relative overflow-hidden"
        style={{ 
          backgroundColor: profileSettings.headerColor,
          backgroundImage: profileSettings.headerImage ? `url(${profileSettings.headerImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Imagem de Perfil, Nome e Botão */}
        <div className="flex flex-col sm:flex-row justify-between px-4 sm:px-6 lg:px-[100px] items-center sm:items-start h-full">
          {/* Imagem de Perfil e Nome*/}
          <div className="flex flex-col sm:flex-row items-center sm:items-start mt-[80px] sm:mt-[120px] lg:mt-[150px]">
            {/* Imagem de Perfil */}
            <div className="relative">
              <Image
                src={avatarUrl || `https://ui-avatars.com/api/?name=${user.email}&size=100&background=926DF6&color=fff`}
                alt="Avatar"
                width={96}
                height={96}
                className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full mx-auto mb-2 sm:mb-4 border-4 border-[#926DF6]"
              />
              {/* Botão de upload de avatar */}
              <label className="absolute bottom-0 right-0 bg-[#926DF6] text-white p-1 sm:p-1.5 lg:p-2 rounded-full cursor-pointer hover:bg-[#A98AF8] transition-colors">
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="sm:ml-[20px] lg:ml-[30px] text-center sm:text-left mt-2 sm:mt-0">
              <p className="text-[18px] sm:text-[24px] lg:text-[32px] xl:text-[40px] font-bold" style={{ color: profileSettings.nicknameColor }}>
                {nickname || "Apelido"}
              </p>
            </div>
          </div>
          {/* Botão */}
          <div className="mt-4 sm:mt-auto sm:mb-4 lg:mb-8">
            <button 
              onClick={() => setShowEditModal(true)}
              className="bg-red-500 text-white py-1.5 sm:py-2 px-3 sm:px-4 rounded hover:bg-[#A98AF8] transition-colors text-xs sm:text-sm lg:text-base"
            >
              Editar Perfil
            </button>
          </div>
        </div>
      </div>

      {/* Seção de Fandoms */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-[20px] px-4 sm:px-6 lg:px-[100px] pb-[10px] border-b border-gray-300 mt-[10px]">
        <div className="flex flex-col items-center">
          <p className="text-[20px] sm:text-[24px] lg:text-[30px] font-bold" style={{ color: profileSettings.textColor }}>
            {userFandoms.length}
          </p>
          <p className="text-[14px] sm:text-[16px] lg:text-[18px]" style={{ color: profileSettings.textColor }}>Fandoms</p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-[20px] sm:text-[24px] lg:text-[30px] font-bold">{totalPosts}</p>
          <p className="text-[14px] sm:text-[16px] lg:text-[18px]">Publicações</p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-[20px] sm:text-[24px] lg:text-[30px] font-bold">{followersCount}</p>
          <p className="text-[14px] sm:text-[16px] lg:text-[18px]">Seguidores</p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-[20px] sm:text-[24px] lg:text-[30px] font-bold">{followingCount}</p>
          <p className="text-[14px] sm:text-[16px] lg:text-[18px]">Seguindo</p>
        </div>
        {/* <div className="flex flex-col items-center blur-sm">
          <p className="text-[20px] sm:text-[24px] lg:text-[30px] font-bold">X</p>
          <p className="text-[14px] sm:text-[16px] lg:text-[18px]">Amigos</p>
        </div>
        <div className="flex flex-col items-center blur-sm">
          <p className="text-[20px] sm:text-[24px] lg:text-[30px] font-bold">X</p>
          <p className="text-[14px] sm:text-[16px] lg:text-[18px]">Conquistas</p>
        </div> */}
      </div>

      {/* Seção de Buttons */}
      <div className="flex gap-2 sm:gap-[10px] px-4 sm:px-6 lg:px-[100px] pt-[25px] pb-[10px] border-b border-gray-300 overflow-x-auto justify-center">
        <button 
          onClick={() => handleSectionChange('visao-geral')}
          className={`text-[16px] sm:text-[18px] lg:text-[20px] transition-colors duration-200 rounded px-2 py-1 whitespace-nowrap flex-shrink-0 ${
            activeSection === 'visao-geral' ? 'ring-2 ring-blue-500' : ''
          }`}
          style={{ 
            backgroundColor: activeSection === 'visao-geral' 
              ? profileSettings.buttonHoverBackgroundColor 
              : (profileSettings.buttonHasBackground ? profileSettings.buttonBackgroundColor : 'transparent'),
            color: activeSection === 'visao-geral' 
              ? profileSettings.buttonHoverTextColor 
              : profileSettings.buttonTextColor
          }}
          onMouseEnter={(e) => {
            if (activeSection !== 'visao-geral') {
              e.currentTarget.style.backgroundColor = profileSettings.buttonHasBackground ? profileSettings.buttonHoverBackgroundColor : 'transparent';
              e.currentTarget.style.color = profileSettings.buttonHoverTextColor;
            }
          }}
          onMouseLeave={(e) => {
            if (activeSection !== 'visao-geral') {
              e.currentTarget.style.backgroundColor = profileSettings.buttonHasBackground ? profileSettings.buttonBackgroundColor : 'transparent';
              e.currentTarget.style.color = profileSettings.buttonTextColor;
            }
          }}
        >
          Visão Geral
        </button>
        <button 
          onClick={() => handleSectionChange('fandoms')}
          className={`text-[16px] sm:text-[18px] lg:text-[20px] transition-colors duration-200 rounded px-2 py-1 whitespace-nowrap flex-shrink-0 ${
            activeSection === 'fandoms' ? 'ring-2 ring-blue-500' : ''
          }`}
          style={{ 
            backgroundColor: activeSection === 'fandoms' 
              ? profileSettings.buttonHoverBackgroundColor 
              : (profileSettings.buttonHasBackground ? profileSettings.buttonBackgroundColor : 'transparent'),
            color: activeSection === 'fandoms' 
              ? profileSettings.buttonHoverTextColor 
              : profileSettings.buttonTextColor
          }}
          onMouseEnter={(e) => {
            if (activeSection !== 'fandoms') {
              e.currentTarget.style.backgroundColor = profileSettings.buttonHasBackground ? profileSettings.buttonHoverBackgroundColor : 'transparent';
              e.currentTarget.style.color = profileSettings.buttonHoverTextColor;
            }
          }}
          onMouseLeave={(e) => {
            if (activeSection !== 'fandoms') {
              e.currentTarget.style.backgroundColor = profileSettings.buttonHasBackground ? profileSettings.buttonBackgroundColor : 'transparent';
              e.currentTarget.style.color = profileSettings.buttonTextColor;
            }
          }}
        >
          Fandoms
        </button>
        <button 
          onClick={() => handleSectionChange('publicacoes')}
          className={`text-[16px] sm:text-[18px] lg:text-[20px] transition-colors duration-200 rounded px-2 py-1 whitespace-nowrap flex-shrink-0 ${
            activeSection === 'publicacoes' ? 'ring-2 ring-blue-500' : ''
          }`}
          style={{ 
            backgroundColor: activeSection === 'publicacoes' 
              ? profileSettings.buttonHoverBackgroundColor 
              : (profileSettings.buttonHasBackground ? profileSettings.buttonBackgroundColor : 'transparent'),
            color: activeSection === 'publicacoes' 
              ? profileSettings.buttonHoverTextColor 
              : profileSettings.buttonTextColor
          }}
          onMouseEnter={(e) => {
            if (activeSection !== 'publicacoes') {
              e.currentTarget.style.backgroundColor = profileSettings.buttonHasBackground ? profileSettings.buttonHoverBackgroundColor : 'transparent';
              e.currentTarget.style.color = profileSettings.buttonHoverTextColor;
            }
          }}
          onMouseLeave={(e) => {
            if (activeSection !== 'publicacoes') {
              e.currentTarget.style.backgroundColor = profileSettings.buttonHasBackground ? profileSettings.buttonBackgroundColor : 'transparent';
              e.currentTarget.style.color = profileSettings.buttonTextColor;
            }
          }}
        >
          Publicações
        </button>
        {/* <button 
          onClick={() => handleSectionChange('seguidores')}
          className={`text-[16px] sm:text-[18px] lg:text-[20px] transition-colors duration-200 rounded px-2 py-1 whitespace-nowrap flex-shrink-0 ${
            activeSection === 'seguidores' ? 'ring-2 ring-blue-500' : ''
          }`}
          style={{ 
            backgroundColor: activeSection === 'seguidores' 
              ? profileSettings.buttonHoverBackgroundColor 
              : (profileSettings.buttonHasBackground ? profileSettings.buttonBackgroundColor : 'transparent'),
            color: activeSection === 'seguidores' 
              ? profileSettings.buttonHoverTextColor 
              : profileSettings.buttonTextColor
          }}
          onMouseEnter={(e) => {
            if (activeSection !== 'seguidores') {
              e.currentTarget.style.backgroundColor = profileSettings.buttonHasBackground ? profileSettings.buttonHoverBackgroundColor : 'transparent';
              e.currentTarget.style.color = profileSettings.buttonHoverTextColor;
            }
          }}
          onMouseLeave={(e) => {
            if (activeSection !== 'seguidores') {
              e.currentTarget.style.backgroundColor = profileSettings.buttonHasBackground ? profileSettings.buttonBackgroundColor : 'transparent';
              e.currentTarget.style.color = profileSettings.buttonTextColor;
            }
          }}
        >
          Seguidores
        </button> */}
        <button 
          onClick={() => handleSectionChange('seguindo')}
          className={`text-[16px] sm:text-[18px] lg:text-[20px] transition-colors duration-200 rounded px-2 py-1 whitespace-nowrap flex-shrink-0 ${
            activeSection === 'seguindo' ? 'ring-2 ring-blue-500' : ''
          }`}
          style={{ 
            backgroundColor: activeSection === 'seguindo' 
              ? profileSettings.buttonHoverBackgroundColor 
              : (profileSettings.buttonHasBackground ? profileSettings.buttonBackgroundColor : 'transparent'),
            color: activeSection === 'seguindo' 
              ? profileSettings.buttonHoverTextColor 
              : profileSettings.buttonTextColor
          }}
          onMouseEnter={(e) => {
            if (activeSection !== 'seguindo') {
              e.currentTarget.style.backgroundColor = profileSettings.buttonHasBackground ? profileSettings.buttonHoverBackgroundColor : 'transparent';
              e.currentTarget.style.color = profileSettings.buttonHoverTextColor;
            }
          }}
          onMouseLeave={(e) => {
            if (activeSection !== 'seguindo') {
              e.currentTarget.style.backgroundColor = profileSettings.buttonHasBackground ? profileSettings.buttonBackgroundColor : 'transparent';
              e.currentTarget.style.color = profileSettings.buttonTextColor;
            }
          }}
        >
          Seguindo
        </button>
        {/* <button 
          onClick={() => handleSectionChange('amigos')}
          className={`text-[16px] sm:text-[18px] lg:text-[20px] transition-colors duration-200 rounded px-2 py-1 whitespace-nowrap flex-shrink-0 ${
            activeSection === 'amigos' ? 'ring-2 ring-blue-500' : ''
          }`}
          style={{ 
            backgroundColor: activeSection === 'amigos' 
              ? profileSettings.buttonHoverBackgroundColor 
              : (profileSettings.buttonHasBackground ? profileSettings.buttonBackgroundColor : 'transparent'),
            color: activeSection === 'amigos' 
              ? profileSettings.buttonHoverTextColor 
              : profileSettings.buttonTextColor
          }}
          onMouseEnter={(e) => {
            if (activeSection !== 'amigos') {
              e.currentTarget.style.backgroundColor = profileSettings.buttonHasBackground ? profileSettings.buttonHoverBackgroundColor : 'transparent';
              e.currentTarget.style.color = profileSettings.buttonHoverTextColor;
            }
          }}
          onMouseLeave={(e) => {
            if (activeSection !== 'amigos') {
              e.currentTarget.style.backgroundColor = profileSettings.buttonHasBackground ? profileSettings.buttonBackgroundColor : 'transparent';
              e.currentTarget.style.color = profileSettings.buttonTextColor;
            }
          }}
        >
          Amigos
        </button> */}
        {/* <button 
          onClick={() => handleSectionChange('conquistas')}
          className={`text-[16px] sm:text-[18px] lg:text-[20px] transition-colors duration-200 rounded px-2 py-1 whitespace-nowrap flex-shrink-0 ${
            activeSection === 'conquistas' ? 'ring-2 ring-blue-500' : ''
          }`}
          style={{ 
            backgroundColor: activeSection === 'conquistas' 
              ? profileSettings.buttonHoverBackgroundColor 
              : (profileSettings.buttonHasBackground ? profileSettings.buttonBackgroundColor : 'transparent'),
            color: activeSection === 'conquistas' 
              ? profileSettings.buttonHoverTextColor 
              : profileSettings.buttonTextColor
          }}
          onMouseEnter={(e) => {
            if (activeSection !== 'conquistas') {
              e.currentTarget.style.backgroundColor = profileSettings.buttonHasBackground ? profileSettings.buttonHoverBackgroundColor : 'transparent';
              e.currentTarget.style.color = profileSettings.buttonHoverTextColor;
            }
          }}
          onMouseLeave={(e) => {
            if (activeSection !== 'conquistas') {
              e.currentTarget.style.backgroundColor = profileSettings.buttonHasBackground ? profileSettings.buttonBackgroundColor : 'transparent';
              e.currentTarget.style.color = profileSettings.buttonTextColor;
            }
          }}
        >
          Conquistas
        </button> */}
        <button 
          onClick={() => handleSectionChange('configuracoes')}
          className={`text-[16px] sm:text-[18px] lg:text-[20px] transition-colors duration-200 rounded px-2 py-1 whitespace-nowrap flex-shrink-0 ${
            activeSection === 'configuracoes' ? 'ring-2 ring-blue-500' : ''
          }`}
          style={{ 
            backgroundColor: activeSection === 'configuracoes' 
              ? profileSettings.buttonHoverBackgroundColor 
              : (profileSettings.buttonHasBackground ? profileSettings.buttonBackgroundColor : 'transparent'),
            color: activeSection === 'configuracoes' 
              ? profileSettings.buttonHoverTextColor 
              : profileSettings.buttonTextColor
          }}
          onMouseEnter={(e) => {
            if (activeSection !== 'configuracoes') {
              e.currentTarget.style.backgroundColor = profileSettings.buttonHasBackground ? profileSettings.buttonHoverBackgroundColor : 'transparent';
              e.currentTarget.style.color = profileSettings.buttonHoverTextColor;
            }
          }}
          onMouseLeave={(e) => {
            if (activeSection !== 'configuracoes') {
              e.currentTarget.style.backgroundColor = profileSettings.buttonHasBackground ? profileSettings.buttonBackgroundColor : 'transparent';
              e.currentTarget.style.color = profileSettings.buttonTextColor;
            }
          }}
        >
          Configurações
        </button>
      </div>

      {/* Seção de Visão Geral */}
      <main 
        className="px-4 sm:px-6 lg:px-[100px]"
        style={{ 
          backgroundImage: profileSettings.backgroundImage ? `url(${profileSettings.backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {renderActiveSection()}
      </main>

      {/* Modal de Edição de Perfil */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-[500px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl sm:text-2xl font-bold">Editar Perfil</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700 p-1"
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

              {/* Imagem de Fundo do Perfil */}
              <div>
                <label className="block text-sm font-medium mb-2">Imagem de Fundo do Perfil</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundImageUpload}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              {/* Cor do Apelido */}
              <div>
                <label className="block text-sm font-medium mb-2">Cor do Apelido</label>
                <input
                  type="color"
                  value={profileSettings.nicknameColor}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, nicknameColor: e.target.value }))}
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

              {/* Cor do Título "Sobre" */}
              <div>
                <label className="block text-sm font-medium mb-2">Cor do Título &quot;Sobre&quot;</label>
                <input
                  type="color"
                  value={profileSettings.aboutTitleColor}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, aboutTitleColor: e.target.value }))}
                  className="w-full h-10 border border-gray-300 rounded"
                />
              </div>

              {/* Cor do Texto do Sobre */}
              <div>
                <label className="block text-sm font-medium mb-2">Cor do Texto do Sobre</label>
                <input
                  type="color"
                  value={profileSettings.aboutTextColor}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, aboutTextColor: e.target.value }))}
                  className="w-full h-10 border border-gray-300 rounded"
                />
              </div>

              {/* Cor do Texto dos Botões */}
              <div>
                <label className="block text-sm font-medium mb-2">Cor do Texto dos Botões</label>
                <input
                  type="color"
                  value={profileSettings.buttonTextColor}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, buttonTextColor: e.target.value }))}
                  className="w-full h-10 border border-gray-300 rounded"
                />
              </div>

              {/* Checkbox para Background dos Botões */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="buttonHasBackground"
                  checked={profileSettings.buttonHasBackground}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, buttonHasBackground: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="buttonHasBackground" className="text-sm font-medium">
                  Botões têm background
                </label>
              </div>

              {/* Cor de Fundo dos Botões - Condicional */}
              {profileSettings.buttonHasBackground && (
                <div>
                  <label className="block text-sm font-medium mb-2">Cor de Fundo dos Botões</label>
                  <input
                    type="color"
                    value={profileSettings.buttonBackgroundColor}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, buttonBackgroundColor: e.target.value }))}
                    className="w-full h-10 border border-gray-300 rounded"
                  />
                </div>
              )}

              {/* Cor de Fundo dos Botões (Hover) - Condicional */}
              {profileSettings.buttonHasBackground && (
                <div>
                  <label className="block text-sm font-medium mb-2">Cor de Fundo dos Botões (Hover)</label>
                  <input
                    type="color"
                    value={profileSettings.buttonHoverBackgroundColor}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, buttonHoverBackgroundColor: e.target.value }))}
                    className="w-full h-10 border border-gray-300 rounded"
                  />
                </div>
              )}

              {/* Cor do Texto dos Botões (Hover) */}
              <div>
                <label className="block text-sm font-medium mb-2">Cor do Texto dos Botões (Hover)</label>
                <input
                  type="color"
                  value={profileSettings.buttonHoverTextColor}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, buttonHoverTextColor: e.target.value }))}
                  className="w-full h-10 border border-gray-300 rounded"
                />
              </div>

              {/* Botão Resetar Cores */}
              <div className="pt-2">
                <button
                  onClick={handleResetColors}
                  className="w-full bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 transition-colors"
                >
                  🔄 Resetar Cores para Padrão
                </button>
              </div>

              {/* Mensagem de feedback */}
              {message && (
                <div className={`p-2 rounded ${message.includes('sucesso') || message.includes('resetadas') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {message}
                </div>
              )}

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4">
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