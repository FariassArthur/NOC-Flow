# Arquitetura - ProjetoNOC

## Visão Geral

ProjetoNOC é um sistema de gerenciamento de ocorrências construído como um **monorepo** com tecnologias modernas para web e mobile.

```
┌─────────────────────────────────────────────────────────┐
│                    Cliente Web (Next.js)                 │
│                   Client Mobile (Expo)                   │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/REST
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Backend API (Express + Node)                │
│         Authentication (JWT) & Validation (Zod)          │
└──────────────────────┬──────────────────────────────────┘
                       │ MongoDB Driver
                       ▼
┌─────────────────────────────────────────────────────────┐
│           MongoDB Atlas (Cloud Database)                 │
└─────────────────────────────────────────────────────────┘
```

## Monorepo Structure

### apps/
Aplicações cliente (web e mobile)

- **web/**: Next.js 15 app router
  - SSR, static generation
  - Tailwind CSS para styling
  - React Hook Form para forms
  - SWR para data fetching

- **mobile/**: Expo + React Native
  - Cross-platform (iOS/Android/Web)
  - Expo Router para navegação
  - NativeWind para Tailwind em RN
  - Mesmo API client que web

### services/
Backend e APIs

- **api/**: Express.js server
  - REST API endpoints
  - MongoDB com Mongoose
  - JWT authentication
  - Zod para validação

### packages/
Código compartilhado entre web e mobile

- **shared/**: Types e utilities
  - TypeScript interfaces
  - Zod schemas para validação
  - Constantes e enums
  - Helper functions

- **api-client/**: Cliente HTTP
  - Axios instance configurado
  - Endpoints tipados
  - Token management
  - Interceptors para auth

## Fluxo de Autenticação

```
1. Usuário preenche email/password
   ▼
2. POST /api/auth/login (ou register)
   ▼
3. Backend valida e retorna JWT token
   ▼
4. Client armazena token em localStorage
   ▼
5. Todas as requisições incluem: Authorization: Bearer <token>
   ▼
6. Backend valida token no middleware
   ▼
7. Requisição processada ou rejeitada
```

## Fluxo de Dados

### Criar Ocorrência

```
1. User submete form com título, descrição, etc
2. Web app valida com Zod schema (shared)
3. POST /api/occurrences com token JWT
4. Backend valida novamente
5. Mongoose cria documento no MongoDB
6. Retorna occurrence completa com _id
7. UI renderiza e exibe sucesso
```

### Atualizar Status

```
1. User clica botão "Em Andamento"
2. PUT /api/occurrences/:id com novo status
3. Backend registra mudança no history
4. history.push({ field: 'status', oldValue, newValue, ... })
5. MongoDB atualiza documento
6. Client refetch ou update otimista
7. UI reflete mudança
```

## Decisões Arquiteturais

### 1. Monorepo vs Repositórios Separados

**Escolhido:** Monorepo com pnpm workspaces

**Vantagens:**
- Compartilhamento fácil de código (types, schemas, utilitários)
- Versionamento atomic (todas as partes evoluem juntas)
- CI/CD mais simples

**Desvantagens:**
- Curva de aprendizado maior
- Requer coordenação ao refatorar

### 2. MongoDB vs Alternativas

**Escolhido:** MongoDB com Mongoose

**Razões:**
- Flexibilidade de schema (ótimo para MVP)
- MongoDB Atlas gratuito
- Documento denormalizado ideal para ocorrências
- Ecossistema Node.js maduro

**Alternativas descartadas:**
- PostgreSQL: Schema rígido, overkill inicial
- Firebase: Menos controle, mais caro
- DynamoDB: Complexo para começar

### 3. JWT vs Session-based Auth

**Escolhido:** JWT (stateless)

**Razões:**
- Melhor para APIs REST
- Funciona bem em mobile
- Escalável (sem estado no servidor)
- Suporta múltiplos clientes

### 4. Express vs Alternativas

**Escolhido:** Express

**Razões:**
- Simples e bem documentado
- Ecossistema grande
- Middleware pattern familiar
- Rápido para MVPs

**Alternativas:**
- NestJS: Melhor arquitetura, mais boilerplate
- Fastify: Mais rápido, menos maduro
- Next.js API routes: Possível, mas Express é mais flexível

### 5. Next.js vs React + Vite

**Escolhido:** Next.js 15

**Razões:**
- SSR built-in (melhor SEO)
- App Router moderno
- API routes integradas (se necessário)
- Deploy simples (Vercel)

## Escalabilidade

### Curto Prazo (MVP)
- MongoDB Atlas M0 (gratuito)
- Express em um único processo
- Deploy: Vercel (web), Render/Railway (API)

### Médio Prazo
- Cache com Redis
- Pagination para ocorrências
- Database indices em campos frequentes
- Load balancing

### Longo Prazo
- Microserviços
- Message queue (RabbitMQ/Kafka)
- Real-time com WebSockets
- Elasticsearch para busca

## Segurança

### Implementado

✅ Hashing de senha com bcrypt
✅ JWT com expiração
✅ CORS whitelist
✅ Validação com Zod
✅ Sem exposição de password em respostas

### Faltando (prod)

❌ Rate limiting
❌ HTTPS/SSL
❌ OWASP compliance scan
❌ Encrypted database
❌ API key management
❌ Audit logging
❌ 2FA

## Performance

### Frontend
- Next.js automatic code splitting
- Image optimization
- CSS-in-JS com Tailwind (atomic CSS)
- React.memo para componentes heavy

### Backend
- MongoDB index em `status`, `assignedTo`
- Pagination automática (limit/offset)
- JSON responses otimizadas

### Mobile
- Lazy loading de ocorrências
- Image caching
- Bundle size otimizado

## Testing (Não implementado)

```
apps/web/
  ├── __tests__/
  │   ├── components/
  │   ├── pages/
  │   └── utils/

services/api/
  ├── __tests__/
  │   ├── auth/
  │   ├── occurrences/
  │   └── middleware/

packages/shared/
  └── __tests__/
      └── utils/
```

## CI/CD (Não implementado)

- GitHub Actions para:
  - Lint + format check
  - Type checking
  - Unit tests
  - Build verification
  - Deploy automático ao merge em main

## Roadmap

- [ ] Search/filter avançado
- [ ] Relatórios e analytics
- [ ] Notificações em tempo real (WebSocket)
- [ ] Upload de anexos (S3/GCS)
- [ ] Export para PDF/Excel
- [ ] Integração com Slack
- [ ] 2FA e OAuth
- [ ] Themes (dark mode)

---

**Para detalhes de setup, veja:** [setup.md](./setup.md)
**Para API endpoints, veja:** [api.md](./api.md)
