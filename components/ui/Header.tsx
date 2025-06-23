'use client';

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { User, Session } from "@supabase/supabase-js";
import Link from "next/link";
// import FetchInstruments from "./FetchInstruments";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Verifica usuário atual
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: User | null } }) => {
      setUser(user);
    });

    // Escuta mudanças de autenticação
    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="flex justify-around items-center bg-[#926DF6] text-white">
      <p className="text-[50px] font-bold">FandomVerse</p>
      {/* FetchInstruments é para checar pelo console.log se os arrays estão vindo */}
      {/* <FetchInstruments /> */}

      {user ? (
        <div className="flex items-center gap-4">
          <span className="hidden sm:block text-lg">Olá, {user.email}</span>
          {/* Ícone de usuário como SVG */}
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
        </div>
      ) : (
        <div className="flex items-center gap-[15px]">
          <Link href="/auth/login" passHref legacyBehavior>
            <button className="h-[35px] w-[70px] rounded-[6px] bg-[#A98AF8] hover:bg-white hover:text-[#A98AF8] transition-colors">
              <p>Entrar</p>
            </button>
          </Link>
          <Link href="/auth/sign-up" passHref legacyBehavior>
            <button className="h-[35px] w-[100px] rounded-[6px] bg-white hover:bg-[#A98AF8] transition-colors">
              <p className="text-[#5047E5] hover:text-white">Cadastrar</p>
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
