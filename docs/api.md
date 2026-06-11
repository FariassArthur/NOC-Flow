# Documentação da API REST - CCore

## Base URL

```
http://localhost:3001/api
```

## Autenticação

Todas as requisições (exceto login/register) requerem um header:

```
Authorization: Bearer <token_jwt>
```

## Endpoints

### Auth

#### POST /auth/login

Fazer login com email e senha

**Request:**

```json
{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

**Response (200):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "7d"
}
```

#### POST /auth/register

Criar nova conta

**Request:**

```json
{
  "email": "novo@example.com",
  "password": "senha123",
  "fullName": "João Silva",
  "department": "Análise de Redes",
  "role": "analyst"
}
```

**Response (201):** Mesmo que login

#### GET /auth/me

Obter dados do usuário autenticado

**Response (200):**

```json
{
  "_id": "...",
  "email": "usuario@example.com",
  "fullName": "João Silva",
  "department": "Análise de Redes",
  "role": "analyst",
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-01T10:00:00Z"
}
```

### Ocorrências

#### GET /occurrences

Listar todas as ocorrências

**Query Parameters:**

- `status` - Filtrar por status (aberta, em_andamento, pausada, fechada)
- `assignedTo` - Filtrar por usuário atribuído
- `priority` - Filtrar por prioridade (baixa, média, alta, crítica)

**Response (200):**

```json
[
  {
    "_id": "...",
    "title": "DNS indisponível",
    "description": "Servidor DNS principal não está respondendo",
    "status": "aberta",
    "priority": "alta",
    "tags": ["dns", "crítico"],
    "assignedTo": "...",
    "dueDate": "2024-01-02T18:00:00Z",
    "timeSpentMinutes": 0,
    "createdBy": "...",
    "comments": [],
    "attachments": [],
    "history": [],
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:00:00Z"
  }
]
```

#### POST /occurrences

Criar nova ocorrência

**Request:**

```json
{
  "title": "Conexão lenta no setor A",
  "description": "Usuários relatando conexão lenta desde 9:30",
  "priority": "média",
  "tags": ["conectividade", "urgente"],
  "assignedTo": "user-id-opcional",
  "dueDate": "2024-01-02T18:00:00Z"
}
```

**Response (201):** Objeto occurrence completo

#### GET /occurrences/:id

Obter detalhes de uma ocorrência

**Response (200):** Objeto occurrence completo

#### PUT /occurrences/:id

Atualizar ocorrência

**Request:** (todos os campos opcionais)

```json
{
  "status": "em_andamento",
  "timeSpentMinutes": 30,
  "tags": ["conectividade", "urgente", "resolvido"]
}
```

**Response (200):** Objeto occurrence atualizado com histórico

#### DELETE /occurrences/:id

Deletar ocorrência

**Response (200):**

```json
{
  "message": "Occurrence deleted"
}
```

#### POST /occurrences/:id/comments

Adicionar comentário

**Request:**

```json
{
  "text": "Reiniciando os roteadores do setor A"
}
```

**Response (200):** Objeto occurrence atualizado

## Status HTTP

- **200** - Sucesso
- **201** - Criado
- **400** - Erro de validação
- **401** - Não autenticado
- **404** - Não encontrado
- **409** - Conflito (ex: email já existe)
- **500** - Erro do servidor

## Exemplos com cURL

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"senha123"}'
```

### Listar Ocorrências

```bash
curl -X GET http://localhost:3001/api/occurrences \
  -H "Authorization: Bearer seu-token-aqui"
```

### Criar Ocorrência

```bash
curl -X POST http://localhost:3001/api/occurrences \
  -H "Authorization: Bearer seu-token-aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Teste",
    "description": "Descrição do teste",
    "priority": "média"
  }'
```

## Erros

Respostas de erro seguem este formato:

```json
{
  "error": "Mensagem de erro",
  "details": [
    {
      "field": "email",
      "message": "Email inválido"
    }
  ]
}
```

## Rate Limiting

Não implementado na versão básica. Configure em produção!

## Versioning

Versão atual: 1.0.0
API versioning via URL: `/api/v1/...` (futuro)
