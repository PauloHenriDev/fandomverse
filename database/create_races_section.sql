-- =====================================================
-- SCRIPT PARA CRIAR SEÇÃO DE RAÇAS/ESPÉCIES
-- =====================================================
-- Este script cria a seção de raças/espécies para uma fandom existente
-- Execute após criar uma fandom e sua página

-- =====================================================
-- COMO USAR:
-- =====================================================

-- 1. Primeiro, pegue o ID da sua fandom:
-- SELECT id FROM fandoms WHERE name = 'Nome da sua fandom';

-- 2. Pegue o ID da página da fandom:
-- SELECT id FROM fandom_pages WHERE fandom_id = 'UUID_DA_FANDOM';

-- 3. Substitua os UUIDs abaixo pelos IDs reais e execute:

-- =====================================================
-- CRIAR SEÇÃO DE RAÇAS/ESPÉCIES
-- =====================================================

-- Substitua 'PAGE_ID_AQUI' pelo ID real da página da fandom
INSERT INTO fandom_sections (
    fandom_page_id,
    section_type,
    section_title,
    section_description,
    section_order,
    is_active
) VALUES (
    'PAGE_ID_AQUI',
    'filter',
    'Raças/Espécies',
    'Seção para gerenciar raças e espécies da fandom',
    2, -- Ordem após a seção de personagens
    true
);

-- =====================================================
-- ADICIONAR FILTROS PARA RAÇAS/ESPÉCIES
-- =====================================================

-- Primeiro, pegue o ID da seção de raças que acabamos de criar:
-- SELECT id FROM fandom_sections WHERE fandom_page_id = 'PAGE_ID_AQUI' AND section_title = 'Raças/Espécies';

-- Substitua 'RACES_SECTION_ID_AQUI' pelo ID real da seção de raças
INSERT INTO section_filters (
    section_id,
    filter_label,
    filter_value,
    is_active,
    filter_order,
    filter_color
) VALUES 
    ('RACES_SECTION_ID_AQUI', 'Humanoides', 'humanoids', true, 1, '#926DF6'),
    ('RACES_SECTION_ID_AQUI', 'Bestiais', 'beastial', true, 2, '#FF6B6B'),
    ('RACES_SECTION_ID_AQUI', 'Místicos', 'mystical', true, 3, '#4ECDC4'),
    ('RACES_SECTION_ID_AQUI', 'Mecânicos', 'mechanical', true, 4, '#747D8C'),
    ('RACES_SECTION_ID_AQUI', 'Elementais', 'elemental', true, 5, '#2ED573'),
    ('RACES_SECTION_ID_AQUI', 'Híbridos', 'hybrid', true, 6, '#FFA502');

-- =====================================================
-- ADICIONAR RAÇAS DE EXEMPLO
-- =====================================================

-- Substitua 'RACES_SECTION_ID_AQUI' pelo ID real da seção de raças
INSERT INTO section_items (
    section_id,
    item_type,
    item_title,
    item_description,
    item_image_url,
    item_color,
    item_order,
    is_active,
    custom_data
) VALUES 
    ('RACES_SECTION_ID_AQUI', 'race', 'Humano', 'A raça mais comum e versátil. Adaptável a qualquer situação e capaz de aprender rapidamente.', '', '#4CAF50', 1, true, '{"categories": ["humanoids"]}'),
    
    ('RACES_SECTION_ID_AQUI', 'race', 'Elfo', 'Seres místicos com longa vida. Conhecidos por sua graça, inteligência e conexão com a natureza.', '', '#2196F3', 2, true, '{"categories": ["humanoids", "mystical"]}'),
    
    ('RACES_SECTION_ID_AQUI', 'race', 'Anão', 'Especialistas em mineração e forja. Baixos, resistentes e com grande habilidade artesanal.', '', '#FF9800', 3, true, '{"categories": ["humanoids"]}'),
    
    ('RACES_SECTION_ID_AQUI', 'race', 'Orc', 'Guerreiros ferozes e resistentes. Conhecidos por sua força bruta e coragem em batalha.', '', '#9C27B0', 4, true, '{"categories": ["humanoids", "beastial"]}'),
    
    ('RACES_SECTION_ID_AQUI', 'race', 'Centauro', 'Criaturas metade humano, metade cavalo. Excelentes arqueiros e guerreiros montados.', '', '#795548', 5, true, '{"categories": ["beastial", "hybrid"]}'),
    
    ('RACES_SECTION_ID_AQUI', 'race', 'Dragão', 'Criaturas majestosas e poderosas. Capazes de voar e respirar fogo, são temidos e respeitados.', '', '#F44336', 6, true, '{"categories": ["mystical", "elemental"]}'),
    
    ('RACES_SECTION_ID_AQUI', 'race', 'Robô', 'Seres mecânicos criados artificialmente. Programados para funções específicas.', '', '#607D8B', 7, true, '{"categories": ["mechanical"]}'),
    
    ('RACES_SECTION_ID_AQUI', 'race', 'Fada', 'Pequenas criaturas mágicas. Conhecidas por sua beleza e poderes de ilusão.', '', '#E91E63', 8, true, '{"categories": ["mystical", "elemental"]}');

-- =====================================================
-- VERIFICAR DADOS CRIADOS:
-- =====================================================

-- Verificar seção criada:
-- SELECT 
--     fs.section_title,
--     fs.section_description,
--     fs.section_order,
--     fs.is_active
-- FROM fandom_sections fs
-- JOIN fandom_pages fp ON fs.fandom_page_id = fp.id
-- JOIN fandoms f ON fp.fandom_id = f.id
-- WHERE f.name = 'Nome da sua fandom' AND fs.section_title = 'Raças/Espécies';

-- Verificar filtros criados:
-- SELECT 
--     sf.filter_label,
--     sf.filter_value,
--     sf.is_active,
--     sf.filter_color
-- FROM section_filters sf
-- JOIN fandom_sections fs ON sf.section_id = fs.id
-- JOIN fandom_pages fp ON fs.fandom_page_id = fp.id
-- JOIN fandoms f ON fp.fandom_id = f.id
-- WHERE f.name = 'Nome da sua fandom' AND fs.section_title = 'Raças/Espécies'
-- ORDER BY sf.filter_order;

-- Verificar raças criadas:
-- SELECT 
--     si.item_title,
--     si.item_description,
--     si.item_color,
--     si.custom_data
-- FROM section_items si
-- JOIN fandom_sections fs ON si.section_id = fs.id
-- JOIN fandom_pages fp ON fs.fandom_page_id = fp.id
-- JOIN fandoms f ON fp.fandom_id = f.id
-- WHERE f.name = 'Nome da sua fandom' AND fs.section_title = 'Raças/Espécies'
-- ORDER BY si.item_order;

-- =====================================================
-- EXEMPLOS DE FILTROS TEMÁTICOS PARA DIFERENTES TIPOS DE FANDOM:
-- =====================================================

-- Para RPG/Fantasia:
-- ('RACES_SECTION_ID_AQUI', 'Humanoides', 'humanoids', true, 1, '#926DF6'),
-- ('RACES_SECTION_ID_AQUI', 'Bestiais', 'beastial', true, 2, '#FF6B6B'),
-- ('RACES_SECTION_ID_AQUI', 'Místicos', 'mystical', true, 3, '#4ECDC4'),
-- ('RACES_SECTION_ID_AQUI', 'Elementais', 'elemental', true, 4, '#2ED573'),
-- ('RACES_SECTION_ID_AQUI', 'Híbridos', 'hybrid', true, 5, '#FFA502'),
-- ('RACES_SECTION_ID_AQUI', 'Mortos-Vivos', 'undead', true, 6, '#9C27B0');

-- Para ficção científica:
-- ('RACES_SECTION_ID_AQUI', 'Humanos', 'humans', true, 1, '#926DF6'),
-- ('RACES_SECTION_ID_AQUI', 'Aliens', 'aliens', true, 2, '#4ECDC4'),
-- ('RACES_SECTION_ID_AQUI', 'Robôs', 'robots', true, 3, '#747D8C'),
-- ('RACES_SECTION_ID_AQUI', 'Ciborgues', 'cyborgs', true, 4, '#FFA502'),
-- ('RACES_SECTION_ID_AQUI', 'Androides', 'androids', true, 5, '#2ED573'),
-- ('RACES_SECTION_ID_AQUI', 'Espécies Híbridas', 'hybrid_species', true, 6, '#9C27B0');

-- Para anime/mangá:
-- ('RACES_SECTION_ID_AQUI', 'Humanos', 'humans', true, 1, '#926DF6'),
-- ('RACES_SECTION_ID_AQUI', 'Demônios', 'demons', true, 2, '#FF6B6B'),
-- ('RACES_SECTION_ID_AQUI', 'Anjos', 'angels', true, 3, '#4ECDC4'),
-- ('RACES_SECTION_ID_AQUI', 'Espíritos', 'spirits', true, 4, '#2ED573'),
-- ('RACES_SECTION_ID_AQUI', 'Criaturas Mágicas', 'magical_creatures', true, 5, '#FFA502'),
-- ('RACES_SECTION_ID_AQUI', 'Híbridos', 'hybrids', true, 6, '#9C27B0');

-- =====================================================
-- COMENTÁRIOS:
-- =====================================================

-- ✅ section_type: 'filter' para seções com filtros
-- ✅ section_order: 2 (após personagens que é 1)
-- ✅ item_type: 'race' para identificar itens como raças
-- ✅ custom_data: JSON com categorias para filtros
-- ✅ filter_value: Usado internamente para filtrar
-- ✅ filter_label: Nome que aparece no botão

-- Após executar este script, você pode:
-- 1. Acessar a página da fandom e ver a seção de raças
-- 2. Usar os filtros para categorizar as raças
-- 3. Adicionar novas raças via interface
-- 4. Editar raças existentes
-- 5. Gerenciar filtros em /fandom/[id]/manage-filters 