'use client';

import { supabase } from "../../lib/supabase";

export default function LogoutButton() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); // Atualiza para mostrar usuário deslogado
  };

  return (
    <button onClick={handleLogout} className="bg-red-500 text-white rounded p-2">
      Logout
    </button>
  );
}