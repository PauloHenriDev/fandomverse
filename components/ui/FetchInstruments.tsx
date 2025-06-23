'use client';

import { useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function FetchInstruments() {
  useEffect(() => {
    const fetchInstruments = async () => {
      console.log('🔍 Iniciando busca na tabela instruments...');
      
      // Primeiro, vamos verificar se a tabela existe
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      if (tablesError) {
        console.error('❌ Erro ao buscar tabelas:', tablesError);
      } else {
        console.log('📋 Tabelas disponíveis:', tables?.map(t => t.table_name));
      }

      // Vamos tentar buscar com diferentes abordagens
      console.log('🎯 Tentando buscar instrumentos...');
      
      // Abordagem 1: Busca simples
      const { data, error } = await supabase.from('instruments').select('*');
      
      if (error) {
        console.error('❌ Erro ao buscar instrumentos:', error);
        console.log('🔧 Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // Se for erro de permissão, vamos tentar outras abordagens
        if (error.code === '42501' || error.message.includes('permission')) {
          console.log('🚫 Problema de permissão detectado!');
          console.log('💡 Solução: Configure as políticas RLS (Row Level Security) no Supabase');
        }
      } else {
        console.log('✅ Instrumentos do banco:', data);
        console.log('📊 Quantidade de instrumentos:', data?.length || 0);
      }

      // Vamos tentar buscar apenas um campo específico
      console.log('🎯 Tentando buscar apenas o nome dos instrumentos...');
      const { data: names, error: namesError } = await supabase
        .from('instruments')
        .select('name');
      
      if (namesError) {
        console.error('❌ Erro ao buscar nomes:', namesError);
      } else {
        console.log('✅ Nomes dos instrumentos:', names);
      }
    };
    
    fetchInstruments();
  }, []);

  return null; // Não renderiza nada, só para teste
}