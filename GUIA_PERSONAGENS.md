# 📖 Guia Completo - Sistema de Personagens

## 🎯 Visão Geral

O sistema de personagens permite criar, gerenciar e exibir personagens detalhados para cada fandom. Cada personagem possui uma ficha completa com informações básicas, sidebar customizável e conteúdo detalhado.

## 🗂️ Estrutura de Dados

### Tabela Principal: `section_items`
Os personagens são armazenados na tabela `section_items` com os seguintes campos:

- **`item_type`**: Sempre `'character'`
- **`item_title`**: Nome do personagem
- **`item_description`**: Descrição básica
- **`item_image_url`**: URL da imagem
- **`item_color`**: Cor do card
- **`custom_data`**: Dados detalhados em JSON

### Dados Customizados (`custom_data`)
```json
{
  // Informações Básicas da Sidebar
  "fandom": "Nome da fandom",
  "tipo": "Personagem/NPC/Vilão/Aliado",
  "raca": "Raça do personagem",
  "idade": "Idade do personagem",
  "altura": "Altura do personagem",
  "peso": "Peso do personagem",
  
  // Informações de RPG/Game
  "classe": "Classe do personagem",
  "nivel": "Nível do personagem",
  "alinhamento": "Alinhamento moral",
  "statusVida": "Vivo/Morto/Desaparecido/Inconsciente",
  
  // Conteúdo Detalhado
  "descricaoDetalhada": "Descrição completa e detalhada do personagem",
  "personalidade": "Descrição da personalidade",
  "aparencia": "Características físicas",
  "habilidades": "Poderes e capacidades",
  "equipamentos": "Armas e itens",
  "background": "História de fundo",
  "relacionamentos": "Conexões com outros",
  "curiosidades": "Fatos interessantes",
  "quote": "Citação marcante",
  "quoteSource": "Fonte da citação"
}
```

## 🚀 Como Usar

### 1. Adicionando Personagens

#### Via Página de Edição da Fandom
1. Acesse a página da sua fandom
2. Clique em "Editar Fandom"
3. Na seção "Personagens", clique em "+ Adicionar Personagem"
4. Preencha:
   - **Nome do Personagem** (obrigatório)
   - **Descrição** (obrigatório)
   - **URL da Imagem** (opcional)
   - **Cor do Card** (padrão: #926DF6)
5. Clique em "Adicionar Personagem"

#### Via Modal de Adição
- O modal é responsivo e funciona em mobile/desktop
- Validação automática de campos obrigatórios
- Preview da cor selecionada

### 2. Visualizando Personagens

#### Lista de Personagens
- Acesse `/fandom/[id]/characters`
- Visualização em grid responsivo
- Cards com informações básicas
- Botões de ação (editar/excluir) para criadores

#### Ficha Individual do Personagem
- Acesse `/fandom/[id]/characters/[characterId]`
- Layout com sidebar e conteúdo principal
- Navegação por seções
- Design responsivo

### 3. Editando Personagens

#### Edição Rápida (Informações Básicas) - ⚙️ Engrenagem
**Localização**: Botão com ícone de engrenagem na sidebar
1. Clique no ícone de **engrenagem** (⚙️) na sidebar
2. Modal abre para editar:
   - Nome do personagem
   - **Descrição Curta** (para sidebar e cards)
   - URL da imagem
   - Cor do card
3. Clique em "Salvar Alterações"

#### Edição da Sidebar Completa - ✏️ Lápis na Sidebar
**Localização**: Botão com ícone de lápis na sidebar
1. Clique no ícone de **lápis** (✏️) na sidebar
2. Modal organizado em seções:

   **Seção: Informações Básicas**
   - Nome do personagem
   - Fandom
   - Tipo (Personagem, NPC, Vilão, Aliado)
   - Status (Ativo/Inativo)

   **Seção: Características**
   - Raça
   - Idade
   - Altura
   - Peso

   **Seção: RPG/Game**
   - Classe
   - Nível
   - Alinhamento (9 opções de alinhamento D&D)
   - Status de Vida (Vivo, Morto, Desaparecido, Inconsciente)

   **Seção: Aparência**
   - Cor do card
   - Ordem de exibição

3. Clique em "Salvar Sidebar"

#### Edição do Conteúdo Principal - ✏️ Lápis no Conteúdo
**Localização**: Botão com ícone de lápis no conteúdo principal
1. Clique no ícone de **lápis** (✏️) no conteúdo principal
2. Modal abre para editar todo o conteúdo da ficha:
   - **Descrição Detalhada** (para a seção principal)
   - Personalidade
   - Aparência
   - Habilidades
   - Equipamentos
   - Background
   - Relacionamentos
   - Curiosidades
   - Citação
3. Clique em "Salvar Conteúdo da Ficha"

#### Edição Completa (Página Dedicada)
1. Acesse `/fandom/[id]/characters/[characterId]/edit`
2. Edite todas as seções em uma página dedicada
3. Mais espaço e funcionalidades avançadas

### 4. Três Tipos de Edição Separados

O sistema agora suporta **três fluxos de edição diferentes**:

#### 1. Informações Básicas (⚙️ Engrenagem)
- **Localização**: Botão de engrenagem na sidebar
- **Campos**: Nome, descrição curta, imagem, cor
- **Uso**: Ajustes rápidos e básicos
- **Campo no BD**: `item_title`, `item_description`, `item_image_url`, `item_color`

#### 2. Sidebar Completa (✏️ Lápis na Sidebar)
- **Localização**: Botão de lápis na sidebar
- **Campos**: Todos os campos da sidebar + configurações
- **Uso**: Configuração completa da sidebar com campos customizáveis
- **Campos no BD**: `custom_data` + campos básicos

#### 3. Conteúdo Principal (✏️ Lápis no Conteúdo)
- **Localização**: Botão de lápis no conteúdo principal
- **Campos**: Descrição detalhada e todas as seções da ficha
- **Uso**: Conteúdo narrativo e detalhado do personagem
- **Campo no BD**: `custom_data` (seções detalhadas)

### 5. Fluxo de Edição Recomendado

1. **Primeiro**: Use a engrenagem (⚙️) para informações básicas
   - Nome, descrição curta, imagem, cor
2. **Segundo**: Use o lápis (✏️) na sidebar para configurar campos customizáveis
   - Raça, idade, classe, alinhamento, etc.
3. **Terceiro**: Use o lápis (✏️) no conteúdo para adicionar descrições detalhadas
   - Background, personalidade, relacionamentos, etc.
4. **Opcional**: Use a página dedicada para edições complexas

### 6. Excluindo Personagens

#### Via Página de Edição da Fandom
1. Acesse "Editar Fandom"
2. Na seção "Personagens"
3. Clique no ícone de lixeira (🗑️)
4. Confirme a exclusão

#### Via Card do Personagem
1. Na lista de personagens
2. Clique no ícone de lixeira no card
3. Confirme a exclusão

## 🎨 Design e Responsividade

### Layout Responsivo
- **Mobile**: Layout em coluna única
- **Tablet**: Grid 2 colunas
- **Desktop**: Grid 3-4 colunas

### Componentes
- **CharacterCard**: Card responsivo para listagem
- **AddCharacterModal**: Modal responsivo para adição
- **SidebarEditModal**: Modal para edição básica
- **SidebarCustomEditModal**: Modal para edição completa da sidebar
- **MainContentEditModal**: Modal para edição do conteúdo principal
- **Página de Personagem**: Layout sidebar + conteúdo

### Cores e Estilos
- Cores personalizáveis por personagem
- Design consistente com o tema da fandom
- Animações suaves e transições

## 🔧 Funcionalidades Técnicas

### Segurança
- **Row Level Security (RLS)** habilitado
- Apenas criadores podem editar/excluir
- Validação de permissões em todas as operações

### Performance
- Índices otimizados no banco de dados
- Carregamento lazy de imagens
- Cache de dados quando apropriado

### Validação
- Campos obrigatórios validados
- URLs de imagem validadas
- Cores em formato hexadecimal

## 📱 Experiência do Usuário

### Para Criadores
- Interface intuitiva para gerenciamento
- Feedback visual imediato
- Confirmações para ações destrutivas
- Modais responsivos
- Três fluxos de edição específicos para diferentes necessidades

### Para Visitantes
- Visualização limpa e organizada
- Navegação fácil entre seções
- Design atrativo e moderno
- Informações bem estruturadas
- Sidebar rica em informações customizáveis

## 🎯 Dicas de Uso

### Criando Personagens Eficazmente
1. **Nome**: Escolha nomes memoráveis e únicos
2. **Descrição**: Seja conciso mas informativo
3. **Imagem**: Use URLs de imagens estáveis
4. **Cor**: Escolha cores que combinem com o personagem

### Organizando Informações na Sidebar
1. **Informações Básicas**: Nome, fandom, tipo, status
2. **Características**: Raça, idade, altura, peso
3. **RPG/Game**: Classe, nível, alinhamento, status de vida
4. **Aparência**: Cor do card, ordem de exibição

### Organizando Informações no Conteúdo
1. **Personalidade**: Foque em traços de caráter
2. **Aparência**: Detalhes físicos distintivos
3. **Habilidades**: Capacidades especiais e poderes
4. **Background**: História que explique o personagem
5. **Relacionamentos**: Conexões importantes
6. **Curiosidades**: Fatos interessantes e únicos

### Exemplos de Uso

#### Personagem de RPG
- **Sidebar**: Raça (Humano), Classe (Guerreiro), Nível (15), Alinhamento (Leal e Bom)
- **Conteúdo**: Background detalhado, habilidades específicas, equipamentos

#### Personagem de Anime/Manga
- **Sidebar**: Tipo (Personagem), Raça (Humano), Idade (16 anos)
- **Conteúdo**: Personalidade, relacionamentos, curiosidades sobre o personagem

#### NPC
- **Sidebar**: Tipo (NPC), Status de Vida (Vivo), Classe (Mercador)
- **Conteúdo**: Background simples, relacionamentos com outros personagens

## 🔄 Fluxo de Trabalho Recomendado

1. **Criar Fandom** → Configurar página básica
2. **Adicionar Personagens** → Informações básicas primeiro
3. **Detalhar Personagens** → Completar fichas individuais
4. **Organizar** → Ajustar ordem e cores
5. **Revisar** → Verificar informações e links
6. **Manter** → Atualizações conforme necessário

## 🆘 Solução de Problemas

### Problemas Comuns
- **Imagem não carrega**: Verifique se a URL está correta e acessível
- **Erro ao salvar**: Verifique se todos os campos obrigatórios estão preenchidos
- **Permissão negada**: Certifique-se de ser o criador da fandom

### Contato
Para problemas técnicos, verifique:
1. Console do navegador para erros
2. Logs do Supabase
3. Permissões de usuário
4. Conectividade de rede

---

**✨ Sistema de Personagens - Versão 2.0**  
*Funcionalidades completas para criação e gerenciamento de personagens em fandoms* 