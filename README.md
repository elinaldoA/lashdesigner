# Lash Designer — Sistema Completo

Sistema full-stack para estúdio de extensão de cílios. Inclui **site institucional público**, **loja online**, **agendamento online** e **painel administrativo completo** com CMS integrado.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Stack Tecnológica](#stack-tecnológica)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Banco de Dados](#banco-de-dados)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Rodar o Projeto](#rodar-o-projeto)
- [Build para Produção](#build-para-produção)
- [Arquitetura](#arquitetura)
- [Site Público](#site-público)
- [Painel Administrativo](#painel-administrativo)
- [Loja Online](#loja-online)
- [CMS — Gerenciar Site](#cms--gerenciar-site)
- [API — Endpoints](#api--endpoints)

---

## Visão Geral

O sistema é dividido em duas partes que rodam juntas:

| Parte | Tecnologia | Porta padrão |
|-------|-----------|-------------|
| Frontend (React SPA) | Vite + React 18 + TypeScript | `5173` (dev) |
| Backend (REST API) | Express.js + MySQL2 | `3001` |

Em produção, o Express serve o build do React e tudo roda na porta `3001`.

---

## Stack Tecnológica

### Frontend
| Biblioteca | Versão | Uso |
|-----------|--------|-----|
| React | 18.3 | UI |
| TypeScript | 5.2 | Tipagem |
| Vite | 5.4 | Bundler |
| Tailwind CSS | 3.4 | Estilização |
| React Router DOM | 6.26 | Roteamento SPA |
| Zustand | 4.5 | Estado global |
| React Hook Form | 7.52 | Formulários |
| Zod | 3.23 | Validação de esquemas |
| Recharts | 2.12 | Gráficos |
| Lucide React | 0.414 | Ícones |
| date-fns | 3.6 | Manipulação de datas |

### Backend
| Biblioteca | Versão | Uso |
|-----------|--------|-----|
| Express | 4.19 | Servidor HTTP / REST API |
| MySQL2 | 3.9 | Driver MySQL com pool de conexões |
| bcryptjs | 3.0 | Hash de senhas |
| uuid | 11.0 | Geração de IDs |
| dotenv | 16.4 | Variáveis de ambiente |
| cors | 2.8 | Cross-Origin Resource Sharing |
| nodemon | 3.1 | Hot-reload em desenvolvimento |

---

## Pré-requisitos

- Node.js 18+
- MySQL 8.0+
- npm 9+

---

## Instalação

### 1. Instalar dependências do frontend

```bash
cd lash-designer
npm install
```

### 2. Instalar dependências do backend

```bash
cd lash-designer/backend
npm install
```

---

## Banco de Dados

### Banco novo (primeiro uso)

Execute o schema completo no MySQL. Isso cria todas as tabelas e insere os dados iniciais (serviços padrão, usuário admin e conteúdo do site):

```bash
mysql -u root -p < backend/schema.sql
```

Ou importe `backend/schema.sql` via MySQL Workbench / phpMyAdmin.

### Banco existente (migração da loja)

Se o banco já existia antes da adição da loja online, execute a migração pontual:

```bash
mysql -u root -p lash_designer < backend/migrate_store.sql
```

Isso adiciona as colunas `store_visible` e `store_featured` na tabela `products` e cria as tabelas `store_orders` e `store_order_items` (o script é seguro para reexecução).

---

## Variáveis de Ambiente

### Backend — `backend/.env`

Copie o exemplo e ajuste:

```bash
cp backend/.env.example backend/.env
```

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=lash_designer

PORT=3001

FRONTEND_URL=http://localhost:5173
```

---

## Rodar o Projeto

### Desenvolvimento (frontend + backend juntos)

A partir da raiz do projeto:

```bash
npm run dev
```

Isso usa `concurrently` para subir o backend (porta `3001`) e o Vite (porta `5173`) simultaneamente.

Acesse:
- **Site:** http://localhost:5173
- **Admin:** http://localhost:5173/admin
- **API:** http://localhost:3001/api/health

---

## Build para Produção

```bash
# Na raiz do projeto
npm run build

# Iniciar o servidor (serve frontend + API)
npm start
```

O Express detecta `NODE_ENV=production` e serve o build do React em `dist/`. Tudo roda na porta `3001`.

---

## Arquitetura

```
lash-designer/
├── backend/                  # Express.js API
│   ├── server.js             # Entry point, registro de rotas
│   ├── db.js                 # Pool de conexão MySQL
│   ├── schema.sql            # Schema completo do banco
│   ├── migrate_store.sql     # Migração para banco existente
│   ├── .env.example          # Template de variáveis de ambiente
│   ├── middleware/
│   │   ├── requireAuth.js    # Valida x-auth-token
│   │   └── rateLimit.js      # Rate limiting
│   └── routes/               # Um arquivo por recurso
│       ├── auth.js
│       ├── clients.js
│       ├── services.js
│       ├── appointments.js
│       ├── blockedSlots.js
│       ├── products.js
│       ├── sales.js
│       ├── transactions.js
│       ├── testimonials.js
│       ├── gallery.js
│       ├── contactMessages.js
│       ├── bookingRequests.js
│       ├── siteContent.js
│       ├── stats.js
│       ├── storePublic.js    # Rotas públicas da loja (sem auth)
│       └── storeOrders.js    # Gestão de pedidos (com auth)
│
└── src/                      # React + TypeScript
    ├── App.tsx               # Router principal + AppLoader
    ├── main.tsx              # Ponto de entrada React
    ├── index.css             # CSS global + Tailwind
    │
    ├── shared/
    │   ├── types/index.ts    # Interfaces TypeScript
    │   ├── services/api.ts   # Cliente HTTP tipado (fetch wrapper)
    │   ├── store/useStore.ts # Zustand store (estado global)
    │   ├── components/       # Componentes reutilizáveis
    │   └── utils/            # Funções utilitárias
    │
    ├── site/                 # Site público
    │   ├── components/SiteLayout.tsx
    │   └── pages/
    │       ├── Home/
    │       ├── Services/
    │       ├── About/
    │       ├── Gallery/
    │       ├── Testimonials/
    │       ├── Contact/
    │       ├── Booking/
    │       └── Store/        # Loja online
    │
    └── admin/                # Painel administrativo
        ├── components/AdminLayout.tsx
        └── pages/
            ├── Login/
            ├── Dashboard/
            ├── Appointments/
            ├── Clients/
            ├── Products/
            ├── Sales/
            ├── CashFlow/
            ├── Reports/
            ├── StoreOrders/  # Gestão de pedidos da loja
            └── WebsiteManager/
                └── sections/ # Editores por seção (CMS)
```

---

## Site Público

Acessível sem autenticação em `http://localhost:5173`.

| Rota | Página | Descrição |
|------|--------|-----------|
| `/` | Home | Hero banner, serviços em destaque, depoimentos |
| `/servicos` | Serviços | Todos os serviços com preço e duração |
| `/loja` | Loja Online | Produtos disponíveis, carrinho e checkout |
| `/sobre` | Sobre | Missão, valores, experiência |
| `/galeria` | Galeria | Portfolio de trabalhos realizados |
| `/depoimentos` | Depoimentos | Avaliações aprovadas de clientes |
| `/contato` | Contato | Formulário de contato e informações |
| `/agendamento` | Agendamento | Formulário de solicitação de agendamento online |

---

## Painel Administrativo

Acessível em `/admin` (requer autenticação).

| Rota | Módulo | Funcionalidades |
|------|--------|----------------|
| `/admin` | Dashboard | KPIs, gráficos de receita, próximos agendamentos, alertas de estoque |
| `/admin/agendamentos` | Agendamentos | Calendário, CRUD completo, confirmação, cancelamento |
| `/admin/clientes` | Clientes | Cadastro, histórico, próxima manutenção, aniversários |
| `/admin/produtos` | Estoque | CRUD de produtos, alertas de estoque mínimo |
| `/admin/vendas` | Vendas | Registro de vendas com itens, desconto, formas de pagamento |
| `/admin/pedidos` | Pedidos Loja | Gestão de pedidos do e-commerce com status e detalhes |
| `/admin/fluxo-caixa` | Fluxo de Caixa | Receitas, despesas, saldo por período |
| `/admin/relatorios` | Relatórios | Análises de serviços, produtos, clientes e financeiro |
| `/admin/website` | Gerenciar Site | CMS completo para edição do conteúdo público |

---

## Loja Online

### Funcionamento para o cliente (`/loja`)

1. Navega pelo catálogo de produtos com busca e filtro por categoria
2. Adiciona produtos ao carrinho (sidebar deslizante)
3. Ajusta quantidades ou remove itens
4. Abre o checkout e preenche os dados (nome, telefone, e-mail, endereço, forma de pagamento)
5. Desconto de **5% automático** ao escolher PIX
6. Pedido confirmado — estoque decrementado automaticamente no servidor

### Gestão no admin (`/admin/pedidos`)

- **KPIs:** total de pedidos, pendentes, receita (excluindo cancelados)
- **Tabela** com filtro por status, data, cliente, itens e total
- **Alteração de status inline:** pendente → confirmado → enviado → entregue / cancelado
- **Modal de detalhes:** dados do cliente, itens comprados, totais, pagamento, observações
- **Exclusão** com confirmação

### Configurar produtos na loja (`/admin/website/loja`)

- Lista todos os produtos do estoque
- Botão **Visível/Oculto** — ativa o produto na loja pública
- Botão **Destaque** (estrela) — destaca o produto no topo da listagem
- Ocultar um produto remove o destaque automaticamente
- Alertas de estoque baixo em tempo real

### Status do pedido

| Status | Cor | Significado |
|--------|-----|-------------|
| `pending` | Amarelo | Aguardando confirmação |
| `confirmed` | Azul | Pedido confirmado |
| `shipped` | Roxo | Enviado/em entrega |
| `delivered` | Verde | Entregue ao cliente |
| `cancelled` | Vermelho | Cancelado |

---

## CMS — Gerenciar Site

Acesso: `/admin/website`

Todas as alterações refletem **imediatamente** no site público (sem rebuild).

| Aba | Rota | O que edita |
|-----|------|-------------|
| Hero/Home | `/admin/website` | Banner principal, CTA, imagem de fundo, opacidade |
| Sobre | `/admin/website/sobre` | Texto, missão, visão, valores, anos de experiência, foto |
| Serviços | `/admin/website/servicos` | Cadastro e edição de serviços (preço, duração, categoria, imagem) |
| Galeria | `/admin/website/galeria` | Upload e organização de fotos do portfolio |
| Depoimentos | `/admin/website/depoimentos` | Aprovação e moderação de avaliações |
| Contato | `/admin/website/contato` | Endereço, telefone, WhatsApp, e-mail, horários de funcionamento |
| Loja | `/admin/website/loja` | Visibilidade e destaque de produtos na loja |
| Mensagens | `/admin/website/mensagens` | Leitura de mensagens recebidas pelo formulário de contato |
| Configurações | `/admin/website/configuracoes` | Nome do site, cores, links de redes sociais, SEO |

---

## API — Endpoints

Base URL: `http://localhost:3001/api`

### Autenticação
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/auth/login` | Não | Login com e-mail e senha |
| POST | `/auth/logout` | Sim | Encerra sessão |
| GET | `/auth/me` | Sim | Dados do usuário autenticado |

### Clientes
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/clients` | Sim | Listar todos |
| POST | `/clients` | Sim | Criar |
| PUT | `/clients/:id` | Sim | Atualizar |
| DELETE | `/clients/:id` | Sim | Excluir |

### Serviços
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/services` | Não | Listar (públicos ativos) |
| POST | `/services` | Sim | Criar |
| PUT | `/services/:id` | Sim | Atualizar |
| DELETE | `/services/:id` | Sim | Excluir |

### Agendamentos
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/appointments` | Sim | Listar |
| POST | `/appointments` | Sim | Criar |
| PUT | `/appointments/:id` | Sim | Atualizar |
| DELETE | `/appointments/:id` | Sim | Excluir |
| GET | `/blocked-slots` | Não | Horários bloqueados (públicos) |
| POST | `/blocked-slots` | Sim | Bloquear horário |
| DELETE | `/blocked-slots/:id` | Sim | Desbloquear |

### Produtos / Estoque
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/products` | Sim | Listar todos |
| POST | `/products` | Sim | Criar |
| PUT | `/products/:id` | Sim | Atualizar |
| DELETE | `/products/:id` | Sim | Excluir |

### Vendas
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/sales` | Sim | Listar |
| POST | `/sales` | Sim | Registrar venda |
| DELETE | `/sales/:id` | Sim | Excluir |

### Fluxo de Caixa
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/transactions` | Sim | Listar transações |
| POST | `/transactions` | Sim | Criar transação |
| PUT | `/transactions/:id` | Sim | Atualizar |
| DELETE | `/transactions/:id` | Sim | Excluir |

### Loja — Público (sem auth)
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/store/products` | Não | Produtos visíveis na loja |
| POST | `/store/orders` | Não | Criar pedido (decrementa estoque) |

### Loja — Admin (com auth)
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/store-orders` | Sim | Listar todos os pedidos |
| PATCH | `/store-orders/:id/status` | Sim | Atualizar status |
| DELETE | `/store-orders/:id` | Sim | Excluir pedido |

### Conteúdo do Site
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/site-content` | Não | Todas as seções |
| PUT | `/site-content/:section` | Sim | Salvar seção |

### Outros
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/testimonials` | Não | Depoimentos aprovados |
| GET | `/gallery` | Não | Fotos da galeria |
| POST | `/contact-messages` | Não | Enviar mensagem de contato |
| POST | `/booking-requests` | Não | Solicitar agendamento |
| GET | `/stats` | Sim | Estatísticas de visitas |
| POST | `/stats/view` | Não | Registrar visita |
| GET | `/health` | Não | Health check do servidor |

