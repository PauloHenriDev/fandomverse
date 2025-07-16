-- Script para verificar se a seção de raças existe em todas as fandoms
-- Execute este script para verificar o status das seções de raças

-- Verificar todas as fandoms que têm páginas
SELECT 
  f.id as fandom_id,
  f.name as fandom_name,
  fp.id as page_id,
  fp.page_title
FROM fandoms f
LEFT JOIN fandom_pages fp ON f.id = fp.fandom_id
ORDER BY f.name;

-- Verificar seções existentes para cada fandom
SELECT 
  f.name as fandom_name,
  fp.page_title,
  fs.section_title,
  fs.section_order,
  fs.is_active
FROM fandoms f
JOIN fandom_pages fp ON f.id = fp.fandom_id
LEFT JOIN fandom_sections fs ON fp.id = fs.fandom_page_id
ORDER BY f.name, fs.section_order;

-- Verificar especificamente a seção de raças
SELECT 
  f.name as fandom_name,
  fp.page_title,
  fs.id as section_id,
  fs.section_title,
  fs.section_order,
  fs.is_active,
  COUNT(si.id) as total_races
FROM fandoms f
JOIN fandom_pages fp ON f.id = fp.fandom_id
LEFT JOIN fandom_sections fs ON fp.id = fs.fandom_page_id AND fs.section_title = 'Raças/Espécies'
LEFT JOIN section_items si ON fs.id = si.section_id AND si.item_type = 'race'
GROUP BY f.name, fp.page_title, fs.id, fs.section_title, fs.section_order, fs.is_active
ORDER BY f.name;

-- Verificar fandoms que NÃO têm a seção de raças
SELECT 
  f.name as fandom_name,
  fp.page_title,
  fp.id as page_id
FROM fandoms f
JOIN fandom_pages fp ON f.id = fp.fandom_id
WHERE NOT EXISTS (
  SELECT 1 
  FROM fandom_sections fs 
  WHERE fs.fandom_page_id = fp.id 
  AND fs.section_title = 'Raças/Espécies'
)
ORDER BY f.name; 