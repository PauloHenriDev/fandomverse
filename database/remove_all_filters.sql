-- =====================================================
-- SCRIPT PARA REMOVER FILTROS COM filter_value = 'all'
-- =====================================================
-- Execute este script para remover filtros que podem estar causando duplicação

-- =====================================================
-- 1. VERIFICAR FILTROS COM filter_value = 'all'
-- =====================================================

SELECT 
    sf.id,
    sf.section_id,
    sf.filter_label,
    sf.filter_value,
    sf.is_active,
    fs.section_title,
    f.name as fandom_name
FROM section_filters sf
JOIN fandom_sections fs ON sf.section_id = fs.id
JOIN fandom_pages fp ON fs.fandom_page_id = fp.id
JOIN fandoms f ON fp.fandom_id = f.id
WHERE sf.filter_value = 'all';

-- =====================================================
-- 2. REMOVER FILTROS COM filter_value = 'all'
-- =====================================================

-- ATENÇÃO: Execute apenas se encontrar filtros com filter_value = 'all'
-- O botão "Todos" é criado automaticamente pelo código JavaScript

DELETE FROM section_filters 
WHERE filter_value = 'all';

-- =====================================================
-- 3. VERIFICAR RESULTADO
-- =====================================================

-- Verificar se ainda há filtros com filter_value = 'all'
SELECT 
    sf.id,
    sf.section_id,
    sf.filter_label,
    sf.filter_value,
    sf.is_active
FROM section_filters sf
WHERE sf.filter_value = 'all';

-- =====================================================
-- 4. VERIFICAR TODOS OS FILTROS RESTANTES
-- =====================================================

SELECT 
    sf.id,
    sf.section_id,
    sf.filter_label,
    sf.filter_value,
    sf.is_active,
    sf.filter_order,
    fs.section_title,
    f.name as fandom_name
FROM section_filters sf
JOIN fandom_sections fs ON sf.section_id = fs.id
JOIN fandom_pages fp ON fs.fandom_page_id = fp.id
JOIN fandoms f ON fp.fandom_id = f.id
WHERE sf.is_active = true
ORDER BY f.name, fs.section_title, sf.filter_order;

-- =====================================================
-- COMENTÁRIOS:
-- =====================================================

-- ✅ O botão "Todos" é criado automaticamente pelo código JavaScript
-- ✅ Não deve existir no banco de dados para evitar duplicação
-- ✅ Execute este script se encontrar filtros com filter_value = 'all'
-- ✅ Após executar, teste a aplicação para confirmar que o problema foi resolvido 