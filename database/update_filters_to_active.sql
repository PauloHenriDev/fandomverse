-- =====================================================
-- SCRIPT PARA ATUALIZAR FILTROS PARA ATIVOS
-- =====================================================
-- Este script atualiza todos os filtros existentes para is_active = true
-- Execute este script após corrigir a estrutura do banco

-- =====================================================
-- ATUALIZAR FILTROS EXISTENTES
-- =====================================================

-- Atualizar todos os filtros para is_active = true
UPDATE section_filters 
SET is_active = true 
WHERE is_active = false;

-- =====================================================
-- VERIFICAR RESULTADO
-- =====================================================

-- Verificar quantos filtros foram atualizados
SELECT 
    COUNT(*) as total_filters_updated
FROM section_filters 
WHERE is_active = true;

-- Listar todos os filtros ativos
SELECT 
    sf.filter_label,
    sf.filter_value,
    sf.is_active,
    sf.filter_color,
    fs.section_title,
    f.name as fandom_name
FROM section_filters sf
JOIN fandom_sections fs ON sf.section_id = fs.id
JOIN fandom_pages fp ON fs.fandom_page_id = fp.id
JOIN fandoms f ON fp.fandom_id = f.id
WHERE sf.is_active = true
ORDER BY f.name, fs.section_title, sf.filter_order;

-- =====================================================
-- VERIFICAR SE HÁ FILTROS INATIVOS RESTANTES
-- =====================================================

-- Verificar se ainda existem filtros inativos
SELECT 
    COUNT(*) as remaining_inactive_filters
FROM section_filters 
WHERE is_active = false;

-- Se houver filtros inativos, listá-los
SELECT 
    sf.filter_label,
    sf.filter_value,
    sf.is_active,
    fs.section_title,
    f.name as fandom_name
FROM section_filters sf
JOIN fandom_sections fs ON sf.section_id = fs.id
JOIN fandom_pages fp ON fs.fandom_page_id = fp.id
JOIN fandoms f ON fp.fandom_id = f.id
WHERE sf.is_active = false
ORDER BY f.name, fs.section_title;

-- =====================================================
-- COMENTÁRIOS:
-- =====================================================

-- ✅ Todos os filtros agora devem estar ativos por padrão
-- ✅ Novos filtros criados via interface também serão ativos
-- ✅ A estrutura do banco foi corrigida para DEFAULT true 