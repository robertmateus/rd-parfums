# RD Parfums - Catálogo de Luxo Responsivo

Um catálogo digital de perfumes de nicho de altíssimo luxo com design moderno e minimalista, filtros de busca avançados, diagnóstico de fragrância (Scent Finder/Quiz) e cotações integradas via WhatsApp.

Desenvolvido utilizando as tecnologias mais modernas de desenvolvimento web.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com uma stack de alta performance e tipagem estática:

*   **React 15+ / 19 (com TypeScript)**: Framework principal para criação dos componentes interativos e modularização rápida.
*   **Vite**: Build tool e dev server ultraveloz.
*   **Tailwind CSS v4**: Framework utilitário de CSS usado para criar o design escuro e dourado sob medida.
*   **Lucide React**: Conjunto de ícones premium e limpos.
*   **LocalStorage**: Persistência do estado da sacola de cotações diretamente no navegador do cliente de forma leve.

---

## 📸 Funcionalidades Criadas

1.  **Destaques de Perfumes**: Exibição em grid elegante com imagem renderizada de altíssima qualidade, pirâmide olfativa e rascunho de preço.
2.  **Filtro Inteligente por Categorias**: Alternância fluida e instantânea entre famílias olfativas como Cítrico, Floral, Amadeirado e Oriental.
3.  **Barra de Pesquisa Dinâmica**: Filtra instantaneamente por nomes de fragrâncias ou notas específicas da descrição/pirâmide olfativa.
4.  **Quiz Interativo de Fragrância**: Um passo-a-passo interativo para traçar as preferências de ocasião e intensidade do usuário e sugerir o perfume ideal.
5.  **Gravação de Nome no Cristal**: Serviço de luxo integrado para personalizar o frasco para presentes.
6.  **Sacola de Cotação Persistente (Orçamento)**: Adicione itens, selecione volumes e envie a mensagem estruturada de reserva direto para o WhatsApp do atendimento.

---

## 🚀 Como Rodar o Catálogo na sua Máquina

### Pré-requisitos
Certifique-se de ter instalado em sua máquina:
*   [Node.js](https://nodejs.org) (Versão 18 ou superior recomendada)
*   [npm](https://www.npmjs.com) ou [yarn](https://yarnpkg.com)

---

### Passo 1: Clonar ou Extrair o Código
Se você baixou o projeto via arquivo ZIP do Google AI Studio, extraia-o em uma pasta de sua escolha. Se estiver rodando via terminal, navegue até a pasta do projeto.

---

### Passo 2: Instalar as Dependências
Abra o seu terminal na pasta do projeto e execute o comando abaixo para baixar as dependências listadas no `package.json`:

```bash
npm install
```
*(ou se você usa yarn)*
```bash
yarn install
```

---

### Passo 3: Rodar em Ambiente de Desenvolvimento
Inicialize o servidor local e verifique as alterações em tempo real rodando:

```bash
npm run dev
```
*(ou com yarn)*
```bash
yarn dev
```

Após rodar o comando, o terminal irá exibir um endereço local como `http://localhost:3000` ou `http://localhost:5173`. Abra este endereço no seu navegador de preferência para interagir com o seu catálogo de luxo!

---

### Passo 4: Gerar o Build de Produção (Opcional)
Se você deseja gerar a versão otimizada e compilada do site para hospedagem (Netlify, Vercel ou VPS pessoal), execute:

```bash
npm run build
```

Isso criará uma pasta chamada `/dist` com todo o HTML estático, CSS otimizado e arquivos JavaScript minificados, prontos para serem servidos.

---

## 🎨 Estrutura de Arquivos

*   `/src/main.tsx`: Ponto de entrada do React.
*   `/src/App.tsx`: Gerencia as conexões de estado, buscas, categorias e o layout principal da aplicação.
*   `/src/types.ts`: Definições exclusivas de interfaces TypeScript para garantir integridade aos dados.
*   `/src/data/perfumes.ts`: Nosso "banco de dados" local estático contendo os itens do catálogo com fotos, pirâmide olfativa enriquecida e descrições poéticas.
*   `/src/components/`:
    *   `Navbar.tsx`: Menu fluído de cabeçalho responsivo com contador de itens.
    *   `Hero.tsx`: Banner de entrada premium com emblema dourado e visual imersivo.
    *   `ProductCard.tsx`: Grid de produtos individualizadas com efeitos de hover de luxo.
    *   `ProductDrawer.tsx`: Menu lateral de detalhes da fragrância com suporte a pirâmide olfativa, seleção de volume e customizações VIP (gravação e caixa de presente).
    *   `CartDrawer.tsx`: Gerenciamento do carrinho/sacola e gerador do link integrativo com WhatsApp.
    *   `FragranceFinder.tsx`: Algoritmo inteligente e interface interativa do diagnóstico de aromas.
