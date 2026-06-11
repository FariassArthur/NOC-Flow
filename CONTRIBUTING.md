# Contributing to CCore

## Convenções do Projeto

### Commits

```bash
# Bom
git commit -m "feat: adicionar filtro de prioridade às ocorrências"
git commit -m "fix: corrigir erro de validação no login"
git commit -m "docs: atualizar setup.md com passo de MongoDB"
git commit -m "refactor: simplificar lógica de atribuição"

# Ruim
git commit -m "fix"
git commit -m "ajustes"
git commit -m "update"
```

**Prefixos:**

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `refactor:` - Refatoração de código
- `test:` - Testes
- `chore:` - Build, deps, CI/CD

### Branches

```bash
# Feature
git checkout -b feature/autenticacao-2fa

# Bugfix
git checkout -b fix/erro-login

# Hotfix
git checkout -b hotfix/crash-app-mobile
```

## Adicionando Tipos Compartilhados

Se adicionar um novo tipo compartilhado:

1. Crie em `packages/shared/src/types/`
2. Exporte em `packages/shared/src/types/index.ts`
3. Use em `packages/api-client/` e nas apps

```typescript
// packages/shared/src/types/notification.ts
export interface Notification {
  _id?: ObjectId | string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

// packages/shared/src/types/index.ts
export * from './notification'; // ← adicionar
```

## Adicionando Validações

Use Zod para manter tipos e validação sincronizados:

```typescript
// packages/shared/src/schemas/notificationSchema.ts
import { z } from 'zod';

export const notificationSchema = z.object({
  message: z.string().min(1),
  isRead: z.boolean().default(false),
});

export type NotificationInput = z.infer<typeof notificationSchema>;
```

## Adicionando Endpoints API

1. Criar controller em `services/api/src/routes/`
2. Criar rota em `services/api/src/routes/`
3. Registrar em `services/api/src/server.ts`
4. Adicionar client em `packages/api-client/src/endpoints.ts`

```typescript
// services/api/src/routes/notificationsController.ts
export const listNotifications = async (req: AuthRequest, res: Response) => {
  // ...
};

// services/api/src/routes/notifications.ts
router.get('/', listNotifications);

// services/api/src/server.ts
app.use('/api/notifications', notificationRoutes);

// packages/api-client/src/endpoints.ts
export const notificationAPI = {
  list: async () => {
    const response = await apiClient.instance.get<Notification[]>('/api/notifications');
    return response.data;
  },
};
```

## Adicionando Componentes Web

Coloque componentes em `apps/web/components/`:

```typescript
// apps/web/components/OccurrenceCard.tsx
'use client';

import { Occurrence } from '@ccore/shared';

interface OccurrenceCardProps {
  occurrence: Occurrence;
  onClick?: () => void;
}

export function OccurrenceCard({ occurrence, onClick }: OccurrenceCardProps) {
  return (
    <div className="card cursor-pointer hover:shadow-lg" onClick={onClick}>
      <h3 className="font-semibold">{occurrence.title}</h3>
      <p className="text-sm text-gray-600">{occurrence.description}</p>
    </div>
  );
}
```

## Adicionando Telas Mobile

Coloque telas em `apps/mobile/app/`:

```typescript
// apps/mobile/app/(tabs)/index.tsx
import { View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-xl font-bold">Bem-vindo!</Text>
    </View>
  );
}
```

## Testing (When Implemented)

```bash
# Web
pnpm --filter=@ccore/web test

# API
pnpm --filter=@ccore/api test

# Shared
pnpm --filter=@ccore/shared test

# Coverage
pnpm --filter=@ccore/api test -- --coverage
```

## Code Quality

```bash
# Lint tudo
pnpm lint

# Format tudo
pnpm format

# Type check tudo
pnpm type-check
```

## Performance Tips

### Frontend

- Use `React.memo()` para componentes heavy
- `useMemo()` e `useCallback()` com cuidado (não prematuramente)
- Code splitting automático com Next.js
- Image optimization built-in

### Backend

- Sempre paginar: `limit(20).skip(offset)`
- Index campos frequentes em queries
- Validar input com Zod antes de DB
- Usar `select()` para não retornar password

### Mobile

- Lazy load imagens
- Cache responses com SWR
- Minimize bundle size
- Test em device real antes de deploy

## Security Checklist

- [ ] Nunca exponha `password` em responses
- [ ] Sempre use JWT para autenticação
- [ ] Valide input com Zod antes de DB
- [ ] Use CORS whitelist
- [ ] Rate limit endpoints públicos (TODO)
- [ ] Hash senhas com bcrypt
- [ ] HTTPS em produção (TODO)

## Deploying

### Web (Vercel)

```bash
git push origin main
# Deploy automático via Vercel
```

### API (Render/Railway)

```bash
git push origin main
# Deploy automático via Render/Railway
```

### Mobile (EAS)

```bash
eas build --platform ios
eas build --platform android
```

## PR Template

```markdown
## Description

O que mudou e por quê?

## Type

- [ ] Feature
- [ ] Bug fix
- [ ] Documentation
- [ ] Refactor

## Testing

Como testar?

## Checklist

- [ ] Code segue conventions
- [ ] Tests passam
- [ ] Documentação atualizada
- [ ] Sem warnings no console
```

---

**Dúvidas? Abra uma issue ou PR!** 🤝
