# CCore - Network Occurrence Management System

Sistema completo de gerenciamento de ocorrências para análise de redes com aplicações web (Next.js) e mobile (React Native).

## 📋 Características

- ✅ Abertura e fechamento de ocorrências
- ✅ Atribuição de responsáveis
- ✅ Sistema de prioridades e tags
- ✅ Rastreamento de SLA e tempo gasto
- ✅ Histórico de mudanças
- ✅ Comentários e anexos
- ✅ Interface web responsiva (Next.js 15)
- ✅ Aplicativo mobile nativo (React Native com Expo)
- ✅ Autenticação com JWT
- ✅ MongoDB Atlas

## 🏗️ Arquitetura Monorepo

```
CCore/
├── apps/web/           # Aplicação Next.js 15
├── apps/mobile/        # Aplicação React Native (Expo)
├── packages/shared/    # Tipos e utilitários compartilhados
├── packages/api-client/# Cliente HTTP compartilhado
└── services/api/       # Backend Express + MongoDB
```

## 🚀 Quick Start

### Pré-requisitos

- Node.js >= 18
- pnpm >= 8
- Git

### Instalação

```bash
# Clonar e entrar no diretório
cd CCore

# Instalar dependências de todas as workspaces
pnpm install

# Variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais
```

### Executar em desenvolvimento

```bash
# Rodar todos os projetos em paralelo
pnpm dev

# Ou rodar individualmente:
pnpm --filter=@ccore/api dev      # Backend (port 3001)
pnpm --filter=@ccore/web dev      # Web (port 3000)
pnpm --filter=@ccore/mobile dev   # Mobile (Expo)
```

## 📦 Workspaces

### apps/web

Aplicação web com Next.js 15 + React 19 + TypeScript

- `pnpm --filter=@ccore/web dev` - Rodar em desenvolvimento
- `pnpm --filter=@ccore/web build` - Build para produção

### apps/mobile

Aplicação mobile com Expo + React Native + TypeScript

- `pnpm --filter=@ccore/mobile start` - Rodar com Expo
- `pnpm --filter=@ccore/mobile build` - Build para produção

### services/api

API REST com Express + MongoDB + Mongoose

- `pnpm --filter=@ccore/api dev` - Rodar em desenvolvimento
- `pnpm --filter=@ccore/api build` - Build para produção

### packages/shared

Código compartilhado: tipos, schemas, constantes, utilitários

- TypeScript types
- Zod schemas para validação
- Funções utilitárias
- Constantes do sistema

### packages/api-client

Cliente HTTP tipado para consumir a API

- Axios client configurado
- Endpoints tipados
- React hooks (SWR/React Query)

## 🔐 Autenticação

O sistema usa JWT (JSON Web Tokens) para autenticação:

1. Usuário faz login e recebe um token JWT
2. Token é armazenado no localStorage (web) ou AsyncStorage (mobile)
3. Token é enviado no header `Authorization: Bearer <token>` de todas as requisições
4. Backend valida o token e retorna os dados

## 💾 Banco de Dados

MongoDB com schema de ocorrências completo:

- Campos básicos: título, descrição, status, data
- Atribuição: responsável, prioridade, tags
- SLA: prazo, tempo gasto
- Histórico: comentários, anexos, log de mudanças

## 📚 Documentação

- [Setup Detalhado](./docs/setup.md)
- [API REST](./docs/api.md)
- [Arquitetura](./docs/architecture.md)
- [Schema MongoDB](./docs/schema.md)

## 🛠️ Tecnologias

| Camada   | Tecnologias                                    |
| -------- | ---------------------------------------------- |
| Web      | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Mobile   | React Native, Expo, TypeScript, NativeWind     |
| Backend  | Node.js, Express, MongoDB, Mongoose            |
| Auth     | JWT, Bcrypt                                    |
| Monorepo | pnpm, TypeScript                               |

## 📖 Variáveis de Ambiente

```env
# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/database

# API
API_PORT=3001
API_URL=http://localhost:3001
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Web/Mobile
NEXT_PUBLIC_API_URL=http://localhost:3001
REACT_APP_API_URL=http://localhost:3001
```

## 🤝 Contribuindo

1. Criar um branch para sua feature
2. Fazer commit das mudanças
3. Push para o branch
4. Abrir um Pull Request

## 📝 Licença

MIT

## 👥 Equipe

Setor de Análise de Redes
