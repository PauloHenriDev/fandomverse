import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface Fandom {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  creator_id: string;
  created_at: string;
  updated_at: string;
  followersCount?: number;
  postsCount?: number;
}

export function useFandoms() {
  const [fandoms, setFandoms] = useState<Fandom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFandoms() {
      try {
        const supabase = createClient();
        
        // Busca todas as fandoms
        const { data, error } = await supabase
          .from('fandoms')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        // Para cada fandom, busca o número de seguidores e de posts
        const fandomsWithCounts = await Promise.all((data || []).map(async (fandom: Fandom) => {
          // Contar seguidores
          const { count: followersCount } = await supabase
            .from('fandom_followers')
            .select('id', { count: 'exact', head: true })
            .eq('fandom_id', fandom.id);

          // Buscar page da fandom
          const { data: pageData } = await supabase
            .from('fandom_pages')
            .select('id')
            .eq('fandom_id', fandom.id)
            .single();

          let postsCount = 0;
          if (pageData) {
            // Buscar seções da página
            const { data: sectionsData } = await supabase
              .from('fandom_sections')
              .select('id')
              .eq('fandom_page_id', pageData.id);
            if (sectionsData && sectionsData.length > 0) {
              // Buscar número de itens (posts) em todas as seções
              const sectionIds = sectionsData.map((s: any) => s.id);
              const { count: itemsCount } = await supabase
                .from('section_items')
                .select('id', { count: 'exact', head: true })
                .in('section_id', sectionIds)
                .eq('is_active', true);
              postsCount = itemsCount || 0;
            }
          }

          return {
            ...fandom,
            followersCount: followersCount || 0,
            postsCount: postsCount || 0,
          };
        }));

        setFandoms(fandomsWithCounts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar fandoms');
      } finally {
        setLoading(false);
      }
    }

    fetchFandoms();
  }, []);

  return { fandoms, loading, error };
} 