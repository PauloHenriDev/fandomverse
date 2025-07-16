// tutorial/components/ui/LoginForm.tsx
'use client';

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else router.push("/");
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-2 max-w-sm mx-auto mt-10">
      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="p-2 rounded"
        required
      />
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="p-2 rounded"
        required
      />
      <button type="submit" className="bg-[#A98AF8] text-white rounded p-2">Entrar</button>
      {error && <span className="text-red-500">{error}</span>}
    </form>
  );
}