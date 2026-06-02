# 🚀 Quick Start - ProjetoNOC

## 30 segundos para começar

```bash
# 1. Instalar dependências
pnpm install

# 2. Setup variáveis de ambiente
cp services/api/.env.example services/api/.env.local
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env.local

# 3. Editar services/api/.env.local com seu MongoDB URI
# Pegar em https://www.mongodb.com/cloud/atlas

# 4. Rodar em desenvolvimento
pnpm dev

# 5. Acessar
# - Web: http://localhost:3000
# - API: http://localhost:3001/health
# - Mobile: Terminal > Press 'i' para iOS ou 'a' para Android
```

## Qual é qual?

| Projeto | Porta | Comando | Usar para |
|---------|-------|---------|-----------|
| Web (Next.js) | 3000 | `pnpm --filter=@noc/web dev` | Interface web |
| API (Express) | 3001 | `pnpm --filter=@noc/api dev` | Backend |
| Mobile (Expo) | 19000 | `pnpm --filter=@noc/mobile start` | App mobile |

## Primeiros passos no app

1. Registre uma conta em http://localhost:3000
2. Faça login
3. Clique em "Criar Ocorrência"
4. Preencha com dados de teste
5. Pronto! 🎉

## Precisa de um diagrama?

```
┌─────────────────┐
│  Seu Navegador  │ → http://localhost:3000
└────────┬────────┘
         │ (HTTP)
         ▼
┌─────────────────────────────┐
│   Express API Backend       │ → http://localhost:3001
│  (autenticação + dados)     │
└────────┬────────────────────┘
         │ (MongoDB Driver)
         ▼
┌─────────────────────────────┐
│   MongoDB Atlas (Nuvem)     │
│  (seu banco de dados)       │
└─────────────────────────────┘
```

## Estrutura de pasta

```
ProjetoNOC/
├── apps/web/          ← Seu site
├── apps/mobile/       ← Seu app de celular
├── services/api/      ← Seu servidor
├── packages/shared/   ← Código compartilhado (tipos, validação)
└── docs/              ← Documentação
```

## Scripts mais usados

```bash
# Tudo junto
pnpm dev

# Só web
pnpm --filter=@noc/web dev

# Só API
pnpm --filter=@noc/api dev

# Só mobile
pnpm --filter=@noc/mobile start

# Type checking (verifica erros TypeScript)
pnpm type-check

# Formatar código
pnpm format

# Build para produção
pnpm build
```

## Problemas comuns

### "Porta 3001 em uso"
Mudança em `services/api/.env.local`:
```env
PORT=3002
```

### "MongoDB connection failed"
- Verifica MONGODB_URI em `services/api/.env.local`
- Copia corretamente do MongoDB Atlas
- Adiciona teu IP na whitelist: https://docs.mongodb.com/manual/reference/security-network-access/

### "pnpm command not found"
```bash
npm install -g pnpm
```

### "Cannot find module '@noc/shared'"
```bash
# Reinstala
pnpm install
```

## Próximas lições

1. Crie uma página de detalhe da ocorrência
2. Implemente edição de ocorrências
3. Adicione comentários
4. Teste no seu celular com Expo

## Documentação completa

- 📖 [Setup Detalhado](./docs/setup.md)
- 🏗️ [Arquitetura](./docs/architecture.md)
- 🔌 [API REST](./docs/api.md)
- 📊 [Schema MongoDB](./docs/schema.md)

## Precisa de ajuda?

- Erro de TypeScript? → Verifica o tipo em `packages/shared/src/types/`
- Erro de validação? → Verifica o schema em `packages/shared/src/schemas/`
- Erro de API? → Verifica endpoint em `services/api/src/routes/`

---

**Boa sorte! 🍀**

Lembre-se: o pior erro é aquele que você não tentou corrigir. Investiguen logs, use debugger, e teste seus endpoints com curl/Postman!
