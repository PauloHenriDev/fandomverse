# Guia Rápido: Configurar Banco de Dados para Raças/Espécies

## 🚀 Configuração Automática (Para Todas as Fandoms)

### ✅ **NOVO**: Configuração Automática

A seção de **Raças/Espécies** agora é criada **automaticamente** para todas as fandoms!

#### Para **fandoms novas** (criadas após esta atualização):
- ✅ A seção é criada automaticamente
- ✅ Não precisa fazer nada manualmente
- ✅ Funciona para todas as fandoms

#### Para **fandoms existentes** (já criadas):
- Execute o script abaixo uma única vez

### Passo 1: Acessar o Supabase
1. Vá para [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Clique em **SQL Editor**

### Passo 2: Executar Script para Fandoms Existentes

**Copie e cole este código no SQL Editor do Supabase:**

```sql
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

-- Atualizar ordem da seção de regiões (se existir) para 4
UPDATE fandom_sections 
SET section_order = 4 
WHERE section_title = 'Regiões' 
AND section_order = 3;
```

**✅ NÃO precisa de IDs manuais!** Este script funciona para todas as fandoms automaticamente.

### Passo 3: Verificar se Funcionou

Execute esta query para verificar:

```sql
-- Listar todas as seções de raças criadas
SELECT 
    fs.section_title,
    fs.section_description,
    fs.section_order,
    f.name as fandom_name
FROM fandom_sections fs
JOIN fandom_pages fp ON fs.fandom_page_id = fp.id
JOIN fandoms f ON fp.fandom_id = f.id
WHERE fs.section_title = 'Raças/Espécies'
ORDER BY f.name;

-- Contar quantas seções foram criadas
SELECT 
    COUNT(*) as total_races_sections
FROM fandom_sections 
WHERE section_title = 'Raças/Espécies';
```

## 🎯 O que Acontece

Após executar o script:

### ✅ Seção "Raças/Espécies" criada automaticamente
- Aparece na página da fandom
- Ordem: 3 (após personagens, antes de regiões)
- **Sem raças padrão**
- **Sem filtros padrão**

### ✅ Funciona para todas as fandoms
- **Fandoms novas**: Criadas automaticamente
- **Fandoms existentes**: Adicionadas pelo script
- **Interface pronta para uso**
- **Usuários criam suas próprias raças**

## 🎉 Próximos Passos

Após configurar o banco de dados:

1. **Acesse a página da fandom**
2. **Veja a seção "Raças/Espécies"** (vazia inicialmente)
3. **Clique em "Adicionar Raça"** para criar sua primeira raça
4. **Personalize cores, descrições e categorias**
5. **Crie filtros conforme necessário**

## 🔧 Exemplo de Uso

### 1. Criar uma raça via interface:
- Nome: "Humano"
- Descrição: "A raça mais comum e versátil"
- Cor: #4CAF50
- Categorias: ["Humanoides"]

### 2. Criar filtros conforme necessário:
- "Humanoides"
- "Bestiais" 
- "Místicos"
- etc.

## 🐛 Troubleshooting

### Problema: "Seção não aparece"
**Solução**: Execute o script para fandoms existentes

### Problema: "Erro de permissão"
**Solução**: Verifique se as políticas RLS estão configuradas

### Problema: "Ordem das seções incorreta"
**Solução**: O script atualiza automaticamente a ordem

## 📊 Verificações Úteis

### Verificar se a seção foi criada:
```sql
SELECT 
    fs.section_title,
    fs.section_description,
    fs.section_order,
    fs.is_active,
    f.name as fandom_name
FROM fandom_sections fs
JOIN fandom_pages fp ON fs.fandom_page_id = fp.id
JOIN fandoms f ON fp.fandom_id = f.id
WHERE fs.section_title = 'Raças/Espécies';
```

### Verificar se há raças criadas:
```sql
SELECT 
    si.item_title,
    si.item_description,
    si.item_color
FROM section_items si
JOIN fandom_sections fs ON si.section_id = fs.id
WHERE fs.section_title = 'Raças/Espécies' 
AND si.item_type = 'race'
ORDER BY si.item_order;
```

---

**✅ Configuração concluída!** A seção de Raças/Espécies está pronta para que os usuários criem suas próprias raças. 