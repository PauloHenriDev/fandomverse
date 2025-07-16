'use client';

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { User, Session } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";

interface FandomHeaderProps {
  fandomName: string;
  fandomDescription: string;
  fandomId: string;
  creatorId: string;
}

export default function FandomHeader({ fandomName, fandomDescription, fandomId, creatorId }: FandomHeaderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [loadingFollow, setLoadingFollow] = useState<boolean>(false);

  useEffect(() => {
    // Verifica usuário atual
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: User | null } }) => {
      setUser(user);
      if (user) {
        loadUserProfile(user.id);
        checkIfFollowing(user.id);
      }
    });

    // Escuta mudanças de autenticação
    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
        checkIfFollowing(session.user.id);
      } else {
        setNickname(null);
        setAvatarUrl(null);
        setIsFollowing(false);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [fandomId]);

  const loadUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('nickname, avatar_url')
      .eq('id', userId)
      .single();

    if (data) {
      if (data.nickname) setNickname(data.nickname);
      if (data.avatar_url) setAvatarUrl(data.avatar_url);
    }
  };

  // Verifica se o usuário já segue a fandom
  const checkIfFollowing = async (userId: string) => {
    if (!fandomId || !userId) return;
    const { data, error } = await supabase
      .from('fandom_followers')
      .select('id')
      .eq('fandom_id', fandomId)
      .eq('user_id', userId)
      .single();
    setIsFollowing(!!data && !error);
  };

  // Seguir fandom
  const handleFollow = async () => {
    if (!user) return;
    setLoadingFollow(true);
    const { error } = await supabase
      .from('fandom_followers')
      .insert({ fandom_id: fandomId, user_id: user.id });
    if (!error) setIsFollowing(true);
    setLoadingFollow(false);
  };

  // Deixar de seguir fandom
  const handleUnfollow = async () => {
    if (!user) return;
    setLoadingFollow(true);
    const { error } = await supabase
      .from('fandom_followers')
      .delete()
      .eq('fandom_id', fandomId)
      .eq('user_id', user.id);
    if (!error) setIsFollowing(false);
    setLoadingFollow(false);
  };

  return (
    <div className="flex justify-around items-center bg-[#926DF6] text-white shadow-lg">
      {/* Lado esquerdo - Logo e informações da fandom */}
      <div className="flex items-center gap-6">
        <Link href="/" className="text-[30px] font-bold hover:opacity-80 transition-opacity">
          FandomVerse
        </Link>
        
        {/* Separador visual */}
        <div className="w-px h-8 bg-white opacity-30"></div>
        
        {/* Informações da fandom */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Link 
              href={`/fandom/${fandomId}`}
              className="text-[24px] font-bold truncate max-w-[300px] cursor-pointer"
            >
              {fandomName}
            </Link>
            {/* Botão Seguir/Deixar de seguir */}
            {user && user.id !== creatorId && (
              isFollowing ? (
                <button
                  onClick={handleUnfollow}
                  disabled={loadingFollow}
                  className="ml-2 px-3 py-1 rounded bg-white text-[#926DF6] font-semibold hover:bg-[#E0E7FF] transition-colors text-sm border border-[#926DF6]"
                >
                  {loadingFollow ? '...' : 'Deixar de seguir'}
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  disabled={loadingFollow}
                  className="ml-2 px-3 py-1 rounded bg-[#A98AF8] text-white font-semibold hover:bg-[#AE9AF8] transition-colors text-sm"
                >
                  {loadingFollow ? '...' : 'Seguir'}
                </button>
              )
            )}
          </div>
          <p className="text-[14px] text-[#E3DBFC] truncate max-w-[300px]">{fandomDescription}</p>
        </div>
      </div>

      {/* Lado direito - Usuário e botões */}
      <div className="flex items-center gap-4">
        {/* Botão de edição para o criador */}
        {user?.id === creatorId && (
          <Link
            href={`/fandom/${fandomId}/edit`}
            className="h-[35px] px-4 rounded-[6px] bg-[#A98AF8] text-white hover:bg-[#AE9AF8] transition-colors text-sm font-medium flex items-center justify-center"
          >
            Editar Página
          </Link>
        )}

        {/* Informações do usuário */}
        {user ? (
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-lg">
              Olá, {nickname || user.email}
            </span>
            {/* Ícone de usuário como SVG ou foto */}
            <Link href="/profile">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full cursor-pointer hover:opacity-80 transition-opacity border-2 border-white"
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="white"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-9 h-9 cursor-pointer hover:text-[#A98AF8] transition-colors"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0v.75H4.5v-.75z"
                  />
                </svg>
              )}
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-[15px]">
            <Link href="/auth/login">
              <button className="h-[35px] w-[70px] rounded-[6px] bg-[#A98AF8] text-white hover:bg-[#AE9AF8] transition-colors">
                <p>Entrar</p>
              </button>
            </Link>
            <Link href="/auth/sign-up">
              <button className="h-[35px] w-[100px] rounded-[6px] bg-white hover:bg-[#E0E7FF] transition-colors">
                <p className="text-[#5047E5] transition-colors">Cadastrar</p>
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 