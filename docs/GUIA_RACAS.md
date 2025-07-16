# Guia da Seção Raças/Espécies

## Visão Geral

A seção de **Raças/Espécies** foi criada para permitir que os usuários gerenciem e visualizem as diferentes raças ou espécies dentro de uma fandom. Esta funcionalidade segue o mesmo padrão da seção de Personagens, oferecendo uma experiência consistente.

## Estrutura de Arquivos

```
tutorial/app/fandom/[id]/races/
├── page.tsx                    # Página principal de raças
├── [raceId]/
│   ├── page.tsx               # Página individual da raça
│   └── edit/
│       └── page.tsx           # Página de edição da raça
```

```
tutorial/components/ui/
├── RaceCard.tsx               # Componente de card para raças
└── AddRaceModal.tsx           # Modal para adicionar novas raças
```

## Funcionalidades

### 1. Página Principal de Raças (`/fandom/[id]/races`)

- **Listagem de raças**: Exibe todas as raças da fandom em um grid responsivo
- **Filtros por categoria**: Sistema de filtros similar ao de personagens
- **Botão "Adicionar Raça"**: Abre modal para criar nova raça
- **Botão "Gerenciar Filtros"**: Link para gerenciar filtros da seção

### 2. Página Individual da Raça (`/fandom/[id]/races/[raceId]`)

- **Visualização completa**: Exibe imagem, título, descrição e categorias
- **Breadcrumb navigation**: Navegação hierárquica
- **Botão "Editar Raça"**: Link para página de edição
- **Botão "Ver Todas as Raças"**: Retorna à listagem

### 3. Página de Edição (`/fandom/[id]/races/[raceId]/edit`)

- **Formulário completo**: Campos para título, descrição, cor e imagem
- **Upload de imagem**: Integração com Supabase Storage
- **Botão "Salvar"**: Atualiza dados da raça
- **Botão "Excluir"**: Remove a raça (com confirmação)
- **Botão "Cancelar"**: Retorna à página da raça

### 4. Modal de Adição (`AddRaceModal`)

- **Formulário compacto**: Para adicionar raças rapidamente
- **Validação**: Campos obrigatórios
- **Upload de imagem**: Mesma funcionalidade da edição
- **Feedback visual**: Estados de loading e erro

## Componentes

### RaceCard

```tsx
interface RaceCardProps {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  color?: string;
  fandomId?: string;
}
```

**Características:**
- Design responsivo
- Fallback para imagem (inicial do título)
- Hover effects
- Link para página individual

### AddRaceModal

```tsx
interface AddRaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRaceAdded: () => void;
  fandomId: string;
  sectionId: string;
}
```

**Características:**
- Modal overlay
- Formulário com validação
- Integração com ImageUpload
- Estados de loading

## Integração com Banco de Dados

A seção de raças utiliza as mesmas tabelas da seção de personagens:

- `fandom_sections`: Seção "Raças/Espécies"
- `section_items`: Itens individuais (raças)
- `section_filters`: Filtros para categorização

### Estrutura de Dados

```sql
-- Exemplo de inserção de seção de raças
INSERT INTO fandom_sections (
  fandom_page_id,
  section_type,
  section_title,
  section_description,
  section_order,
  is_active
) VALUES (
  'page_id',
  'filter',
  'Raças/Espécies',
  'Seção para gerenciar raças e espécies da fandom',
  2,
  true
);

-- Exemplo de inserção de raça
INSERT INTO section_items (
  section_id,
  item_type,
  item_title,
  item_description,
  item_image_url,
  item_color,
  item_order,
  is_active
) VALUES (
  'section_id',
  'race',
  'Humano',
  'A raça mais comum e versátil',
  'https://example.com/human.jpg',
  '#4CAF50',
  1,
  true
);
```

## Personalização

### Cores

Cada raça pode ter sua própria cor, que é usada em:
- Bordas dos cards
- Fallback de imagem
- Elementos de destaque

### Imagens

- **Upload**: Via Supabase Storage
- **Bucket**: `character-images`
- **Pasta**: `fandoms/{fandomId}/races`
- **Fallback**: Inicial do título em fundo colorido

### Categorias

Sistema de filtros similar ao de personagens:
- Categorias customizáveis
- Filtros ativos/inativos
- Ordenação personalizada

## Navegação

### Breadcrumbs

```
Fandom → Raças/Espécies → [Nome da Raça] → Editar
```

### Links Principais

- **Página principal da fandom**: `/fandom/[id]`
- **Lista de raças**: `/fandom/[id]/races`
- **Raça individual**: `/fandom/[id]/races/[raceId]`
- **Editar raça**: `/fandom/[id]/races/[raceId]/edit`

## Responsividade

Todos os componentes são totalmente responsivos:
- **Mobile**: Layout em coluna única
- **Tablet**: Grid adaptativo
- **Desktop**: Layout completo com sidebar

## Próximos Passos

1. **Integração com banco de dados**: Implementar CRUD completo
2. **Sistema de filtros**: Conectar com `section_filters`
3. **Validações**: Adicionar validações mais robustas
4. **SEO**: Otimizações para motores de busca
5. **Performance**: Lazy loading e otimizações

## Exemplos de Uso

### Adicionando uma Nova Raça

1. Acesse `/fandom/[id]/races`
2. Clique em "Adicionar Raça"
3. Preencha o formulário
4. Clique em "Adicionar Raça"

### Editando uma Raça Existente

1. Acesse a página da raça
2. Clique em "Editar Raça"
3. Modifique os campos desejados
4. Clique em "Salvar Alterações"

### Excluindo uma Raça

1. Acesse a página de edição da raça
2. Clique em "Excluir Raça"
3. Confirme a exclusão

## Troubleshooting

### Problemas Comuns

1. **Imagem não carrega**: Verificar URL e permissões do bucket
2. **Erro ao salvar**: Verificar conexão com banco de dados
3. **Filtros não funcionam**: Verificar seção "Raças/Espécies" existe

### Logs Úteis

```javascript
// Verificar dados da seção
console.log('Seção de raças:', sectionsData);

// Verificar itens da seção
console.log('Raças carregadas:', itemsData);

// Verificar filtros
console.log('Filtros disponíveis:', filtersData);
``` 