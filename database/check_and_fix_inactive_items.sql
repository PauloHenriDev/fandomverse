-- =====================================================
-- SCRIPT PARA VERIFICAR E CORRIGIR ITENS INATIVOS
-- =====================================================
-- Este script verifica se há itens (raças/personagens) inativos
-- e os corrige para ativos, já que eles devem sempre estar ativos

-- =====================================================
-- VERIFICAR ITENS INATIVOS
-- =====================================================

-- Verificar quantos itens estão inativos
SELECT 
    COUNT(*) as total_inactive_items
FROM section_items 
WHERE is_active = false;

-- Listar itens inativos
SELECT 
    si.item_title,
    si.item_type,
    si.is_active,
    fs.section_title,
    f.name as fandom_name
FROM section_items si
JOIN fandom_sections fs ON si.section_id = fs.id
JOIN fandom_pages fp ON fs.fandom_page_id = fp.id
JOIN fandoms f ON fp.fandom_id = f.id
WHERE si.is_active = false
ORDER BY f.name, fs.section_title, si.item_title;

-- =====================================================
-- CORRIGIR ITENS INATIVOS
-- =====================================================

-- Atualizar todos os itens inativos para ativos
UPDATE section_items 
SET is_active = true 
WHERE is_active = false;

-- =====================================================
-- VERIFICAR RESULTADO
-- =====================================================

-- Verificar quantos itens estão ativos agora
SELECT 
    COUNT(*) as total_active_items
FROM section_items 
WHERE is_active = true;

-- Listar alguns itens ativos para verificação
SELECT 
    si.item_title,
    si.item_type,
    si.is_active,
    fs.section_title,
    f.name as fandom_name
FROM section_items si
JOIN fandom_sections fs ON si.section_id = fs.id
JOIN fandom_pages fp ON fs.fandom_page_id = fp.id
JOIN fandoms f ON fp.fandom_id = f.id
WHERE si.is_active = true
ORDER BY f.name, fs.section_title, si.item_title
LIMIT 20;

-- =====================================================
-- VERIFICAR SE AINDA HÁ ITENS INATIVOS
-- =====================================================

-- Confirmar que não há mais itens inativos
SELECT 
    COUNT(*) as remaining_inactive_items
FROM section_items 
WHERE is_active = false;

-- =====================================================
-- ESTATÍSTICAS GERAIS
-- =====================================================

-- Contar itens por tipo
SELECT 
    si.item_type,
    COUNT(*) as total_items,
    COUNT(CASE WHEN si.is_active = true THEN 1 END) as active_items,
    COUNT(CASE WHEN si.is_active = false THEN 1 END) as inactive_items
FROM section_items si
GROUP BY si.item_type
ORDER BY si.item_type;

-- Contar itens por seção
SELECT 
    fs.section_title,
    si.item_type,
    COUNT(*) as total_items,
    COUNT(CASE WHEN si.is_active = true THEN 1 END) as active_items
FROM section_items si
JOIN fandom_sections fs ON si.section_id = fs.id
GROUP BY fs.section_title, si.item_type
ORDER BY fs.section_title, si.item_type;

-- =====================================================
-- COMENTÁRIOS:
-- =====================================================

-- ✅ Todos os itens agora devem estar ativos
-- ✅ Novos itens criados via interface também serão ativos
-- ✅ A estrutura do banco já estava correta para section_items (DEFAULT true)
-- ✅ Este script garante que itens existentes também estejam ativos 