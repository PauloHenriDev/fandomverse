-- =====================================================
-- DADOS DE TESTE PARA O SISTEMA DE FANDOMS
-- =====================================================
-- Execute este script para adicionar dados de teste
-- e ver o sistema de categorias funcionando

-- =====================================================
-- 1. CRIAR UMA FANDOM DE TESTE
-- =====================================================

-- Substitua 'SEU_USER_ID' pelo ID do seu usuário logado
INSERT INTO fandoms (name, description, creator_id) 
VALUES (
    'Anime Teste',
    'Uma fandom de teste para verificar o sistema de categorias',
    'SEU_USER_ID' -- Substitua pelo seu user_id
) RETURNING id;

-- =====================================================
-- 2. CRIAR PÁGINA PADRÃO PARA A FANDOM
-- =====================================================

-- Execute a função para criar página padrão (substitua o UUID da fandom)
SELECT create_default_fandom_page('UUID_DA_FANDOM_AQUI');

-- =====================================================
-- 3. ADICIONAR PERSONAGENS DE TESTE COM CATEGORIAS
-- =====================================================

-- Primeiro, pegue o ID da seção de personagens
-- SELECT id FROM fandom_sections WHERE section_title = 'Personagens';

-- Depois, adicione os personagens (substitua SECTION_ID pelo ID real)
INSERT INTO section_items (
    section_id, 
    item_type, 
    item_title, 
    item_description, 
    item_color, 
    item_order, 
    custom_data
) VALUES 
    -- Protagonistas
    ('SECTION_ID_AQUI', 'character', 'Heroi Principal', 'O protagonista da história', '#926DF6', 1, '{"categories": ["protagonists"]}'),
    ('SECTION_ID_AQUI', 'character', 'Heroina', 'A heroína da história', '#926DF6', 2, '{"categories": ["protagonists"]}'),
    
    -- Antagonistas
    ('SECTION_ID_AQUI', 'character', 'Vilão Principal', 'O antagonista principal', '#FF6B6B', 3, '{"categories": ["antagonists"]}'),
    ('SECTION_ID_AQUI', 'character', 'Vilão Secundário', 'Um vilão secundário', '#FF6B6B', 4, '{"categories": ["antagonists"]}'),
    
    -- Coadjuvantes
    ('SECTION_ID_AQUI', 'character', 'Amigo do Heroi', 'O melhor amigo do protagonista', '#4ECDC4', 5, '{"categories": ["supporting"]}'),
    ('SECTION_ID_AQUI', 'character', 'Mentor', 'O mentor dos heróis', '#4ECDC4', 6, '{"categories": ["supporting"]}'),
    
    -- Personagens com múltiplas categorias
    ('SECTION_ID_AQUI', 'character', 'Personagem Complexo', 'Um personagem com múltiplas facetas', '#FFE66D', 7, '{"categories": ["protagonists", "supporting"]}'),
    ('SECTION_ID_AQUI', 'character', 'Anti-Heroi', 'Um personagem ambíguo', '#FFE66D', 8, '{"categories": ["protagonists", "antagonists"]}');

-- =====================================================
-- COMO USAR ESTE SCRIPT:
-- =====================================================

-- 1. Substitua 'SEU_USER_ID' pelo seu user_id real
--    (você pode pegar isso no Supabase Dashboard > Authentication > Users)

-- 2. Execute a primeira parte para criar a fandom

-- 3. Pegue o UUID da fandom criada e substitua em 'UUID_DA_FANDOM_AQUI'

-- 4. Execute a função create_default_fandom_page

-- 5. Pegue o ID da seção de personagens e substitua em 'SECTION_ID_AQUI'

-- 6. Execute a inserção dos personagens

-- =====================================================
-- QUERIES ÚTEIS PARA VERIFICAR:
-- =====================================================

-- Ver todas as fandoms
-- SELECT * FROM fandoms;

-- Ver páginas de fandoms
-- SELECT * FROM fandom_pages;

-- Ver seções
-- SELECT * FROM fandom_sections;

-- Ver personagens com categorias
-- SELECT 
--     si.item_title,
--     si.custom_data->>'categories' as categories
-- FROM section_items si
-- WHERE si.item_type = 'character';

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- Após executar este script, você terá:
-- ✅ Uma fandom de teste
-- ✅ Uma página personalizada com seções
-- ✅ 8 personagens distribuídos em categorias
-- ✅ Sistema de filtros funcionando
-- ✅ Máximo de 8 personagens por categoria 