'use client';

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Página para criação de novas fandoms
 * 
 * Esta página permite que usuários logados:
 * - Preencham informações básicas da fandom
 * - Façam upload de imagem (opcional)
 * - Criem uma nova fandom no banco de dados
 * - Sejam redirecionados de volta ao perfil após criação
 */
export default function CreateFandomPage() {
  // Estados para gerenciar autenticação e dados do formulário
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  // Estado para gerenciar dados do formulário
  const [formData, setFormData] = useState({
    name: "",        // Nome da fandom
    description: "", // Descrição da fandom
    image_url: ""    // URL da imagem (opcional)
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
    });
  }, [router]);

  /**
   * Processa o envio do formulário de criação de fandom
   * @param e - Evento do formulário
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage("");

    try {
      // Insere nova fandom no banco de dados
      const { error } = await supabase
        .from('fandoms')
        .insert({
          name: formData.name,
          description: formData.description,
          image_url: formData.image_url || null, // Converte string vazia para null
          creator_id: user.id,
          created_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      // Sucesso - mostra mensagem e redireciona
      setMessage("Fandom criada com sucesso!");
      setTimeout(() => {
        router.push("/profile");
      }, 2000);
    } catch (error: any) {
      // Erro - mostra mensagem de erro
      setMessage("Erro ao criar fandom: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Atualiza os campos do formulário conforme o usuário digita
   * @param e - Evento de mudança do input/textarea
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Mostra loading enquanto verifica autenticação
  if (!user) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6">
      {/* Botão de navegação para voltar ao perfil */}
      <div className="mb-6">
        <Link href="/profile" className="inline-flex items-center text-[#926DF6] hover:text-[#A98AF8] transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar para Perfil
        </Link>
      </div>

      {/* Container principal do formulário */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Criar Nova Fandom</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo: Nome da Fandom (obrigatório) */}
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

          {/* Campo: Descrição (obrigatório) */}
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

          {/* Campo: URL da Imagem (opcional) */}
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

          {/* Mensagem de feedback para o usuário */}
          {message && (
            <div className={`p-3 rounded-lg ${
              message.includes('Erro') 
                ? 'bg-red-100 text-red-700 border border-red-200' 
                : 'bg-green-100 text-green-700 border border-green-200'
            }`}>
              {message}
            </div>
          )}

          {/* Botões de ação */}
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