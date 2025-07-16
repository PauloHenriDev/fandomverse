# Solução: Itens com Status Inativo

## 🚨 Problema Identificado

Os itens da database (raças, personagens e filtros) estavam sendo criados com `is_active = false` quando deveriam sempre estar ativos (`is_active = true`).

### Causas do Problema:

1. **Filtros**: Estavam sendo criados explicitamente com `is_active: false` no código
2. **Estrutura do Banco**: A tabela `section_filters` tinha `DEFAULT false` quando deveria ter `DEFAULT true`
3. **Itens**: Embora a estrutura estivesse correta (`DEFAULT true`), alguns itens existentes podiam estar inativos

## ✅ Soluções Implementadas

### 1. Correção no Código

**Arquivo**: `tutorial/app/fandom/[id]/manage-filters/page.tsx`

**Antes**:
```javascript
.insert({
  section_id: sectionData.id,
  filter_label: newFilterName,
  filter_value: newFilterValue,
  filter_order: newOrder,
  filter_color: newFilterColor,
  is_active: false  // ❌ Problema aqui
})
```

**Depois**:
```javascript
.insert({
  section_id: sectionData.id,
  filter_label: newFilterName,
  filter_value: newFilterValue,
  filter_order: newOrder,
  filter_color: newFilterColor,
  is_active: true  // ✅ Corrigido
})
```

### 2. Correção na Estrutura do Banco

**Arquivo**: `tutorial/database/fandom_pages_table.sql`

**Antes**:
```sql
is_active BOOLEAN DEFAULT false,  -- ❌ Problema aqui
```

**Depois**:
```sql
is_active BOOLEAN DEFAULT true,  -- ✅ Corrigido
```

### 3. Scripts de Correção

#### Para Filtros:
**Arquivo**: `tutorial/database/update_filters_to_active.sql`

```sql
-- Atualizar todos os filtros para is_active = true
UPDATE section_filters 
SET is_active = true 
WHERE is_active = false;
```

#### Para Itens (Raças/Personagens):
**Arquivo**: `tutorial/database/check_and_fix_inactive_items.sql`

```sql
-- Atualizar todos os itens inativos para ativos
UPDATE section_items 
SET is_active = true 
WHERE is_active = false;
```

## 🔧 Como Aplicar as Correções

### Passo 1: Executar Scripts SQL

Execute os scripts de correção no seu banco Supabase:

1. **Para filtros**:
   ```sql
   -- Execute o conteúdo de update_filters_to_active.sql
   ```

2. **Para itens**:
   ```sql
   -- Execute o conteúdo de check_and_fix_inactive_items.sql
   ```

### Passo 2: Verificar Resultados

Após executar os scripts, verifique se tudo está funcionando:

```sql
-- Verificar filtros ativos
SELECT COUNT(*) FROM section_filters WHERE is_active = true;

-- Verificar itens ativos
SELECT COUNT(*) FROM section_items WHERE is_active = true;

-- Verificar se não há mais itens inativos
SELECT COUNT(*) FROM section_filters WHERE is_active = false;
SELECT COUNT(*) FROM section_items WHERE is_active = false;
```

## 📊 Estrutura Corrigida

### Tabela `section_filters`:
```sql
CREATE TABLE section_filters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_id UUID NOT NULL REFERENCES fandom_sections(id) ON DELETE CASCADE,
    filter_label VARCHAR(100) NOT NULL,
    filter_value VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,  -- ✅ Corrigido
    filter_order INTEGER NOT NULL,
    filter_color VARCHAR(7) DEFAULT '#926DF6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabela `section_items`:
```sql
CREATE TABLE section_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_id UUID NOT NULL REFERENCES fandom_sections(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL,
    item_title VARCHAR(255) NOT NULL,
    item_description TEXT,
    item_image_url TEXT,
    item_color VARCHAR(7) DEFAULT '#926DF6',
    item_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,  -- ✅ Já estava correto
    custom_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🎯 Resultado Esperado

Após aplicar as correções:

- ✅ **Todos os filtros** estarão ativos por padrão
- ✅ **Todos os itens** (raças/personagens) estarão ativos por padrão
- ✅ **Novos filtros** criados via interface serão ativos automaticamente
- ✅ **Novos itens** criados via interface serão ativos automaticamente
- ✅ **Não haverá mais itens inativos** a menos que sejam explicitamente desativados

## 🔍 Verificação

Para verificar se tudo está funcionando corretamente:

1. **Crie um novo filtro** via interface - deve aparecer ativo
2. **Crie uma nova raça** via interface - deve aparecer ativa
3. **Crie um novo personagem** via interface - deve aparecer ativo
4. **Verifique no banco** se todos os itens têm `is_active = true`

## 📝 Notas Importantes

- **Filtros e itens devem sempre estar ativos** por padrão
- **Apenas desative** quando for necessário ocultar temporariamente
- **Use soft delete** (is_active = false) em vez de hard delete quando possível
- **Mantenha a consistência** entre código e estrutura do banco

---

**✅ Problema resolvido!** Todos os itens agora estarão ativos por padrão. 