# Guia de Teste - Edição de Personagens

## 🧪 Como Testar a Edição de Personagens

### 1. **Acessar um Personagem**
- Vá para uma fandom que você criou
- Acesse a seção de personagens
- Clique em um personagem específico

### 2. **Verificar se os Dados Aparecem**
- Na página do personagem, verifique se as seções mostram:
  - ✅ **Texto real** se você já editou antes
  - ✅ **Placeholder em itálico cinza** se ainda não editou

### 3. **Editar o Personagem**
- Clique no botão **"Editar Personagem"** (no header ou na engrenagem)
- Verifique se os campos estão preenchidos com os dados atuais

### 4. **Preencher as Seções**
- **Informações Básicas:**
  - Nome do personagem
  - Cor do personagem
  - URL da imagem
  - Descrição

- **Citação:**
  - Citação do personagem
  - Fonte da citação

- **Seções da Ficha:**
  - Personalidade
  - Aparência
  - Habilidades e Poderes
  - Equipamentos
  - Background
  - Relacionamentos
  - Curiosidades

### 5. **Salvar e Verificar**
- Clique em **"Salvar Alterações"**
- Você será redirecionado para a página do personagem
- Verifique se as informações foram atualizadas

### 6. **Testar Novamente**
- Clique em editar novamente
- Verifique se os campos mostram os dados que você acabou de salvar

## 🔍 **O que Verificar:**

### ✅ **Funcionamento Correto:**
- Campos preenchidos com dados atuais ao editar
- Salvamento funcionando
- Redirecionamento correto
- Dados aparecendo na visualização

### ❌ **Problemas Possíveis:**
- Campos vazios ao editar (dados não carregando)
- Erro ao salvar
- Dados não aparecendo na visualização
- Redirecionamento incorreto

## 🐛 **Debug:**

Se houver problemas, abra o **Console do Navegador** (F12) e verifique:

1. **Logs de carregamento:**
   ```
   "Dados customizados carregados: {...}"
   "Formulário preenchido com: {...}"
   ```

2. **Erros de rede** na aba Network

3. **Erros de JavaScript** na aba Console

## 📝 **Exemplo de Teste:**

1. **Crie um personagem** com dados básicos
2. **Edite o personagem** e adicione:
   - Personalidade: "Corajoso e determinado"
   - Aparência: "Alto, cabelo preto, olhos azuis"
   - Habilidades: "Mestre em espada"
   - Citação: "A coragem não é a ausência do medo"
3. **Salve** e verifique se aparece na visualização
4. **Edite novamente** e verifique se os campos estão preenchidos

## 🎯 **Resultado Esperado:**

- ✅ Dados carregados corretamente na edição
- ✅ Salvamento funcionando
- ✅ Visualização atualizada
- ✅ Navegação fluida entre edição e visualização 