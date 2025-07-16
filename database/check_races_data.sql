-- =====================================================
-- SCRIPT PARA VERIFICAR E GERENCIAR DADOS DE RAÇAS
-- =====================================================
-- Este script permite verificar, listar e limpar dados de raças
-- Útil para debugging e manutenção

-- =====================================================
-- VERIFICAR SEÇÕES DE RAÇAS EXISTENTES
-- =====================================================

-- Listar todas as seções de raças/espécies
SELECT 
    fs.id as section_id,
    fs.section_title,
    fs.section_description,
    fs.section_order,
    fs.is_active,
    fp.id as page_id,
    f.name as fandom_name,
    f.id as fandom_id
FROM fandom_sections fs
JOIN fandom_pages fp ON fs.fandom_page_id = fp.id
JOIN fandoms f ON fp.fandom_id = f.id
WHERE fs.section_title = 'Raças/Espécies'
ORDER BY f.name, fs.section_order;

-- =====================================================
-- VERIFICAR FILTROS DE RAÇAS
-- =====================================================

-- Listar filtros de uma seção específica (substitua SECTION_ID)
-- SELECT 
--     sf.id as filter_id,
--     sf.filter_label,
--     sf.filter_value,
--     sf.is_active,
--     sf.filter_order,
--     sf.filter_color,
--     fs.section_title,
--     f.name as fandom_name
-- FROM section_filters sf
-- JOIN fandom_sections fs ON sf.section_id = fs.id
-- JOIN fandom_pages fp ON fs.fandom_page_id = fp.id
-- JOIN fandoms f ON fp.fandom_id = f.id
-- WHERE fs.id = 'SECTION_ID_AQUI'
-- ORDER BY sf.filter_order;

-- Listar todos os filtros de raças
SELECT 
    sf.id as filter_id,
    sf.filter_label,
    sf.filter_value,
    sf.is_active,
    sf.filter_order,
    sf.filter_color,
    fs.section_title,
    f.name as fandom_name
FROM section_filters sf
JOIN fandom_sections fs ON sf.section_id = fs.id
JOIN fandom_pages fp ON fs.fandom_page_id = fp.id
JOIN fandoms f ON fp.fandom_id = f.id
WHERE fs.section_title = 'Raças/Espécies'
ORDER BY f.name, sf.filter_order;

-- =====================================================
-- VERIFICAR RAÇAS EXISTENTES
-- =====================================================

-- Listar todas as raças de uma seção específica (substitua SECTION_ID)
-- SELECT 
--     si.id as race_id,
--     si.item_title as race_name,
--     si.item_description,
--     si.item_color,
--     si.item_order,
--     si.is_active,
--     si.custom_data,
--     fs.section_title,
--     f.name as fandom_name
-- FROM section_items si
-- JOIN fandom_sections fs ON si.section_id = fs.id
-- JOIN fandom_pages fp ON fs.fandom_page_id = fp.id
-- JOIN fandoms f ON fp.fandom_id = f.id
-- WHERE fs.id = 'SECTION_ID_AQUI' AND si.item_type = 'race'
-- ORDER BY si.item_order;

-- Listar todas as raças de todas as fandoms
SELECT 
    si.id as race_id,
    si.item_title as race_name,
    si.item_description,
    si.item_color,
    si.item_order,
    si.is_active,
    si.custom_data,
    fs.section_title,
    f.name as fandom_name
FROM section_items si
JOIN fandom_sections fs ON si.section_id = fs.id
JOIN fandom_pages fp ON fs.fandom_page_id = fp.id
JOIN fandoms f ON fp.fandom_id = f.id
WHERE fs.section_title = 'Raças/Espécies' AND si.item_type = 'race'
ORDER BY f.name, si.item_order;

-- =====================================================
-- VERIFICAR RAÇAS POR CATEGORIA
-- =====================================================

-- Contar raças por categoria
SELECT 
    f.name as fandom_name,
    jsonb_array_elements_text(si.custom_data->'categories') as category,
    COUNT(*) as race_count
FROM section_items si
JOIN fandom_sections fs ON si.section_id = fs.id
JOIN fandom_pages fp ON fs.fandom_page_id = fp.id
JOIN fandoms f ON fp.fandom_id = f.id
WHERE fs.section_title = 'Raças/Espécies' 
    AND si.item_type = 'race' 
    AND si.is_active = true
GROUP BY f.name, jsonb_array_elements_text(si.custom_data->'categories')
ORDER BY f.name, category;

-- =====================================================
-- VERIFICAR RAÇAS SEM CATEGORIAS
-- =====================================================

-- Encontrar raças sem categorias definidas
SELECT 
    si.id as race_id,
    si.item_title as race_name,
    si.custom_data,
    f.name as fandom_name
FROM section_items si
JOIN fandom_sections fs ON si.section_id = fs.id
JOIN fandom_pages fp ON fs.fandom_page_id = fp.id
JOIN fandoms f ON fp.fandom_id = f.id
WHERE fs.section_title = 'Raças/Espécies' 
    AND si.item_type = 'race'
    AND (si.custom_data IS NULL OR si.custom_data->'categories' IS NULL OR jsonb_array_length(si.custom_data->'categories') = 0);

-- =====================================================
-- VERIFICAR RAÇAS SEM IMAGENS
-- =====================================================

-- Encontrar raças sem imagens
SELECT 
    si.id as race_id,
    si.item_title as race_name,
    si.item_image_url,
    f.name as fandom_name
FROM section_items si
JOIN fandom_sections fs ON si.section_id = fs.id
JOIN fandom_pages fp ON fs.fandom_page_id = fp.id
JOIN fandoms f ON fp.fandom_id = f.id
WHERE fs.section_title = 'Raças/Espécies' 
    AND si.item_type = 'race'
    AND (si.item_image_url IS NULL OR si.item_image_url = '');

-- =====================================================
-- OPERAÇÕES DE LIMPEZA (CUIDADO!)
-- =====================================================

-- ⚠️ ATENÇÃO: Execute apenas se necessário!

-- Remover todas as raças de uma seção específica
-- DELETE FROM section_items 
-- WHERE section_id = 'SECTION_ID_AQUI' AND item_type = 'race';

-- Remover todos os filtros de uma seção específica
-- DELETE FROM section_filters 
-- WHERE section_id = 'SECTION_ID_AQUI';

-- Remover uma seção de raças específica (remove também filtros e raças)
-- DELETE FROM fandom_sections 
-- WHERE id = 'SECTION_ID_AQUI' AND section_title = 'Raças/Espécies';

-- =====================================================
-- OPERAÇÕES DE MANUTENÇÃO
-- =====================================================

-- Atualizar ordem das raças (se necessário)
-- UPDATE section_items 
-- SET item_order = item_order + 1 
-- WHERE section_id = 'SECTION_ID_AQUI' AND item_type = 'race' AND item_order >= 5;

-- Ativar/desativar uma raça específica
-- UPDATE section_items 
-- SET is_active = false 
-- WHERE id = 'RACE_ID_AQUI';

-- Ativar/desativar um filtro específico
-- UPDATE section_filters 
-- SET is_active = false 
-- WHERE id = 'FILTER_ID_AQUI';

-- =====================================================
-- VERIFICAR INTEGRIDADE DOS DADOS
-- =====================================================

-- Verificar seções órfãs (sem página)
SELECT 
    fs.id as section_id,
    fs.section_title,
    fs.fandom_page_id
FROM fandom_sections fs
LEFT JOIN fandom_pages fp ON fs.fandom_page_id = fp.id
WHERE fp.id IS NULL;

-- Verificar filtros órfãos (sem seção)
SELECT 
    sf.id as filter_id,
    sf.filter_label,
    sf.section_id
FROM section_filters sf
LEFT JOIN fandom_sections fs ON sf.section_id = fs.id
WHERE fs.id IS NULL;

-- Verificar raças órfãs (sem seção)
SELECT 
    si.id as race_id,
    si.item_title,
    si.section_id
FROM section_items si
LEFT JOIN fandom_sections fs ON si.section_id = fs.id
WHERE fs.id IS NULL AND si.item_type = 'race';

-- =====================================================
-- ESTATÍSTICAS GERAIS
-- =====================================================

-- Contar total de seções de raças
SELECT 
    COUNT(*) as total_races_sections
FROM fandom_sections 
WHERE section_title = 'Raças/Espécies';

-- Contar total de raças
SELECT 
    COUNT(*) as total_races
FROM section_items si
JOIN fandom_sections fs ON si.section_id = fs.id
WHERE fs.section_title = 'Raças/Espécies' AND si.item_type = 'race';

-- Contar total de filtros de raças
SELECT 
    COUNT(*) as total_race_filters
FROM section_filters sf
JOIN fandom_sections fs ON sf.section_id = fs.id
WHERE fs.section_title = 'Raças/Espécies';

-- Contar raças por fandom
SELECT 
    f.name as fandom_name,
    COUNT(*) as race_count
FROM section_items si
JOIN fandom_sections fs ON si.section_id = fs.id
JOIN fandom_pages fp ON fs.fandom_page_id = fp.id
JOIN fandoms f ON fp.fandom_id = f.id
WHERE fs.section_title = 'Raças/Espécies' AND si.item_type = 'race'
GROUP BY f.name
ORDER BY race_count DESC; 