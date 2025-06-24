-- =====================================================
-- SCRIPT DE CRIAÇÃO DA TABELA FANDOMS
-- =====================================================
-- Este script cria a tabela fandoms no Supabase com todas as
-- configurações necessárias para o sistema de fandoms

-- Criação da tabela fandoms com estrutura completa
CREATE TABLE IF NOT EXISTS fandoms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,  -- ID único gerado automaticamente
    name VARCHAR(255) NOT NULL,                     -- Nome da fandom (obrigatório)
    description TEXT,                               -- Descrição da fandom (texto longo)
    image_url TEXT,                                 -- URL da imagem da fandom (opcional)
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,  -- ID do criador (referência ao usuário)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),  -- Data de criação automática
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()   -- Data de última atualização
);

-- =====================================================
-- ÍNDICES PARA MELHORAR PERFORMANCE
-- =====================================================

-- Índice para buscar fandoms por criador (muito usado)
CREATE INDEX IF NOT EXISTS idx_fandoms_creator_id ON fandoms(creator_id);

-- Índice para ordenar por data de criação (usado na listagem)
CREATE INDEX IF NOT EXISTS idx_fandoms_created_at ON fandoms(created_at);

-- =====================================================
-- CONFIGURAÇÃO DE SEGURANÇA (ROW LEVEL SECURITY)
-- =====================================================

-- Habilita Row Level Security na tabela
ALTER TABLE fandoms ENABLE ROW LEVEL SECURITY;

-- Política 1: Permite que qualquer usuário veja todas as fandoms
-- Isso permite que a comunidade veja todas as fandoms criadas
CREATE POLICY "Allow public read access to fandoms" ON fandoms
    FOR SELECT USING (true);

-- Política 2: Permite que usuários criem suas próprias fandoms
-- Verifica se o usuário logado é o criador
CREATE POLICY "Allow users to create their own fandoms" ON fandoms
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Política 3: Permite que usuários atualizem apenas suas próprias fandoms
-- Garante que apenas o criador pode editar sua fandom
CREATE POLICY "Allow users to update their own fandoms" ON fandoms
    FOR UPDATE USING (auth.uid() = creator_id);

-- Política 4: Permite que usuários excluam apenas suas próprias fandoms
-- Garante que apenas o criador pode excluir sua fandom
CREATE POLICY "Allow users to delete their own fandoms" ON fandoms
    FOR DELETE USING (auth.uid() = creator_id);

-- =====================================================
-- FUNÇÃO E TRIGGER PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Função que atualiza automaticamente o campo updated_at
-- Esta função é chamada sempre que um registro é atualizado
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();  -- Define a data atual como updated_at
    RETURN NEW;              -- Retorna o registro atualizado
END;
$$ language 'plpgsql';

-- Trigger que executa a função update_updated_at_column
-- antes de qualquer UPDATE na tabela fandoms
CREATE TRIGGER update_fandoms_updated_at 
    BEFORE UPDATE ON fandoms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMENTÁRIOS ADICIONAIS
-- =====================================================

-- A tabela fandoms está agora configurada com:
-- ✅ Estrutura de dados completa
-- ✅ Índices para performance
-- ✅ Segurança baseada em usuário (RLS)
-- ✅ Timestamps automáticos
-- ✅ Integridade referencial com auth.users
-- ✅ Cascade delete (se usuário for excluído, suas fandoms também são)

-- Para testar a configuração, você pode executar:
-- SELECT * FROM fandoms LIMIT 5;
-- SELECT * FROM pg_policies WHERE tablename = 'fandoms'; 