'use client';

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateFandomPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: ""
  });
  const router = useRouter();

  useEffect(() => {
    // Verifica se o usuário está logado
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setUser(user);
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase
        .from('fandoms')
        .insert({
          name: formData.name,
          description: formData.description,
          image_url: formData.image_url || null,
          creator_id: user.id,
          created_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      setMessage("Fandom criada com sucesso!");
      setTimeout(() => {
        router.push("/profile");
      }, 2000);
    } catch (error: any) {
      setMessage("Erro ao criar fandom: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!user) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6">
      {/* Botão Voltar */}
      <div className="mb-6">
        <Link href="/profile" className="inline-flex items-center text-[#926DF6] hover:text-[#A98AF8] transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar para Perfil
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Criar Nova Fandom</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome da Fandom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Fandom *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Digite o nome da fandom"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Descreva sua fandom..."
              required
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent resize-none"
            />
          </div>

          {/* URL da Imagem (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL da Imagem (opcional)
            </label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleInputChange}
              placeholder="https://exemplo.com/imagem.jpg"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
            />
          </div>

          {/* Mensagem de feedback */}
          {message && (
            <div className={`p-3 rounded-lg ${
              message.includes('Erro') 
                ? 'bg-red-100 text-red-700 border border-red-200' 
                : 'bg-green-100 text-green-700 border border-green-200'
            }`}>
              {message}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#926DF6] text-white py-3 px-4 rounded-lg hover:bg-[#A98AF8] transition-colors disabled:opacity-50 font-medium"
            >
              {loading ? "Criando..." : "Criar Fandom"}
            </button>
            
            <Link
              href="/profile"
              className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium text-center"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 