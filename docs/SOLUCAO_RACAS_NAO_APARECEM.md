# Solução: Raças não aparecem na homepage

## Problema
As raças criadas não aparecem na homepage da fandom, e ainda existem presets (Humano, Elfo, Anão) sendo exibidos.

## Causas Possíveis

### 1. Seção de Raças não foi criada automaticamente
A seção "Raças/Espécies" pode não ter sido criada automaticamente para fandoms existentes.

### 2. Presets ainda estão no código
Os presets (Humano, Elfo, Anão) ainda estão sendo exibidos em vez dos dados reais do banco.

## Soluções

### Passo 1: Verificar se a seção de raças existe

Execute o script `check_races_section.sql` no Supabase SQL Editor para verificar:

```sql
-- Verificar se a seção de raças existe
SELECT 
  f.name as fandom_name,
  fs.section_title,
  fs.is_active
FROM fandoms f
JOIN fandom_pages fp ON f.id = fp.fandom_id
LEFT JOIN fandom_sections fs ON fp.id = fs.fandom_page_id AND fs.section_title = 'Raças/Espécies'
ORDER BY f.name;
```

### Passo 2: Adicionar a seção de raças manualmente (se necessário)

Se a seção não existir, execute o script `add_races_section_manual.sql`:

```sql
-- Este script adiciona a seção de raças para fandoms que não a têm
-- Execute no Supabase SQL Editor
```

### Passo 3: Verificar se as raças estão sendo salvas corretamente

1. Vá para a página de raças da sua fandom: `/fandom/[id]/races`
2. Tente criar uma nova raça
3. Verifique se ela aparece na lista

### Passo 4: Verificar logs no console

Abra o console do navegador (F12) e verifique se há logs mostrando:
- Seções carregadas
- Itens carregados para cada seção
- Seção de raças encontrada
- Raças carregadas

### Passo 5: Recarregar a página

Após executar os scripts SQL, recarregue a página da fandom para que as mudanças sejam aplicadas.

## Código Corrigido

As seguintes correções foram aplicadas:

### 1. Remoção dos presets da homepage
- Removidos os cards de exemplo (Humano, Elfo, Anão)
- Adicionada lógica para carregar raças reais do banco

### 2. Implementação do modal de adicionar raça
- Modal agora salva raças no banco de dados
- Validação de campos obrigatórios
- Tratamento de erros

### 3. Carregamento dinâmico de raças
- Raças são carregadas da seção "Raças/Espécies"
- Filtros funcionam corretamente
- Máximo de 4 raças na homepage

## Verificação Final

Após aplicar as correções:

1. ✅ Presets removidos da homepage
2. ✅ Seção de raças criada automaticamente
3. ✅ Modal de adicionar raça funcional
4. ✅ Raças aparecem na homepage
5. ✅ Filtros funcionam corretamente

## Comandos SQL Importantes

```sql
-- Verificar status das seções
SELECT * FROM fandom_sections WHERE section_title = 'Raças/Espécies';

-- Verificar raças criadas
SELECT * FROM section_items WHERE item_type = 'race';

-- Adicionar seção de raças se não existir
-- Execute o script add_races_section_manual.sql
``` 