# 🖼️ Configuração do Sistema de Upload de Imagens

Este guia explica como configurar o sistema de upload de imagens para personagens no Supabase.

## 📋 Pré-requisitos

1. Acesso ao Supabase Dashboard
2. Projeto Supabase configurado
3. Storage habilitado no projeto

## 🚀 Configuração no Supabase

### 1. Criar o Bucket de Imagens

Execute o script SQL `database/create_character_images_bucket.sql` no SQL Editor do Supabase:

1. Vá para o **SQL Editor** no Supabase Dashboard
2. Clique em **"New Query"**
3. Cole o conteúdo do arquivo `create_character_images_bucket.sql`
4. Clique em **"Run"** para executar

### 2. Verificar a Configuração

Após executar o script, verifique se:

1. O bucket `character-images` foi criado em **Storage > Buckets**
2. As políticas de segurança estão ativas em **Storage > Policies**

## 🎯 Como Usar

### Para Criadores de Fandom

1. **Adicionar Personagem**:
   - Vá para a página de edição da fandom
   - Clique em "Adicionar Personagem"
   - Use o componente de upload para selecionar uma imagem
   - A imagem será automaticamente enviada para o Supabase

2. **Editar Personagem**:
   - Vá para a página individual do personagem
   - Clique em "Editar Informações Básicas"
   - Use o componente de upload para alterar a imagem

### Funcionalidades do Upload

- ✅ **Formatos aceitos**: JPG, PNG, GIF, WebP
- ✅ **Tamanho máximo**: 5MB
- ✅ **Preview em tempo real**: Veja a imagem antes de salvar
- ✅ **Remoção de imagem**: Botão para remover imagem existente
- ✅ **Validação automática**: Verifica formato e tamanho
- ✅ **Feedback visual**: Loading e mensagens de erro/sucesso

## 🔧 Configurações Técnicas

### Bucket Configuration
- **Nome**: `character-images`
- **Público**: Sim (imagens acessíveis sem autenticação)
- **Tamanho máximo**: 5MB por arquivo
- **Tipos permitidos**: image/jpeg, image/png, image/gif, image/webp

### Políticas de Segurança
- **Upload**: Apenas usuários autenticados
- **Visualização**: Público
- **Atualização**: Apenas usuários autenticados
- **Exclusão**: Apenas usuários autenticados

### Estrutura de Pastas
```
character-images/
├── characters/
│   ├── 1234567890-abc123.jpg
│   ├── 1234567891-def456.png
│   └── ...
```

## 🐛 Solução de Problemas

### Erro: "Bucket não encontrado"
- Execute o script SQL para criar o bucket
- Verifique se o nome do bucket está correto no código

### Erro: "Acesso negado"
- Verifique se as políticas de segurança estão ativas
- Confirme se o usuário está autenticado

### Erro: "Arquivo muito grande"
- Reduza o tamanho da imagem (máximo 5MB)
- Use um formato mais compacto (JPEG em vez de PNG)

### Erro: "Formato não suportado"
- Use apenas JPG, PNG, GIF ou WebP
- Verifique a extensão do arquivo

## 📱 Componentes Criados

### ImageUpload.tsx
Componente reutilizável para upload de imagens com:
- Preview da imagem
- Validação de formato e tamanho
- Feedback visual de loading
- Botão para remover imagem

### Integração nos Modais
- `AddCharacterModal`: Para adicionar novos personagens
- `SidebarEditModal`: Para editar personagens existentes

## 🎨 Personalização

### Alterar Tamanho Máximo
Edite o arquivo `create_character_images_bucket.sql`:
```sql
file_size_limit = 10485760, -- 10MB em bytes
```

### Alterar Formatos Aceitos
Edite o arquivo `create_character_images_bucket.sql`:
```sql
allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
```

### Alterar Nome do Bucket
1. Atualize o script SQL
2. Atualize os componentes que usam o bucket
3. Execute o script novamente

## ✅ Checklist de Configuração

- [ ] Script SQL executado no Supabase
- [ ] Bucket `character-images` criado
- [ ] Políticas de segurança ativas
- [ ] Componentes atualizados no código
- [ ] Teste de upload funcionando
- [ ] Teste de visualização funcionando

## 🚀 Próximos Passos

Após a configuração:
1. Teste o upload de imagens
2. Verifique se as imagens aparecem nos cards
3. Teste a edição de personagens existentes
4. Confirme que as imagens são carregadas corretamente

---

**Nota**: Este sistema substitui o método anterior de URLs de imagem por um sistema de upload direto, tornando a experiência muito mais intuitiva para os usuários. 