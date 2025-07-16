-- =====================================================
-- SCRIPT PARA CONFIGURAR ESTRUTURA DE RAÇAS/ESPÉCIES
-- =====================================================
-- Este script apenas cria a seção e estrutura necessária
-- SEM adicionar raças ou filtros padrão
-- Os usuários criarão suas próprias raças via interface

-- =====================================================
-- COMO USAR:
-- =====================================================

-- 1. Primeiro, pegue o ID da sua fandom:
-- SELECT id FROM fandoms WHERE name = 'Nome da sua fandom';

-- 2. Pegue o ID da página da fandom:
-- SELECT id FROM fandom_pages WHERE fandom_id = 'UUID_DA_FANDOM';

-- 3. Substitua 'PAGE_ID_AQUI' pelo ID real e execute:

-- =====================================================
-- CRIAR APENAS A SEÇÃO DE RAÇAS/ESPÉCIES
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
-- VERIFICAR SE A SEÇÃO FOI CRIADA:
-- =====================================================

-- SELECT 
--     fs.section_title,
--     fs.section_description,
--     fs.section_order,
--     fs.is_active,
--     f.name as fandom_name
-- FROM fandom_sections fs
-- JOIN fandom_pages fp ON fs.fandom_page_id = fp.id
-- JOIN fandoms f ON fp.fandom_id = f.id
-- WHERE fs.section_title = 'Raças/Espécies';

-- =====================================================
-- COMENTÁRIOS:
-- =====================================================

-- ✅ Apenas a seção é criada
-- ✅ Nenhuma raça ou filtro padrão é adicionado
-- ✅ Os usuários criarão suas próprias raças via interface
-- ✅ Os filtros serão criados conforme necessário

-- Após executar este script, você pode:
-- 1. Acessar a página da fandom e ver a seção "Raças/Espécies"
-- 2. Usar o botão "Adicionar Raça" para criar raças
-- 3. Criar filtros conforme necessário
-- 4. Editar e gerenciar raças via interface 