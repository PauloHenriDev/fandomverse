-- =====================================================
-- SCRIPT DE CRIAÇÃO DAS TABELAS PARA PÁGINAS DE FANDOMS
-- =====================================================
-- Este script cria as tabelas necessárias para páginas de fandoms
-- personalizáveis com seções e cores customizáveis

-- =====================================================
-- TABELA: fandom_pages (páginas de fandoms)
-- =====================================================
CREATE TABLE IF NOT EXISTS fandom_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fandom_id UUID NOT NULL REFERENCES fandoms(id) ON DELETE CASCADE,
    page_title VARCHAR(255) NOT NULL,
    page_description TEXT,
    hero_title VARCHAR(255),
    hero_description TEXT,
    hero_primary_button_text VARCHAR(100),
    hero_secondary_button_text VARCHAR(100),
    hero_primary_button_color VARCHAR(7) DEFAULT '#926DF6',
    hero_secondary_button_color VARCHAR(7) DEFAULT '#926DF6',
    background_color VARCHAR(7) DEFAULT '#875CF5',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: fandom_sections (seções das páginas)
-- =====================================================
CREATE TABLE IF NOT EXISTS fandom_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fandom_page_id UUID NOT NULL REFERENCES fandom_pages(id) ON DELETE CASCADE,
    section_type VARCHAR(50) NOT NULL, -- 'hero', 'filter', 'card_grid', 'custom'
    section_title VARCHAR(255),
    section_description TEXT,
    section_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    custom_content TEXT, -- Para seções customizadas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: section_filters (filtros das seções)
-- =====================================================
CREATE TABLE IF NOT EXISTS section_filters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_id UUID NOT NULL REFERENCES fandom_sections(id) ON DELETE CASCADE,
    filter_label VARCHAR(100) NOT NULL,
    filter_value VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT false,
    filter_order INTEGER NOT NULL,
    filter_color VARCHAR(7) DEFAULT '#926DF6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: section_items (itens das seções - cards, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS section_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_id UUID NOT NULL REFERENCES fandom_sections(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL, -- 'character', 'location', 'custom'
    item_title VARCHAR(255) NOT NULL,
    item_description TEXT,
    item_image_url TEXT,
    item_color VARCHAR(7) DEFAULT '#926DF6',
    item_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    custom_data JSONB, -- Para dados customizados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA MELHORAR PERFORMANCE
-- =====================================================

-- Índices para fandom_pages
CREATE INDEX IF NOT EXISTS idx_fandom_pages_fandom_id ON fandom_pages(fandom_id);
CREATE INDEX IF NOT EXISTS idx_fandom_pages_created_at ON fandom_pages(created_at);

-- Índices para fandom_sections
CREATE INDEX IF NOT EXISTS idx_fandom_sections_page_id ON fandom_sections(fandom_page_id);
CREATE INDEX IF NOT EXISTS idx_fandom_sections_order ON fandom_sections(section_order);
CREATE INDEX IF NOT EXISTS idx_fandom_sections_type ON fandom_sections(section_type);

-- Índices para section_filters
CREATE INDEX IF NOT EXISTS idx_section_filters_section_id ON section_filters(section_id);
CREATE INDEX IF NOT EXISTS idx_section_filters_order ON section_filters(filter_order);

-- Índices para section_items
CREATE INDEX IF NOT EXISTS idx_section_items_section_id ON section_items(section_id);
CREATE INDEX IF NOT EXISTS idx_section_items_order ON section_items(item_order);
CREATE INDEX IF NOT EXISTS idx_section_items_type ON section_items(item_type);

-- =====================================================
-- CONFIGURAÇÃO DE SEGURANÇA (ROW LEVEL SECURITY)
-- =====================================================

-- Habilita RLS em todas as tabelas
ALTER TABLE fandom_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE fandom_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_items ENABLE ROW LEVEL SECURITY;

-- Políticas para fandom_pages
CREATE POLICY "Allow public read access to fandom_pages" ON fandom_pages
    FOR SELECT USING (true);

CREATE POLICY "Allow fandom creators to manage their pages" ON fandom_pages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM fandoms 
            WHERE fandoms.id = fandom_pages.fandom_id 
            AND fandoms.creator_id = auth.uid()
        )
    );

-- Políticas para fandom_sections
CREATE POLICY "Allow public read access to fandom_sections" ON fandom_sections
    FOR SELECT USING (true);

CREATE POLICY "Allow fandom creators to manage their sections" ON fandom_sections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM fandom_pages 
            JOIN fandoms ON fandoms.id = fandom_pages.fandom_id
            WHERE fandom_pages.id = fandom_sections.fandom_page_id 
            AND fandoms.creator_id = auth.uid()
        )
    );

-- Políticas para section_filters
CREATE POLICY "Allow public read access to section_filters" ON section_filters
    FOR SELECT USING (true);

CREATE POLICY "Allow fandom creators to manage their filters" ON section_filters
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM fandom_sections 
            JOIN fandom_pages ON fandom_pages.id = fandom_sections.fandom_page_id
            JOIN fandoms ON fandoms.id = fandom_pages.fandom_id
            WHERE fandom_sections.id = section_filters.section_id 
            AND fandoms.creator_id = auth.uid()
        )
    );

-- Políticas para section_items
CREATE POLICY "Allow public read access to section_items" ON section_items
    FOR SELECT USING (true);

CREATE POLICY "Allow fandom creators to manage their items" ON section_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM fandom_sections 
            JOIN fandom_pages ON fandom_pages.id = fandom_sections.fandom_page_id
            JOIN fandoms ON fandoms.id = fandom_pages.fandom_id
            WHERE fandom_sections.id = section_items.section_id 
            AND fandoms.creator_id = auth.uid()
        )
    );

-- =====================================================
-- FUNÇÕES E TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_fandom_pages_updated_at 
    BEFORE UPDATE ON fandom_pages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fandom_sections_updated_at 
    BEFORE UPDATE ON fandom_sections 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_section_items_updated_at 
    BEFORE UPDATE ON section_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNÇÃO PARA CRIAR PÁGINA PADRÃO DE FANDOM
-- =====================================================

CREATE OR REPLACE FUNCTION create_default_fandom_page(fandom_uuid UUID)
RETURNS UUID AS $$
DECLARE
    page_id UUID;
    hero_section_id UUID;
    characters_section_id UUID;
    regions_section_id UUID;
BEGIN
    -- Cria a página da fandom
    INSERT INTO fandom_pages (fandom_id, page_title, page_description, hero_title, hero_description, hero_primary_button_text, hero_secondary_button_text)
    VALUES (
        fandom_uuid,
        'Página da Fandom',
        'Página personalizada da fandom',
        'Bem-vindo à Fandom',
        'Explore o universo desta fandom incrível',
        'Explorar Conteúdo',
        'Entrar na Comunidade'
    )
    RETURNING id INTO page_id;

    -- Cria seção Hero
    INSERT INTO fandom_sections (fandom_page_id, section_type, section_title, section_description, section_order)
    VALUES (page_id, 'hero', 'Hero Section', 'Seção principal da página', 1)
    RETURNING id INTO hero_section_id;

    -- Cria seção de Personagens
    INSERT INTO fandom_sections (fandom_page_id, section_type, section_title, section_description, section_order)
    VALUES (page_id, 'filter', 'Personagens', 'Conheça os personagens desta fandom', 2)
    RETURNING id INTO characters_section_id;

    -- Adiciona filtros para personagens
    INSERT INTO section_filters (section_id, filter_label, filter_value, is_active, filter_order)
    VALUES 
        (characters_section_id, 'Todos', 'all', true, 1),
        (characters_section_id, 'Protagonistas', 'protagonists', false, 2),
        (characters_section_id, 'Antagonistas', 'antagonists', false, 3),
        (characters_section_id, 'Secundários', 'supporting', false, 4);

    -- Cria seção de Regiões
    INSERT INTO fandom_sections (fandom_page_id, section_type, section_title, section_description, section_order)
    VALUES (page_id, 'filter', 'Regiões', 'Explore as regiões deste universo', 3)
    RETURNING id INTO regions_section_id;

    -- Adiciona filtros para regiões
    INSERT INTO section_filters (section_id, filter_label, filter_value, is_active, filter_order)
    VALUES 
        (regions_section_id, 'Todas', 'all', true, 1),
        (regions_section_id, 'Norte', 'north', false, 2),
        (regions_section_id, 'Sul', 'south', false, 3),
        (regions_section_id, 'Leste', 'east', false, 4),
        (regions_section_id, 'Oeste', 'west', false, 5);

    RETURN page_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMENTÁRIOS ADICIONAIS
-- =====================================================

-- O sistema está configurado com:
-- ✅ Estrutura completa para páginas personalizáveis
-- ✅ Seções com tipos diferentes (hero, filter, card_grid, custom)
-- ✅ Filtros personalizáveis para cada seção
-- ✅ Itens customizáveis (cards, personagens, etc.)
-- ✅ Sistema de cores personalizável
-- ✅ Ordem customizável das seções
-- ✅ Segurança baseada em usuário (RLS)
-- ✅ Função para criar página padrão automaticamente
-- ✅ Índices para performance
-- ✅ Triggers para timestamps automáticos

-- Para testar a configuração:
-- SELECT * FROM fandom_pages LIMIT 5;
-- SELECT * FROM fandom_sections LIMIT 5;
-- SELECT * FROM section_filters LIMIT 5;
-- SELECT * FROM section_items LIMIT 5; 