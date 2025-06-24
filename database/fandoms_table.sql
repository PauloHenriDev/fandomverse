-- Criação da tabela fandoms
CREATE TABLE IF NOT EXISTS fandoms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_fandoms_creator_id ON fandoms(creator_id);
CREATE INDEX IF NOT EXISTS idx_fandoms_created_at ON fandoms(created_at);

-- Política RLS (Row Level Security) para permitir que usuários vejam todas as fandoms
ALTER TABLE fandoms ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura de todas as fandoms
CREATE POLICY "Allow public read access to fandoms" ON fandoms
    FOR SELECT USING (true);

-- Política para permitir que usuários criem suas próprias fandoms
CREATE POLICY "Allow users to create their own fandoms" ON fandoms
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Política para permitir que usuários atualizem suas próprias fandoms
CREATE POLICY "Allow users to update their own fandoms" ON fandoms
    FOR UPDATE USING (auth.uid() = creator_id);

-- Política para permitir que usuários excluam suas próprias fandoms
CREATE POLICY "Allow users to delete their own fandoms" ON fandoms
    FOR DELETE USING (auth.uid() = creator_id);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_fandoms_updated_at 
    BEFORE UPDATE ON fandoms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 