# 🎭 Sistema de Fandoms Personalizáveis

Um sistema completo para criar e gerenciar fandoms com páginas personalizáveis, construído com Next.js 13, Tailwind CSS e Supabase.

## ✨ Funcionalidades Principais

### 🏠 **Página Principal**
- Hero section com design moderno
- Seção de filtros para navegação
- Grid responsivo de cards
- Sistema de autenticação integrado

### 👤 **Sistema de Usuários**
- Registro e login de usuários
- Perfil personalizável com avatar
- Gerenciamento de fandoms criadas
- Upload de imagens para avatar

### 🎨 **Criação de Fandoms**
- Formulário intuitivo para criar fandoms
- Upload de imagem da fandom (opcional)
- Criação automática de página personalizada
- Redirecionamento para a página da fandom

### 🌟 **Páginas Personalizáveis**
- **URLs dinâmicas**: `/fandom/[id]`
- **Seções customizáveis**: Hero, Filtros, Cards, Conteúdo personalizado
- **Sistema de cores**: Personalização completa de cores
- **Ordem das seções**: Reordenação drag-and-drop
- **Conteúdo dinâmico**: Filtros e itens personalizáveis

### ⚙️ **Editor de Páginas**
- Interface de edição intuitiva
- Personalização de cores em tempo real
- Reordenação de seções
- Preview das alterações
- Acesso restrito ao criador da fandom

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais
- **`fandoms`**: Informações básicas das fandoms
- **`fandom_pages`**: Configurações das páginas personalizadas
- **`fandom_sections`**: Seções de cada página
- **`section_filters`**: Filtros das seções
- **`section_items`**: Itens (cards) das seções

### Segurança
- Row Level Security (RLS) habilitado
- Políticas de acesso baseadas em usuário
- Apenas criadores podem editar suas fandoms
- Páginas públicas para visualização

## 🚀 Como Usar

### 1. **Configuração Inicial**
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Adicionar suas credenciais do Supabase
```

### 2. **Configurar Banco de Dados**
Execute os scripts SQL na ordem:
1. `database/fandoms_table.sql` - Tabela básica de fandoms
2. `database/fandom_pages_table.sql` - Sistema de páginas personalizáveis

### 3. **Executar o Projeto**
```bash
npm run dev
```

### 4. **Fluxo de Uso**

#### **Criar uma Fandom**
1. Faça login na aplicação
2. Vá para "Meu Perfil"
3. Clique em "Criar Nova Fandom"
4. Preencha as informações
5. A página personalizada será criada automaticamente

#### **Personalizar a Página**
1. Na página da fandom, clique em "Editar"
2. Modifique cores, textos e seções
3. Reordene as seções conforme desejado
4. Salve as alterações

#### **Visualizar a Página**
- Acesse `/fandom/[id]` para ver a página pública
- A página é responsiva e otimizada para SEO

## 🎨 Templates Disponíveis

### **HeroSection**
- Título e descrição personalizáveis
- Botões com cores customizáveis
- Design responsivo

### **FilterSection**
- Filtros dinâmicos
- Botão "Ver mais"
- Integração com cards

### **CardGrid**
- Grid responsivo de cards
- Cores personalizáveis por item
- Suporte a imagens

### **PageSection**
- Container para seções
- Espaçamento consistente
- Flexibilidade de conteúdo

## 🔧 Tecnologias Utilizadas

- **Frontend**: Next.js 13, React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deploy**: Vercel (recomendado)

## 📁 Estrutura do Projeto

```
tutorial/
├── app/                    # Páginas Next.js 13
│   ├── auth/              # Autenticação
│   ├── create-fandom/     # Criação de fandoms
│   ├── fandom/[id]/       # Páginas dinâmicas
│   │   └── edit/          # Editor de páginas
│   ├── profile/           # Perfil do usuário
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   ├── templates/         # Templates reutilizáveis
│   └── ui/               # Componentes de UI
├── database/             # Scripts SQL
├── lib/                  # Configurações e utilitários
│   └── supabase/         # Cliente Supabase
└── README.md            # Documentação
```

## 🎯 Próximos Passos

### Funcionalidades Planejadas
- [ ] Editor visual drag-and-drop
- [ ] Mais tipos de seções (galeria, timeline, etc.)
- [ ] Sistema de comentários
- [ ] Compartilhamento em redes sociais
- [ ] Analytics de páginas
- [ ] Temas predefinidos
- [ ] Sistema de moderação

### Melhorias Técnicas
- [ ] Cache otimizado
- [ ] PWA (Progressive Web App)
- [ ] SEO avançado
- [ ] Testes automatizados
- [ ] CI/CD pipeline

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique a documentação do Supabase
2. Consulte os logs do console
3. Abra uma issue no repositório

---

**Desenvolvido com ❤️ usando Next.js e Supabase**
