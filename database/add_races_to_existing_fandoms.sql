-- =====================================================
-- SCRIPT PARA ADICIONAR SEÇÃO DE RAÇAS A FANDOMS EXISTENTES
-- =====================================================
-- Este script adiciona a seção de raças/espécies a todas as fandoms
-- que ainda não possuem essa seção

-- =====================================================
-- ADICIONAR SEÇÃO DE RAÇAS A FANDOMS EXISTENTES
-- =====================================================

-- Inserir seção de raças para fandoms que não possuem
INSERT INTO fandom_sections (
    fandom_page_id,
    section_type,
    section_title,
    section_description,
    section_order,
    is_active
)
SELECT 
    fp.id as fandom_page_id,
    'filter' as section_type,
    'Raças/Espécies' as section_title,
    'Seção para gerenciar raças e espécies da fandom' as section_description,
    3 as section_order, -- Após personagens (2) e antes de regiões (4)
    true as is_active
FROM fandom_pages fp
WHERE NOT EXISTS (
    -- Verifica se já existe uma seção de raças para esta página
    SELECT 1 FROM fandom_sections fs 
    WHERE fs.fandom_page_id = fp.id 
    AND fs.section_title = 'Raças/Espécies'
);

-- =====================================================
-- ATUALIZAR ORDEM DAS SEÇÕES EXISTENTES
-- =====================================================

-- Atualizar ordem da seção de regiões (se existir) para 4
UPDATE fandom_sections 
SET section_order = 4 
WHERE section_title = 'Regiões' 
AND section_order = 3;

-- =====================================================
-- VERIFICAR RESULTADO
-- =====================================================

-- Listar todas as seções de raças criadas
SELECT 
    fs.section_title,
    fs.section_description,
    fs.section_order,
    fs.is_active,
    f.name as fandom_name
FROM fandom_sections fs
JOIN fandom_pages fp ON fs.fandom_page_id = fp.id
JOIN fandoms f ON fp.fandom_id = f.id
WHERE fs.section_title = 'Raças/Espécies'
ORDER BY f.name;

-- Contar quantas seções de raças foram criadas
SELECT 
    COUNT(*) as total_races_sections_created
FROM fandom_sections 
WHERE section_title = 'Raças/Espécies';

-- Verificar ordem das seções em uma fandom específica
-- SELECT 
--     fs.section_title,
--     fs.section_order,
--     f.name as fandom_name
-- FROM fandom_sections fs
-- JOIN fandom_pages fp ON fs.fandom_page_id = fp.id
-- JOIN fandoms f ON fp.fandom_id = f.id
-- WHERE f.name = 'Nome da sua fandom'
-- ORDER BY fs.section_order;

-- =====================================================
-- COMENTÁRIOS:
-- =====================================================

-- ✅ Este script é seguro e pode ser executado múltiplas vezes
-- ✅ Só adiciona a seção se ela não existir
-- ✅ Mantém a ordem correta das seções
-- ✅ Não afeta fandoms que já têm a seção

-- Após executar este script:
-- 1. Todas as fandoms terão a seção "Raças/Espécies"
-- 2. A seção aparecerá na ordem 3 (após personagens)
-- 3. Usuários podem começar a adicionar raças via interface
-- 4. Nenhuma raça padrão será criada 