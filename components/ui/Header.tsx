'use client';

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { User, Session } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";
// import FetchInstruments from "./FetchInstruments";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    // Verifica usuário atual
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: User | null } }) => {
      setUser(user);
      if (user) {
        loadUserProfile(user.id);
      }
    });

    // Escuta mudanças de autenticação
    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setNickname(null);
        setAvatarUrl(null);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

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

  return (
    <div className="flex justify-around items-center bg-[#926DF6] text-white shadow-lg">
      <Link href="/">
        <p className="text-[50px] font-bold">FandomVerse</p>
      </Link>
      {/* FetchInstruments é para checar pelo console.log se os arrays estão vindo */}
      {/* <FetchInstruments /> */}

      {user ? (
        <div className="flex items-center gap-4">
          <span className="hidden sm:block text-[25px]">
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
                className="w-12 h-12 rounded-full cursor-pointer hover:opacity-80 transition-opacity border-2 border-white"
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
  );
}
