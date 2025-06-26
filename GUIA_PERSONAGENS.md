# Guia de Personagens - Sistema de Fandoms

Este guia explica como adicionar, editar e gerenciar personagens nas fandoms do sistema.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Como Adicionar Personagens](#como-adicionar-personagens)
3. [Como Editar Personagens](#como-editar-personagens)
4. [Como Excluir Personagens](#como-excluir-personagens)
5. [Página Dedicada de Personagens](#página-dedicada-de-personagens)
6. [Responsividade](#responsividade)
7. [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

O sistema permite que criadores de fandoms adicionem personagens personalizados com:
- **Nome**: Título do personagem
- **Descrição**: Informações sobre o personagem
- **Imagem**: URL da imagem do personagem
- **Cor do Card**: Cor personalizada para o card do personagem

## ➕ Como Adicionar Personagens

### Passo a Passo:

1. **Acesse a página da sua fandom**
   - Vá para `/fandom/[id]` onde `[id]` é o ID da sua fandom

2. **Clique em "Editar Página"**
   - Este botão só aparece para o criador da fandom
   - Localizado no canto superior direito da página

3. **Navegue até a seção "Personagens"**
   - Role para baixo até encontrar a seção de personagens
   - Se não existir, ela será criada automaticamente

4. **Clique em "Adicionar Personagem"**
   - Botão localizado na seção de personagens

5. **Preencha os campos:**
   - **Nome**: Nome do personagem (obrigatório)
   - **Descrição**: Descrição detalhada do personagem (obrigatório)
   - **URL da Imagem**: Link para a imagem do personagem (opcional)
   - **Cor do Card**: Cor personalizada (padrão: #926DF6)

6. **Clique em "Adicionar"**
   - O personagem será salvo e aparecerá na lista

### Campos do Formulário:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Nome | Texto | ✅ | Nome do personagem |
| Descrição | Texto | ✅ | Descrição detalhada |
| URL da Imagem | URL | ❌ | Link para imagem |
| Cor do Card | Cor | ❌ | Cor personalizada |

## ✏️ Como Editar Personagens

### Método 1: Pela Página de Edição

1. Acesse a página de edição da fandom
2. Na seção de personagens, clique no ícone de editar (lápis)
3. Modifique os campos desejados
4. Clique em "Salvar"

### Método 2: Pela Página de Personagens

1. Acesse `/fandom/[id]/characters`
2. Passe o mouse sobre um personagem
3. Clique no ícone de editar (lápis)
4. Modifique os campos
5. Clique em "Salvar"

## 🗑️ Como Excluir Personagens

### Método 1: Pela Página de Edição

1. Acesse a página de edição da fandom
2. Na seção de personagens, clique no ícone de excluir (lixeira)
3. Confirme a exclusão

### Método 2: Pela Página de Personagens

1. Acesse `/fandom/[id]/characters`
2. Passe o mouse sobre um personagem
3. Clique no ícone de excluir (lixeira)
4. Confirme a exclusão

## 📄 Página Dedicada de Personagens

### Acessando a Página

- **URL**: `/fandom/[id]/characters`
- **Navegação**: Clique em "Ver mais Personagens" no carrossel da seção de personagens
- **Acesso Direto**: Digite a URL manualmente

### Funcionalidades da Página

1. **Visualização Completa**: Todos os personagens da fandom
2. **Estatísticas**: Contador total de personagens
3. **Layout Responsivo**: Adaptado para mobile, tablet e desktop
4. **Navegação**: Link para voltar à página principal da fandom
5. **Edição**: Botão para editar personagens (apenas para criadores)

### Características da Página

- **Background Personalizado**: Usa a cor de fundo da fandom
- **Grid Responsivo**: 1 coluna (mobile) → 2 colunas (tablet) → 3-4 colunas (desktop)
- **Cards Otimizados**: Sem botão "Ver mais" para evitar redundância
- **Estados Vazios**: Mensagem amigável quando não há personagens

## 👤 Página Individual do Personagem

### Acessando a Página

- **URL**: `/fandom/[id]/characters/[characterId]`
- **Navegação**: Clique em "Ver mais" em qualquer card de personagem individual
- **Acesso Direto**: Digite a URL manualmente

### Funcionalidades da Página

1. **Visualização Detalhada**: Informações completas do personagem
2. **Imagem em Destaque**: Imagem grande do personagem
3. **Descrição Completa**: Texto completo sem truncamento
4. **Informações Adicionais**: Fandom, cor do personagem
5. **Navegação Intuitiva**: Links para voltar aos personagens ou à fandom

### Características da Página

- **Layout Focado**: Design centrado no personagem
- **Imagem Prominente**: Imagem grande e destacada
- **Descrição Completa**: Texto sem limitações de caracteres
- **Navegação Clara**: Breadcrumbs e botões de ação
- **Responsivo**: Adaptado para todos os dispositivos

## 🔗 Diferença Entre os Botões "Ver mais"

### Botão do Carrossel (Seção de Personagens)
- **Localização**: Abaixo do carrossel de personagens
- **Texto**: "Ver mais Personagens"
- **Ação**: Redireciona para `/fandom/[id]/characters`
- **Propósito**: Ver todos os personagens da fandom

### Botão do Card Individual
- **Localização**: No card de cada personagem
- **Texto**: "Ver mais"
- **Ação**: Redireciona para `/fandom/[id]/characters/[characterId]`
- **Propósito**: Ver detalhes específicos do personagem

## 📱 Responsividade

### Mobile (até 640px)
- **Grid**: 1 coluna
- **Cards**: Largura máxima de 300px
- **Texto**: Tamanhos reduzidos (text-xs, text-sm)
- **Espaçamento**: Padding reduzido
- **Botões**: Tamanho otimizado para toque

### Tablet (640px - 1024px)
- **Grid**: 2-3 colunas
- **Cards**: Largura adaptativa
- **Texto**: Tamanhos médios
- **Espaçamento**: Padding moderado

### Desktop (1024px+)
- **Grid**: 3-4 colunas
- **Cards**: Largura máxima
- **Texto**: Tamanhos completos
- **Espaçamento**: Padding completo

### Breakpoints Utilizados

```css
/* Mobile */
@media (max-width: 639px) { ... }

/* Tablet */
@media (min-width: 640px) and (max-width: 1023px) { ... }

/* Desktop */
@media (min-width: 1024px) { ... }
```

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Personagem não aparece após adicionar
**Solução**: 
- Recarregue a página
- Verifique se o personagem está marcado como ativo
- Confirme se a seção "Personagens" existe

#### 2. Erro ao salvar personagem
**Possíveis causas**:
- Campos obrigatórios vazios
- URL da imagem inválida
- Problema de conexão com o banco

**Solução**:
- Preencha todos os campos obrigatórios
- Verifique se a URL da imagem é válida
- Tente novamente

#### 3. Botões de edição não aparecem
**Causa**: Você não é o criador da fandom
**Solução**: Entre em contato com o criador da fandom

#### 4. Imagem não carrega
**Possíveis causas**:
- URL inválida
- Imagem não acessível
- Problema de CORS

**Solução**:
- Use URLs de imagens públicas
- Verifique se a URL está correta
- Teste a URL em uma nova aba

#### 5. Página de personagens não carrega
**Possíveis causas**:
- Fandom não existe
- Página personalizada não criada
- Erro de permissão

**Solução**:
- Verifique se a URL está correta
- Confirme se a fandom existe
- Entre em contato com o suporte

### Logs de Erro

Para debug, verifique o console do navegador:
```javascript
// Erros comuns no console
console.error('Erro ao carregar personagens:', error);
console.error('Erro ao salvar personagem:', error);
```

## 🎨 Personalização

### Cores Recomendadas

```css
/* Cores padrão do sistema */
--primary-color: #926DF6;
--primary-hover: #A98AF8;
--success-color: #10B981;
--warning-color: #F59E0B;
--error-color: #EF4444;
```

### URLs de Imagem Recomendadas

- **Imagens Públicas**: Use serviços como Unsplash, Pexels
- **Formatos**: JPG, PNG, WebP
- **Tamanho**: Mínimo 300x300px
- **Peso**: Máximo 2MB

## 📞 Suporte

Se encontrar problemas:
1. Verifique este guia
2. Teste em diferentes navegadores
3. Limpe o cache do navegador
4. Entre em contato com o suporte técnico

---

**Última atualização**: Dezembro 2024
**Versão**: 2.0 