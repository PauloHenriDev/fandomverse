-- Script para adicionar manualmente a seção de raças para fandoms que não a têm
-- Execute este script se a seção de raças não foi criada automaticamente

-- Primeiro, vamos verificar quais fandoms não têm a seção de raças
WITH fandoms_without_races AS (
  SELECT 
    f.id as fandom_id,
    f.name as fandom_name,
    fp.id as page_id,
    fp.page_title
  FROM fandoms f
  JOIN fandom_pages fp ON f.id = fp.fandom_id
  WHERE NOT EXISTS (
    SELECT 1 
    FROM fandom_sections fs 
    WHERE fs.fandom_page_id = fp.id 
    AND fs.section_title = 'Raças/Espécies'
  )
)
-- Agora vamos adicionar a seção de raças para essas fandoms
INSERT INTO fandom_sections (
  fandom_page_id,
  section_type,
  section_title,
  section_description,
  section_order,
  is_active,
  custom_content
)
SELECT 
  fwr.page_id,
  'races',
  'Raças/Espécies',
  'Seção para gerenciar raças e espécies da fandom',
  COALESCE(
    (SELECT MAX(section_order) + 1 
     FROM fandom_sections 
     WHERE fandom_page_id = fwr.page_id), 
    2
  ),
  true,
  '{}'
FROM fandoms_without_races fwr;

-- Verificar o resultado
SELECT 
  f.name as fandom_name,
  fp.page_title,
  fs.section_title,
  fs.section_order,
  fs.is_active
FROM fandoms f
JOIN fandom_pages fp ON f.id = fp.fandom_id
JOIN fandom_sections fs ON fp.id = fs.fandom_page_id
WHERE fs.section_title = 'Raças/Espécies'
ORDER BY f.name; 