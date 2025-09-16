# Sistema de Estoque - CRUD

Um sistema completo de gerenciamento de estoque desenvolvido com HTML, CSS, JavaScript no frontend e Node.js no backend.

## Funcionalidades

- **Criar** novos itens no estoque
- **Visualizar** lista de todos os itens
- **Editar** informações dos itens existentes
- **Excluir** itens do estoque
- **Buscar** itens por nome ou ID
- Interface responsiva e moderna
- Notificações em tempo real
- Validação de dados

## Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **SQLite3** - Banco de dados
- **CORS** - Middleware para requisições cross-origin

### Frontend
- **HTML5** - Estrutura da página
- **CSS3** - Estilização e responsividade
- **JavaScript** - Lógica da aplicação
- **Font Awesome** - Ícones

## Estrutura do Projeto

```
stock_crud/
├── backend/
│   ├── server.js          # Servidor Express
│   ├── package.json       # Dependências do backend
│   ├── schema.sql         # Esquema do banco de dados
│   └── stock.db          # Banco de dados SQLite (criado automaticamente)
├── frontend/
│   ├── index.html        # Página principal
│   ├── styles.css        # Estilos CSS
│   └── script.js         # Lógica JavaScript
└── README.md             # Este arquivo
```

## Como Executar

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm (gerenciador de pacotes do Node.js)

### Passo a Passo

1. **Clone ou baixe o projeto**
   ```bash
   # Se estiver usando git
   git clone <url-do-repositorio>
   cd stock_crud
   ```

2. **Instale as dependências do backend**
   ```bash
   cd backend
   npm install
   ```

3. **Inicie o servidor**
   ```bash
   node server.js
   ```

4. **Acesse o sistema**
   - Abra seu navegador
   - Vá para: `http://localhost:3000`

## Como Usar

### Adicionar Novo Item
1. Preencha o formulário no lado esquerdo da tela
2. Digite o nome do produto
3. Informe a quantidade em estoque
4. Digite o preço unitário
5. Clique em "Salvar Item"

### Editar Item
1. Clique no botão "Editar" do item desejado
2. O formulário será preenchido com os dados atuais
3. Modifique as informações necessárias
4. Clique em "Atualizar Item"

### Excluir Item
1. Clique no botão "Excluir" do item desejado
2. Confirme a exclusão no modal que aparece

### Buscar Itens
1. Use a caixa de busca no canto superior direito
2. Digite o nome do produto ou ID
3. Os resultados são filtrados em tempo real

## API Endpoints

O backend fornece uma API REST com os seguintes endpoints:

- `GET /api/items` - Lista todos os itens
- `GET /api/items/:id` - Busca item por ID
- `POST /api/items` - Cria novo item
- `PUT /api/items/:id` - Atualiza item existente
- `DELETE /api/items/:id` - Exclui item

### Exemplo de Dados

```json
{
  "id": 1,
  "name": "Notebook Dell Inspiron",
  "quantity": 10,
  "price": 2500.00,
  "created_at": "2025-09-16 11:50:00"
}
```

## Validações

- Nome do produto é obrigatório
- Quantidade deve ser um número inteiro não negativo
- Preço deve ser um número não negativo
- Todos os campos são validados no frontend e backend

## Atalhos de Teclado

- `Ctrl + N` - Novo item (foca no campo nome)
- `Esc` - Cancela edição ou fecha modal

## Configuração Avançada

### Mudando a Porta
Para usar uma porta diferente, defina a variável de ambiente `PORT`:

```bash
PORT=8080 node server.js
```

### Banco de Dados
O sistema usa SQLite por padrão. O arquivo `stock.db` é criado automaticamente na pasta `backend/`.

## Solução de Problemas

### Erro "Cannot GET /"
- Verifique se o servidor está rodando
- Confirme se está acessando `http://localhost:3000`

### Erro de CORS
- O CORS já está configurado para aceitar todas as origens
- Se persistir, verifique se não há proxy ou firewall bloqueando

### Banco de dados não funciona
- Verifique se a pasta `backend/` tem permissões de escrita
- O arquivo `stock.db` deve ser criado automaticamente
