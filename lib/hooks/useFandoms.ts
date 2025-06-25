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
}

export function useFandoms() {
  const [fandoms, setFandoms] = useState<Fandom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFandoms() {
      try {
        const supabase = createClient();
        
        const { data, error } = await supabase
          .from('fandoms')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setFandoms(data || []);
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