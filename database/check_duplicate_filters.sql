-- =====================================================
-- SCRIPT PARA VERIFICAR E LIMPAR FILTROS DUPLICADOS
-- =====================================================
-- Execute este script para identificar e corrigir filtros duplicados

-- =====================================================
-- 1. VERIFICAR FILTROS DUPLICADOS
-- =====================================================

-- Ver todos os filtros existentes
SELECT 
    sf.id,
    sf.section_id,
    sf.filter_label,
    sf.filter_value,
    sf.is_active,
    sf.filter_order,
    fs.section_title,
    fp.page_title,
    f.name as fandom_name
FROM section_filters sf
JOIN fandom_sections fs ON sf.section_id = fs.id
JOIN fandom_pages fp ON fs.fandom_page_id = fp.id
JOIN fandoms f ON fp.fandom_id = f.id
ORDER BY f.name, sf.filter_order;

-- =====================================================
-- 2. IDENTIFICAR FILTROS DUPLICADOS POR SEÇÃO
-- =====================================================

-- Verificar se há filtros com o mesmo filter_value na mesma seção
SELECT 
    sf.section_id,
    sf.filter_value,
    sf.filter_label,
    COUNT(*) as quantidade
FROM section_filters sf
WHERE sf.is_active = true
GROUP BY sf.section_id, sf.filter_value, sf.filter_label
HAVING COUNT(*) > 1
ORDER BY sf.section_id, sf.filter_value;

-- =====================================================
-- 3. LIMPAR FILTROS DUPLICADOS (MANTENHA APENAS O PRIMEIRO)
-- =====================================================

-- ATENÇÃO: Execute apenas se encontrar duplicados!
-- Este comando remove filtros duplicados mantendo apenas o primeiro de cada grupo

-- DELETE FROM section_filters 
-- WHERE id IN (
--     SELECT id FROM (
--         SELECT id,
--                ROW_NUMBER() OVER (
--                    PARTITION BY section_id, filter_value 
--                    ORDER BY filter_order, id
--                ) as rn
--         FROM section_filters
--         WHERE is_active = true
--     ) ranked
--     WHERE rn > 1
-- );

-- =====================================================
-- 4. VERIFICAR SE HÁ FILTROS COM filter_value = 'all'
-- =====================================================

-- Verificar se há filtros com valor 'all' que podem estar causando conflito
SELECT 
    sf.id,
    sf.section_id,
    sf.filter_label,
    sf.filter_value,
    fs.section_title,
    f.name as fandom_name
FROM section_filters sf
JOIN fandom_sections fs ON sf.section_id = fs.id
JOIN fandom_pages fp ON fs.fandom_page_id = fp.id
JOIN fandoms f ON fp.fandom_id = f.id
WHERE sf.filter_value = 'all';

-- =====================================================
-- 5. REMOVER FILTROS COM filter_value = 'all' (SE EXISTIREM)
-- =====================================================

-- ATENÇÃO: Execute apenas se encontrar filtros com filter_value = 'all'
-- O botão "Todos" é criado automaticamente pelo código

-- DELETE FROM section_filters 
-- WHERE filter_value = 'all';

-- =====================================================
-- 6. VERIFICAR RESULTADO FINAL
-- =====================================================

-- Após limpar, verifique novamente os filtros
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

-- ✅ Execute primeiro as consultas de verificação (1, 2, 4)
-- ✅ Se encontrar duplicados, execute o comando de limpeza (3)
-- ✅ Se encontrar filtros com filter_value = 'all', remova-os (5)
-- ✅ Verifique o resultado final (6)
-- ✅ Teste a aplicação para confirmar que o problema foi resolvido

-- O botão "Todos" é criado automaticamente pelo código JavaScript
-- e não deve existir no banco de dados para evitar duplicação 