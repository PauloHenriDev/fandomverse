-- =====================================================
-- SCRIPT PARA ADICIONAR RAÇAS DE EXEMPLO
-- =====================================================
-- Este script adiciona raças de exemplo para diferentes tipos de fandoms
-- Execute após criar a seção de raças/espécies

-- =====================================================
-- COMO USAR:
-- =====================================================

-- 1. Primeiro, pegue o ID da seção de raças:
-- SELECT id FROM fandom_sections WHERE section_title = 'Raças/Espécies';

-- 2. Substitua 'RACES_SECTION_ID_AQUI' pelo ID real e execute:

-- =====================================================
-- RAÇAS PARA RPG/FANTASIA
-- =====================================================

-- Substitua 'RACES_SECTION_ID_AQUI' pelo ID real da seção de raças
INSERT INTO section_items (
    section_id,
    item_type,
    item_title,
    item_description,
    item_image_url,
    item_color,
    item_order,
    is_active,
    custom_data
) VALUES 
    -- Humanoides
    ('RACES_SECTION_ID_AQUI', 'race', 'Humano', 'A raça mais comum e versátil. Adaptável a qualquer situação e capaz de aprender rapidamente.', '', '#4CAF50', 1, true, '{"categories": ["humanoids"]}'),
    ('RACES_SECTION_ID_AQUI', 'race', 'Elfo', 'Seres místicos com longa vida. Conhecidos por sua graça, inteligência e conexão com a natureza.', '', '#2196F3', 2, true, '{"categories": ["humanoids", "mystical"]}'),
    ('RACES_SECTION_ID_AQUI', 'race', 'Anão', 'Especialistas em mineração e forja. Baixos, resistentes e com grande habilidade artesanal.', '', '#FF9800', 3, true, '{"categories": ["humanoids"]}'),
    ('RACES_SECTION_ID_AQUI', 'race', 'Halfling', 'Pequenos e ágeis. Conhecidos por sua sorte e habilidade em se esconder.', '', '#8BC34A', 4, true, '{"categories": ["humanoids"]}'),
    
    -- Bestiais
    ('RACES_SECTION_ID_AQUI', 'race', 'Orc', 'Guerreiros ferozes e resistentes. Conhecidos por sua força bruta e coragem em batalha.', '', '#9C27B0', 5, true, '{"categories": ["humanoids", "beastial"]}'),
    ('RACES_SECTION_ID_AQUI', 'race', 'Minotauro', 'Criaturas metade humano, metade touro. Guerreiros poderosos e temidos.', '', '#795548', 6, true, '{"categories": ["beastial", "hybrid"]}'),
    ('RACES_SECTION_ID_AQUI', 'race', 'Centauro', 'Criaturas metade humano, metade cavalo. Excelentes arqueiros e guerreiros montados.', '', '#607D8B', 7, true, '{"categories": ["beastial", "hybrid"]}'),
    
    -- Místicos
    ('RACES_SECTION_ID_AQUI', 'race', 'Fada', 'Pequenas criaturas mágicas. Conhecidas por sua beleza e poderes de ilusão.', '', '#E91E63', 8, true, '{"categories": ["mystical", "elemental"]}'),
    ('RACES_SECTION_ID_AQUI', 'race', 'Sereia', 'Criaturas metade humano, metade peixe. Habitam os oceanos e têm vozes encantadoras.', '', '#00BCD4', 9, true, '{"categories": ["mystical", "hybrid"]}'),
    ('RACES_SECTION_ID_AQUI', 'race', 'Vampiro', 'Imortais que se alimentam de sangue. Conhecidos por sua elegância e poderes sobrenaturais.', '', '#9C27B0', 10, true, '{"categories": ["mystical", "undead"]}'),
    
    -- Elementais
    ('RACES_SECTION_ID_AQUI', 'race', 'Dragão', 'Criaturas majestosas e poderosas. Capazes de voar e respirar fogo, são temidos e respeitados.', '', '#F44336', 11, true, '{"categories": ["mystical", "elemental"]}'),
    ('RACES_SECTION_ID_AQUI', 'race', 'Elemental de Fogo', 'Seres feitos de fogo puro. Controlam as chamas e são imunes ao calor.', '', '#FF5722', 12, true, '{"categories": ["elemental"]}'),
    ('RACES_SECTION_ID_AQUI', 'race', 'Elemental de Água', 'Seres feitos de água pura. Controlam os mares e rios.', '', '#2196F3', 13, true, '{"categories": ["elemental"]}'),
    
    -- Híbridos
    ('RACES_SECTION_ID_AQUI', 'race', 'Meio-Elfo', 'Filhos de humanos e elfos. Combinam a versatilidade humana com a graça élfica.', '', '#4CAF50', 14, true, '{"categories": ["humanoids", "hybrid"]}'),
    ('RACES_SECTION_ID_AQUI', 'race', 'Meio-Orc', 'Filhos de humanos e orcs. Fortes como orcs, mas mais inteligentes.', '', '#8BC34A', 15, true, '{"categories": ["humanoids", "hybrid"]}'),
    
    -- Mortos-Vivos
    ('RACES_SECTION_ID_AQUI', 'race', 'Lich', 'Magos que se tornaram imortais através de magia negra. Extremamente poderosos.', '', '#607D8B', 16, true, '{"categories": ["mystical", "undead"]}'),
    ('RACES_SECTION_ID_AQUI', 'race', 'Esqueleto', 'Mortos reanimados. Servem como soldados leais e obedientes.', '', '#9E9E9E', 17, true, '{"categories": ["undead"]}');

-- =====================================================
-- RAÇAS PARA FICÇÃO CIENTÍFICA
-- =====================================================

-- Para usar em fandoms de ficção científica, substitua os valores acima por:

-- INSERT INTO section_items (
--     section_id,
--     item_type,
--     item_title,
--     item_description,
--     item_image_url,
--     item_color,
--     item_order,
--     is_active,
--     custom_data
-- ) VALUES 
--     -- Humanos
--     ('RACES_SECTION_ID_AQUI', 'race', 'Humano', 'A raça dominante da Terra. Adaptável e versátil.', '', '#4CAF50', 1, true, '{"categories": ["humans"]}'),
--     ('RACES_SECTION_ID_AQUI', 'race', 'Humano Modificado', 'Humanos com melhorias genéticas ou cibernéticas.', '', '#8BC34A', 2, true, '{"categories": ["humans", "cyborgs"]}'),
--     
--     -- Aliens
--     ('RACES_SECTION_ID_AQUI', 'race', 'Greys', 'Aliens cinzentos com cabeças grandes. Conhecidos por abduções.', '', '#9E9E9E', 3, true, '{"categories": ["aliens"]}'),
--     ('RACES_SECTION_ID_AQUI', 'race', 'Reptilianos', 'Aliens reptilianos. Mestres da tecnologia e estratégia.', '', '#8BC34A', 4, true, '{"categories": ["aliens"]}'),
--     ('RACES_SECTION_ID_AQUI', 'race', 'Insectoides', 'Aliens com características de insetos. Vivem em colônias.', '', '#FF9800', 5, true, '{"categories": ["aliens"]}'),
--     
--     -- Robôs
--     ('RACES_SECTION_ID_AQUI', 'race', 'Robô', 'Seres mecânicos criados artificialmente. Programados para funções específicas.', '', '#607D8B', 6, true, '{"categories": ["robots"]}'),
--     ('RACES_SECTION_ID_AQUI', 'race', 'IA Avançada', 'Inteligências artificiais com consciência própria.', '', '#2196F3', 7, true, '{"categories": ["robots"]}'),
--     
--     -- Ciborgues
--     ('RACES_SECTION_ID_AQUI', 'race', 'Ciborgue', 'Seres com partes mecânicas integradas. Combinam orgânico e artificial.', '', '#FF5722', 8, true, '{"categories": ["cyborgs"]}'),
--     ('RACES_SECTION_ID_AQUI', 'race', 'Humanoide Cibernético', 'Robôs com aparência humana. Difíceis de distinguir de humanos.', '', '#9C27B0', 9, true, '{"categories": ["androids"]}'),
--     
--     -- Androides
--     ('RACES_SECTION_ID_AQUI', 'race', 'Androide', 'Robôs humanoides com IA avançada. Podem ter emoções.', '', '#E91E63', 10, true, '{"categories": ["androids"]}'),
--     
--     -- Espécies Híbridas
--     ('RACES_SECTION_ID_AQUI', 'race', 'Humano-Alien', 'Híbridos de humanos e aliens. Combinam características de ambas as raças.', '', '#4CAF50', 11, true, '{"categories": ["hybrid_species"]}'),
--     ('RACES_SECTION_ID_AQUI', 'race', 'Humano-Robô', 'Híbridos de humanos e robôs. Têm partes orgânicas e mecânicas.', '', '#FF9800', 12, true, '{"categories": ["hybrid_species"]}');

-- =====================================================
-- RAÇAS PARA ANIME/MANGÁ
-- =====================================================

-- Para usar em fandoms de anime/mangá, substitua os valores acima por:

-- INSERT INTO section_items (
--     section_id,
--     item_type,
--     item_title,
--     item_description,
--     item_image_url,
--     item_color,
--     item_order,
--     is_active,
--     custom_data
-- ) VALUES 
--     -- Humanos
--     ('RACES_SECTION_ID_AQUI', 'race', 'Humano', 'A raça mais comum. Sem poderes especiais, mas com grande potencial.', '', '#4CAF50', 1, true, '{"categories": ["humans"]}'),
--     ('RACES_SECTION_ID_AQUI', 'race', 'Humano com Poderes', 'Humanos que desenvolveram habilidades especiais.', '', '#8BC34A', 2, true, '{"categories": ["humans"]}'),
--     
--     -- Demônios
--     ('RACES_SECTION_ID_AQUI', 'race', 'Demônio', 'Seres demoníacos com poderes sobrenaturais. Geralmente hostis.', '', '#F44336', 3, true, '{"categories": ["demons"]}'),
--     ('RACES_SECTION_ID_AQUI', 'race', 'Meio-Demônio', 'Híbridos de humanos e demônios. Podem ser bons ou maus.', '', '#9C27B0', 4, true, '{"categories": ["demons", "hybrids"]}'),
--     
--     -- Anjos
--     ('RACES_SECTION_ID_AQUI', 'race', 'Anjo', 'Seres celestiais com poderes divinos. Protetores da humanidade.', '', '#2196F3', 5, true, '{"categories": ["angels"]}'),
--     ('RACES_SECTION_ID_AQUI', 'race', 'Meio-Anjo', 'Híbridos de humanos e anjos. Têm poderes divinos limitados.', '', '#00BCD4', 6, true, '{"categories": ["angels", "hybrids"]}'),
--     
--     -- Espíritos
--     ('RACES_SECTION_ID_AQUI', 'race', 'Espírito', 'Seres incorpóreos. Podem possuir objetos ou pessoas.', '', '#9E9E9E', 7, true, '{"categories": ["spirits"]}'),
--     ('RACES_SECTION_ID_AQUI', 'race', 'Yokai', 'Espíritos japoneses. Podem ser bons ou maus.', '', '#FF9800', 8, true, '{"categories": ["spirits"]}'),
--     
--     -- Criaturas Mágicas
--     ('RACES_SECTION_ID_AQUI', 'race', 'Fada', 'Pequenas criaturas mágicas. Conhecidas por sua beleza e poderes.', '', '#E91E63', 9, true, '{"categories": ["magical_creatures"]}'),
--     ('RACES_SECTION_ID_AQUI', 'race', 'Dragão', 'Criaturas majestosas e poderosas. Capazes de voar e usar magia.', '', '#FF5722', 10, true, '{"categories": ["magical_creatures"]}'),
--     
--     -- Híbridos
--     ('RACES_SECTION_ID_AQUI', 'race', 'Híbrido', 'Mistura de duas ou mais raças. Podem ter características únicas.', '', '#607D8B', 11, true, '{"categories": ["hybrids"]}');

-- =====================================================
-- VERIFICAR RAÇAS CRIADAS:
-- =====================================================

-- SELECT 
--     si.item_title,
--     si.item_description,
--     si.item_color,
--     si.custom_data,
--     si.item_order
-- FROM section_items si
-- JOIN fandom_sections fs ON si.section_id = fs.id
-- WHERE fs.section_title = 'Raças/Espécies'
-- ORDER BY si.item_order;

-- =====================================================
-- COMENTÁRIOS:
-- =====================================================

-- ✅ item_type: 'race' para identificar como raça
-- ✅ custom_data: JSON com categorias para filtros
-- ✅ item_order: Ordem de exibição
-- ✅ item_color: Cor personalizada para cada raça
-- ✅ item_description: Descrição detalhada da raça

-- Após adicionar as raças, você pode:
-- 1. Ver as raças na página da fandom
-- 2. Usar os filtros para categorizar
-- 3. Editar raças existentes
-- 4. Adicionar novas raças via interface
-- 5. Personalizar cores e descrições 