# Templates de Páginas

Esta pasta contém templates reutilizáveis para estruturar páginas de forma consistente.

## Estrutura de Arquivos

```
templates/
├── index.ts              # Exportações centralizadas
├── HeroSection.tsx       # Seção hero com título, descrição e botões
├── FilterSection.tsx     # Seção com filtros scrolláveis
├── CardGrid.tsx          # Grid flexível para cards
├── PageSection.tsx       # Container com padding padrão
└── README.md            # Este arquivo
```

## Como Usar

### 1. Importar Templates
```tsx
import { HeroSection, FilterSection, CardGrid, PageSection } from "@/components/templates";
```

### 2. HeroSection
```tsx
<HeroSection
  title="Título da Página"
  description="Descrição da página"
  primaryButtonText="Botão Principal"
  secondaryButtonText="Botão Secundário"
  onPrimaryClick={() => console.log("Primário clicado")}
  onSecondaryClick={() => console.log("Secundário clicado")}
/>
```

### 3. FilterSection
```tsx
const filters = [
  { id: "all", label: "Todos", isActive: true },
  { id: "category1", label: "Categoria 1" },
  { id: "category2", label: "Categoria 2" },
];

<FilterSection
  title="Título da Seção"
  description="Descrição da seção"
  filters={filters}
  onFilterChange={(filterId) => console.log("Filtro:", filterId)}
  showLoadMore={true}
  loadMoreText="Ver mais"
  onLoadMore={() => console.log("Ver mais")}
/>
```

### 4. CardGrid
```tsx
<CardGrid gap="gap-[30px]">
  <YourCard />
  <YourCard />
  <YourCard />
</CardGrid>
```

### 5. PageSection
```tsx
<PageSection padding="pl-[100px] pr-[100px]" marginTop="mt-[50px]">
  <YourContent />
</PageSection>
```

## Exemplo de Página Completa

```tsx
import { HeroSection, FilterSection, CardGrid, PageSection } from "@/components/templates";

export default function MinhaPagina() {
  return (
    <main className="bg-[#875CF5]">
      <Header />
      
      <HeroSection
        title="Minha Fandom"
        description="Descrição da fandom"
        primaryButtonText="Explorar"
        secondaryButtonText="Comunidade"
      />

      <PageSection>
        <FilterSection
          title="Categorias"
          description="Filtre por categoria"
          filters={categorias}
          onFilterChange={handleFilterChange}
        />
        
        <CardGrid>
          {items.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </CardGrid>
      </PageSection>
    </main>
  );
}
```

## Vantagens

- **Reutilização**: Use os mesmos templates em diferentes páginas
- **Consistência**: Mantenha o mesmo padrão visual
- **Manutenibilidade**: Alterações em um template refletem em todas as páginas
- **Flexibilidade**: Props permitem customização quando necessário
- **Organização**: Código mais limpo e estruturado

## Extensões Futuras

- Template para formulários
- Template para modais
- Template para listas
- Template para navegação
- Template para footers 