# Configuração do Banco de Dados

Este diretório contém os scripts SQL necessários para configurar o banco de dados do Supabase.

## Tabelas Necessárias

### 1. Tabela `fandoms`

Execute o script `fandoms_table.sql` no SQL Editor do Supabase para criar a tabela de fandoms.

#### Estrutura da Tabela:
- `id`: UUID único da fandom
- `name`: Nome da fandom (obrigatório)
- `description`: Descrição da fandom
- `image_url`: URL da imagem da fandom (opcional)
- `creator_id`: ID do usuário que criou a fandom
- `created_at`: Data de criação
- `updated_at`: Data da última atualização

#### Políticas de Segurança (RLS):
- **Leitura**: Todos os usuários podem ver todas as fandoms
- **Criação**: Usuários podem criar suas próprias fandoms
- **Atualização**: Usuários podem atualizar apenas suas próprias fandoms
- **Exclusão**: Usuários podem excluir apenas suas próprias fandoms

### 2. Tabela `profiles`

Execute o script `profiles_table.sql` no SQL Editor do Supabase para criar a tabela de perfis de usuário.

#### Estrutura da Tabela:
- `id`: UUID do usuário (referência ao auth.users)
- `nickname`: Apelido do usuário
- `avatar_url`: URL da imagem de avatar
- `profile_settings`: Configurações de personalização (JSONB)
- `created_at`: Data de criação
- `updated_at`: Data da última atualização

#### Configurações de Perfil (profile_settings):
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

#### Políticas de Segurança (RLS):
- **Leitura**: Todos os usuários podem ver todos os perfis
- **Criação**: Usuários podem criar seus próprios perfis
- **Atualização**: Usuários podem atualizar apenas seus próprios perfis
- **Exclusão**: Usuários podem excluir apenas seus próprios perfis

## Como Executar

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **SQL Editor**
4. Cole o conteúdo do arquivo `fandoms_table.sql` e execute
5. Cole o conteúdo do arquivo `profiles_table.sql` e execute

## Verificação

Após executar os scripts, você pode verificar se as tabelas foram criadas:

```sql
-- Verificar se as tabelas existem
SELECT * FROM information_schema.tables 
WHERE table_name IN ('fandoms', 'profiles');

-- Verificar as políticas RLS
SELECT * FROM pg_policies 
WHERE tablename IN ('fandoms', 'profiles');
```

## Funcionalidades Implementadas

Com esta configuração, você terá:

### Fandoms:
- ✅ Criação de fandoms por usuários logados
- ✅ Listagem de fandoms criadas pelo usuário
- ✅ Edição de fandoms (página a ser implementada)
- ✅ Exclusão de fandoms
- ✅ Segurança baseada em usuário (RLS)
- ✅ Timestamps automáticos

### Perfis:
- ✅ Criação automática de perfil ao registrar
- ✅ Personalização de cores do perfil
- ✅ Upload de avatar
- ✅ Upload de imagem de cabeçalho
- ✅ Seção "Sobre" com limite de caracteres
- ✅ Configurações salvas em JSONB
- ✅ Segurança baseada em usuário (RLS)
- ✅ Timestamps automáticos

## Próximos Passos

Após configurar o banco de dados, você pode:

1. Testar a criação de fandoms na página `/create-fandom`
2. Verificar se as fandoms aparecem no perfil do usuário
3. Testar a personalização do perfil na página `/profile`
4. Implementar a página de edição de fandoms
5. Adicionar funcionalidades como categorias, tags, etc. 