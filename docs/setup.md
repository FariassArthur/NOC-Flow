# Setup Detalhado - ProjetoNOC

## Pré-requisitos

- **Node.js** >= 18
- **pnpm** >= 8 (ou npm/yarn)
- **Git**
- **Conta MongoDB Atlas** (gratuita em https://www.mongodb.com/cloud/atlas)

## Instalação Inicial

### 1. Clonar Repositório

```bash
git clone <seu-repo>
cd ProjetoNOC
```

### 2. Instalar Dependências

```bash
# Com pnpm (recomendado)
pnpm install

# Ou com npm
npm install

# Ou com yarn
yarn install
```

### 3. Configurar Variáveis de Ambiente

#### 3.1 Backend (services/api)

```bash
cp services/api/.env.example services/api/.env.local
```

Editar `services/api/.env.local`:

```env
# MongoDB (copie sua string de conexão do MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/projetonoc

# Segurança
JWT_SECRET=sua-chave-secreta-super-segura
JWT_EXPIRES_IN=7d

# Porta
PORT=3001

# CORS - adicione seus domínios aqui
CORS_ORIGIN=http://localhost:3000,http://localhost:19000
```

#### 3.2 Web App (apps/web)

```bash
cp apps/web/.env.example apps/web/.env.local
```

Editar `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### 3.3 Mobile App (apps/mobile)

```bash
cp apps/mobile/.env.example apps/mobile/.env.local
```

Editar `apps/mobile/.env.local`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3001
```

## Executar em Desenvolvimento

### Opção 1: Rodar Tudo em Paralelo

```bash
pnpm dev
```

### Opção 2: Rodar Serviços Individualmente

**Terminal 1 - Backend:**

```bash
pnpm --filter=@noc/api dev
```

**Terminal 2 - Web:**

```bash
pnpm --filter=@noc/web dev
```

**Terminal 3 - Mobile (Expo):**

```bash
pnpm --filter=@noc/mobile start
```

## Build para Produção

```bash
# Build todos os projetos
pnpm build

# Ou build individual:
pnpm --filter=@noc/api build
pnpm --filter=@noc/web build
pnpm --filter=@noc/mobile build
```

## MongoDB Atlas Setup

1. Criar conta em https://www.mongodb.com/cloud/atlas
2. Criar cluster gratuito (M0)
3. Definir username e password
4. Copiar connection string
5. Substitui `username` e `password` na string
6. Cole em `MONGODB_URI` no `.env.local`

## Verificação de Setup

- [ ] Backend rodando: http://localhost:3001/health
- [ ] Web rodando: http://localhost:3000
- [ ] Mobile com Expo: Execute `pnpm --filter=@noc/mobile start`

## Primeiros Passos

1. Acesse http://localhost:3000
2. Clique em "Registrar"
3. Preencha o formulário com dados de teste
4. Faça login
5. Crie sua primeira ocorrência!

## Troubleshooting

### Erro de conexão MongoDB

- Verifique se sua string MONGODB_URI está correta
- Adicione seu IP na whitelist do MongoDB Atlas
- Verifique credenciais de username/password

### Porta 3001 já em uso

```bash
# Mudar porta no .env.local
PORT=3002
```

### Erro CORS

- Adicione seu domínio em `CORS_ORIGIN` no backend
- Se usar IPs diferentes, adicione todos: `http://192.168.x.x:3000,http://localhost:3000`

### pnpm não encontrado

```bash
npm install -g pnpm
```

## Scripts Úteis

```bash
# Lint de todos os projetos
pnpm lint

# Type check
pnpm type-check

# Format com prettier
pnpm format

# Clean de node_modules (use com cuidado!)
pnpm clean
```

## Estrutura de Pastas

```
apps/web/         → Aplicação Next.js (porta 3000)
apps/mobile/      → Aplicação Expo (porta 19000)
services/api/     → Backend Express (porta 3001)
packages/shared/  → Tipos e utilitários compartilhados
packages/api-client/ → Cliente HTTP
```

## Próximos Passos

- [ ] Familiarizar com os tipos em `packages/shared`
- [ ] Entender o fluxo de autenticação
- [ ] Criar componentes para listar ocorrências
- [ ] Adicionar upload de anexos
- [ ] Configurar deployment
