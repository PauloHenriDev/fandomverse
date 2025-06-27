-- =====================================================
-- SCRIPT PARA ADICIONAR FILTROS DE EXEMPLO
-- =====================================================
-- Execute este script após criar uma fandom e sua página
-- para adicionar filtros personalizáveis

-- =====================================================
-- COMO USAR:
-- =====================================================

-- 1. Primeiro, pegue o ID da sua fandom:
-- SELECT id FROM fandoms WHERE name = 'Nome da sua fandom';

-- 2. Pegue o ID da página da fandom:
-- SELECT id FROM fandom_pages WHERE fandom_id = 'UUID_DA_FANDOM';

-- 3. Pegue o ID da seção de personagens:
-- SELECT id FROM fandom_sections WHERE fandom_page_id = 'UUID_DA_PAGINA' AND section_title = 'Personagens';

-- 4. Substitua os UUIDs abaixo pelos IDs reais e execute:

-- =====================================================
-- ADICIONAR FILTROS DE EXEMPLO
-- =====================================================

-- Substitua 'SECTION_ID_AQUI' pelo ID real da seção de personagens
INSERT INTO section_filters (
    section_id,
    filter_label,
    filter_value,
    is_active,
    filter_order,
    filter_color
) VALUES 
    ('SECTION_ID_AQUI', 'Protagonistas', 'protagonists', true, 1, '#926DF6'),
    ('SECTION_ID_AQUI', 'Antagonistas', 'antagonists', true, 2, '#FF6B6B'),
    ('SECTION_ID_AQUI', 'Coadjuvantes', 'supporting', true, 3, '#4ECDC4'),
    ('SECTION_ID_AQUI', 'Vilões', 'villains', true, 4, '#FF4757'),
    ('SECTION_ID_AQUI', 'Mentores', 'mentors', true, 5, '#2ED573'),
    ('SECTION_ID_AQUI', 'Anti-Heróis', 'antiheroes', true, 6, '#FFA502');

-- =====================================================
-- VERIFICAR FILTROS CRIADOS:
-- =====================================================

-- SELECT 
--     sf.filter_label,
--     sf.filter_value,
--     sf.is_active,
--     sf.filter_color
-- FROM section_filters sf
-- JOIN fandom_sections fs ON sf.section_id = fs.id
-- JOIN fandom_pages fp ON fs.fandom_page_id = fp.id
-- JOIN fandoms f ON fp.fandom_id = f.id
-- WHERE f.name = 'Nome da sua fandom'
-- ORDER BY sf.filter_order;

-- =====================================================
-- EXEMPLOS DE FILTROS TEMÁTICOS:
-- =====================================================

-- Para anime/mangá:
-- ('SECTION_ID_AQUI', 'Protagonistas', 'protagonists', true, 1, '#926DF6'),
-- ('SECTION_ID_AQUI', 'Antagonistas', 'antagonists', true, 2, '#FF6B6B'),
-- ('SECTION_ID_AQUI', 'Coadjuvantes', 'supporting', true, 3, '#4ECDC4'),
-- ('SECTION_ID_AQUI', 'Vilões', 'villains', true, 4, '#FF4757'),
-- ('SECTION_ID_AQUI', 'Mentores', 'mentors', true, 5, '#2ED573'),
-- ('SECTION_ID_AQUI', 'Anti-Heróis', 'antiheroes', true, 6, '#FFA502');

-- Para RPG/Fantasia:
-- ('SECTION_ID_AQUI', 'Guerreiros', 'warriors', true, 1, '#FF6B6B'),
-- ('SECTION_ID_AQUI', 'Magos', 'mages', true, 2, '#926DF6'),
-- ('SECTION_ID_AQUI', 'Arqueiros', 'archers', true, 3, '#4ECDC4'),
-- ('SECTION_ID_AQUI', 'Clerigos', 'clerics', true, 4, '#2ED573'),
-- ('SECTION_ID_AQUI', 'Ladinos', 'rogues', true, 5, '#FFA502'),
-- ('SECTION_ID_AQUI', 'NPCs', 'npcs', true, 6, '#747D8C');

-- Para ficção científica:
-- ('SECTION_ID_AQUI', 'Humanos', 'humans', true, 1, '#926DF6'),
-- ('SECTION_ID_AQUI', 'Aliens', 'aliens', true, 2, '#4ECDC4'),
-- ('SECTION_ID_AQUI', 'Robôs', 'robots', true, 3, '#747D8C'),
-- ('SECTION_ID_AQUI', 'Vilões', 'villains', true, 4, '#FF4757'),
-- ('SECTION_ID_AQUI', 'Cientistas', 'scientists', true, 5, '#2ED573'),
-- ('SECTION_ID_AQUI', 'Militares', 'military', true, 6, '#FFA502');

-- =====================================================
-- COMENTÁRIOS:
-- =====================================================

-- ✅ filter_label: Nome que aparece no botão (ex: "Protagonistas")
-- ✅ filter_value: Valor usado internamente (ex: "protagonists")
-- ✅ is_active: Se o filtro está ativo (true/false)
-- ✅ filter_order: Ordem de exibição (1, 2, 3...)
-- ✅ filter_color: Cor do botão (código hexadecimal)

-- Após adicionar os filtros, você pode:
-- 1. Acessar a página de gerenciamento: /fandom/[id]/manage-filters
-- 2. Associar personagens aos filtros
-- 3. Ver os filtros funcionando na página da fandom 