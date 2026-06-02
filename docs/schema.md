# Schema MongoDB - ProjetoNOC

## Collections

### users

```typescript
{
  _id: ObjectId,
  email: string,           // unique, lowercase
  password: string,        // bcrypt hashed
  fullName: string,
  department: string,
  role: 'viewer' | 'analyst' | 'admin',
  avatar?: string,
  createdAt: Date,
  updatedAt: Date
}
```

**Indices:**
```javascript
db.users.createIndex({ email: 1 })
db.users.createIndex({ createdAt: -1 })
```

---

### occurrences

```typescript
{
  _id: ObjectId,

  // BÁSICO
  title: string,
  description: string,
  status: 'aberta' | 'em_andamento' | 'pausada' | 'fechada',
  createdAt: Date,

  // ATRIBUIÇÃO
  assignedTo?: ObjectId,     // ref: users._id
  priority: 'baixa' | 'média' | 'alta' | 'crítica',
  tags: [string],

  // SLA & RASTREAMENTO
  dueDate?: Date,
  timeSpentMinutes: number,
  createdBy: ObjectId,       // ref: users._id

  // HISTÓRICO COMPLETO
  comments: [
    {
      _id?: ObjectId,
      author: ObjectId,      // ref: users._id
      text: string,
      createdAt: Date
    }
  ],

  attachments: [
    {
      _id?: ObjectId,
      fileName: string,
      fileUrl: string,
      uploadedAt: Date
    }
  ],

  history: [
    {
      _id?: ObjectId,
      field: string,
      oldValue: string,
      newValue: string,
      changedBy: ObjectId,   // ref: users._id
      changedAt: Date
    }
  ],

  updatedAt: Date
}
```

**Indices:**
```javascript
db.occurrences.createIndex({ status: 1 })
db.occurrences.createIndex({ assignedTo: 1 })
db.occurrences.createIndex({ priority: 1 })
db.occurrences.createIndex({ createdBy: 1 })
db.occurrences.createIndex({ createdAt: -1 })
db.occurrences.createIndex({ tags: 1 })
db.occurrences.createIndex({ dueDate: 1 })

// Compound index para queries comuns
db.occurrences.createIndex({ status: 1, assignedTo: 1, priority: -1 })
```

## Exemplos de Documentos

### User

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "email": "joao.silva@company.com",
  "password": "$2a$10$abcdefg...",
  "fullName": "João Silva",
  "department": "Análise de Redes",
  "role": "analyst",
  "avatar": "https://...",
  "createdAt": ISODate("2024-01-01T10:00:00.000Z"),
  "updatedAt": ISODate("2024-01-01T10:00:00.000Z")
}
```

### Occurrence

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "title": "DNS Principal Indisponível",
  "description": "Servidor DNS 8.8.8.8 não está respondendo. Impacto: todos os usuários. Iniciado em 09:30",
  "status": "em_andamento",
  "priority": "crítica",
  "tags": ["dns", "crítico", "prod"],
  "assignedTo": ObjectId("507f1f77bcf86cd799439011"),
  "createdBy": ObjectId("507f1f77bcf86cd799439010"),
  "dueDate": ISODate("2024-01-01T18:00:00.000Z"),
  "timeSpentMinutes": 45,
  
  "comments": [
    {
      "_id": ObjectId("507f1f77bcf86cd799439013"),
      "author": ObjectId("507f1f77bcf86cd799439011"),
      "text": "Reinicializando o servidor DNS. Aguarde 5 minutos.",
      "createdAt": ISODate("2024-01-01T10:15:00.000Z")
    },
    {
      "_id": ObjectId("507f1f77bcf86cd799439014"),
      "author": ObjectId("507f1f77bcf86cd799439010"),
      "text": "DNS online novamente. Monitorando.",
      "createdAt": ISODate("2024-01-01T10:20:00.000Z")
    }
  ],

  "attachments": [
    {
      "_id": ObjectId("507f1f77bcf86cd799439015"),
      "fileName": "dns-error.log",
      "fileUrl": "https://storage.example.com/dns-error.log",
      "uploadedAt": ISODate("2024-01-01T10:05:00.000Z")
    }
  ],

  "history": [
    {
      "_id": ObjectId("507f1f77bcf86cd799439016"),
      "field": "status",
      "oldValue": "aberta",
      "newValue": "em_andamento",
      "changedBy": ObjectId("507f1f77bcf86cd799439011"),
      "changedAt": ISODate("2024-01-01T10:05:00.000Z")
    },
    {
      "_id": ObjectId("507f1f77bcf86cd799439017"),
      "field": "timeSpentMinutes",
      "oldValue": "0",
      "newValue": "45",
      "changedBy": ObjectId("507f1f77bcf86cd799439011"),
      "changedAt": ISODate("2024-01-01T10:50:00.000Z")
    }
  ],

  "createdAt": ISODate("2024-01-01T10:00:00.000Z"),
  "updatedAt": ISODate("2024-01-01T10:50:00.000Z")
}
```

## Queries Comuns

### Listar ocorrências abertas
```javascript
db.occurrences
  .find({ status: 'aberta' })
  .sort({ createdAt: -1 })
  .limit(20)
```

### Ocorrências críticas atribuídas a um usuário
```javascript
db.occurrences.find({
  priority: 'crítica',
  assignedTo: ObjectId("..."),
  status: { $ne: 'fechada' }
})
```

### Ocorrências vencidas
```javascript
db.occurrences.find({
  dueDate: { $lt: new Date() },
  status: { $ne: 'fechada' }
})
```

### Ocorrências por responsável (agregação)
```javascript
db.occurrences.aggregate([
  {
    $group: {
      _id: '$assignedTo',
      count: { $sum: 1 },
      openCount: {
        $sum: {
          $cond: [{ $eq: ['$status', 'aberta'] }, 1, 0]
        }
      }
    }
  },
  { $lookup: {
      from: 'users',
      localField: '_id',
      foreignField: '_id',
      as: 'user'
    }
  }
])
```

## Validações

### User
- email: Email válido, único
- password: Min 6 caracteres, hashed
- fullName: Min 2 caracteres
- role: Um de [viewer, analyst, admin]

### Occurrence
- title: Min 1 caractere
- description: Min 10 caracteres
- priority: Um de [baixa, média, alta, crítica]
- status: Um de [aberta, em_andamento, pausada, fechada]
- tags: Array de strings
- timeSpentMinutes: Número >= 0

## Backup & Restore

### MongoDB Atlas Backup
- Snapshots automáticos a cada 12 horas
- Retenção: 30 dias para plano free
- Download manualmente de backups

### Restore Local
```bash
mongorestore --uri="mongodb://..." --archive=backup.archive
```

## Tamanho Esperado

Para 10.000 ocorrências com média de:
- 5 comentários cada
- 2 anexos cada
- 8 históricos cada

Estimativa: ~100-200 MB de dados

## Migração de Dados

Se integrar com outro sistema:

```javascript
// Exemplo: importar de CSV
db.occurrences.insertMany([
  {
    title: "...",
    description: "...",
    status: "fechada",
    priority: "baixa",
    createdBy: ObjectId("..."),
    // ...
  }
])
```

---

**Veja também:**
- [API Documentation](./api.md)
- [Architecture](./architecture.md)
