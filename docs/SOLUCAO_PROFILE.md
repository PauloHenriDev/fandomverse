# Solução para Problemas do Perfil

## Situação Atual:
✅ Você já tem uma tabela `profiles` no Supabase  
✅ A tabela tem: `id`, `nickname`, `avatar_url`  
✅ Você já tem algumas políticas RLS configuradas  
❌ **Falta**: `profile_settings` (coluna JSONB para configurações)  

## Problemas Identificados:

1. **Erro ao salvar perfil**: "Could not find the 'profile_settings' column"
2. **Nickname não carregado**: O apelido "TheTorinn" não aparece no campo de edição
3. **Conflito de políticas**: "policy already exists" ao tentar criar políticas

## Soluções:

### 1. Atualizar a Tabela Profiles (Script Seguro)

Execute este script no **SQL Editor** do Supabase:

```sql
-- Adiciona a coluna profile_settings se ela não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'profile_settings'
    ) THEN
        ALTER TABLE profiles ADD COLUMN profile_settings JSONB DEFAULT '{}';
        RAISE NOTICE 'Coluna profile_settings adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna profile_settings já existe';
    END IF;
END $$;

-- Habilita Row Level Security se não estiver habilitado
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'profiles' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado com sucesso';
    ELSE
        RAISE NOTICE 'RLS já está habilitado';
    END IF;
END $$;

-- Cria políticas apenas se elas não existirem
DO $$
BEGIN
    -- Política de atualização (mais importante para o perfil)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Allow users to update their own profiles'
    ) THEN
        CREATE POLICY "Allow users to update their own profiles" ON profiles
            FOR UPDATE USING (auth.uid() = id);
        RAISE NOTICE 'Política de atualização criada';
    ELSE
        RAISE NOTICE 'Política de atualização já existe';
    END IF;
END $$;
```

### 2. Verificar se a Atualização Funcionou

Execute esta query para verificar:

```sql
-- Verifica se a coluna profile_settings foi adicionada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'profile_settings';

-- Verifica as políticas RLS existentes
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
```

### 3. Recarregar a Página

Após executar o script:
1. Recarregue a página `/profile`
2. O nickname "TheTorinn" deve aparecer corretamente
3. O modal de edição deve funcionar sem erros

## Estrutura Final da Tabela Profiles:

- `id`: UUID do usuário (referência ao auth.users) ✅ **Já existe**
- `nickname`: Apelido do usuário ✅ **Já existe**
- `avatar_url`: URL da imagem de avatar ✅ **Já existe**
- `profile_settings`: Configurações de personalização (JSONB) ✅ **Nova coluna**

## Configurações de Perfil (profile_settings):

```json
{
  "headerColor": "#f97316",
  "headerImage": "https://...",
  "backgroundColor": "#ffffff",
  "aboutBackgroundColor": "#ef4444",
  "textColor": "#000000",
  "about": "Descrição do usuário..."
}
```

## Funcionalidades Disponíveis:

✅ Editar nickname  
✅ Personalizar cores do perfil  
✅ Upload de avatar  
✅ Upload de imagem de cabeçalho  
✅ Seção "Sobre" com limite de 500 caracteres  
✅ Salvar configurações no banco de dados  
✅ Contador de fandoms em tempo real  

## Se ainda houver problemas:

1. Verifique se o script SQL foi executado com sucesso
2. Confirme que a coluna `profile_settings` foi adicionada
3. Verifique se a política de UPDATE foi criada
4. Recarregue a página e tente novamente
5. Verifique o console do navegador para erros específicos

## Script Completo (Opcional):

Se quiser o script completo com todas as verificações, use o arquivo `update_profiles_table_safe.sql` que verifica cada elemento antes de criar. 