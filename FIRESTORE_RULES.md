# 🛡️ Guia: Firestore Security Rules

Seu projeto já tem regras de segurança implementadas. Este guia explica e mostra como personalizá-las.

---

## 📖 O que você tem

Seu `firestore.rules` está configurado com:

```firestore
✅ Catálogo público para leitura
✅ Apenas admins podem editar
✅ Validação de dados rigorosa
✅ Emails de admin definidos
```

---

## 🔍 Como funciona atualmente

### Leitura do Catálogo (PÚBLICA)
```firestore
match /perfumes/{perfumeId} {
  allow read, get, list: if true;  // ✅ Qualquer pessoa pode ver
}
```

**O que funciona:**
- ✅ Site mostra perfumes para visitantes
- ✅ Nenhuma autenticação necessária
- ✅ Performance rápida

### Edição (ADMIN APENAS)
```firestore
match /perfumes/{perfumeId} {
  allow create: if isAdmin() && isValidPerfume(request.resource.data);
  allow update: if isAdmin() && isValidPerfume(request.resource.data);
  allow delete: if isAdmin();
}
```

**O que funciona:**
- ✅ Apenas emails cadastrados podem editar
- ✅ Dados são validados antes de salvar
- ✅ Protege contra dados ruins

---

## ✋ Validação Atual

Sua função `isValidPerfume()` valida:

```firestore
✅ Nome: string entre 1-200 chars
✅ Preço: número >= 0
✅ Categoria: "MASCULINO" ou "FEMININO"
✅ Family: string até 200 chars
✅ Imagem: URL até 1000 chars
✅ Descrição: até 2000 chars
✅ Intensidade: "Suave", "Moderado" ou "Intenso"
✅ Notas: max 10 items cada (top/heart/base)
✅ Volumes: max 10 items
```

---

## 🔑 Admins Cadastrados

Seu projeto permite edições de:
- `contatorobertgomes@gmail.com`
- `admin@rdparfums.com`

### Adicionar novo admin

Edite `firestore.rules`:

```firestore
function isAdmin() {
  return isSignedIn() && 
    request.auth.token.email != null && (
      request.auth.token.email.lower() == 'contatorobertgomes@gmail.com' ||
      request.auth.token.email.lower() == 'admin@rdparfums.com' ||
      request.auth.token.email.lower() == 'novo.admin@rdparfums.com'  // ← NOVO
    );
}
```

Depois deploy:
```bash
firebase deploy --only firestore:rules
```

---

## 🆕 Exemplo: Adicionar Sistema de Quotes/Orçamentos

Se quiser que usuários salvem orçamentos:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ... (regras anteriores)
    
    // Novo: Quotes/Orçamentos dos usuários
    match /quotes/{quoteId} {
      // Usuários veem seus próprios quotes
      allow read: if resource.data.userId == request.auth.uid;
      
      // Usuários autenticados podem criar
      allow create: if request.auth != null && 
                     request.auth.uid == request.resource.data.userId &&
                     isValidQuote(request.resource.data);
      
      // Usuários podem atualizar seus próprios
      allow update: if resource.data.userId == request.auth.uid &&
                     isValidQuote(request.resource.data);
      
      // Usuários podem deletar seus próprios
      allow delete: if resource.data.userId == request.auth.uid;
    }
    
    // Função de validação para quotes
    function isValidQuote(data) {
      return data.userId is string &&
             data.createdAt is timestamp &&
             data.items is list &&
             data.totalPrice is number;
    }
  }
}
```

---

## 📞 Exemplo: Formulário de Contato

Para um formulário público (sem autenticação):

```firestore
match /contacts/{contactId} {
  // Qualquer pessoa pode enviar
  allow create: if isValidContact(request.resource.data);
  
  // Admins leem
  allow read: if isAdmin();
  
  // Nada de update/delete público
}

function isValidContact(data) {
  return data.name is string && data.name.size() > 0 &&
         data.email is string && data.email.matches('.*@.*\\..*') &&
         data.message is string && data.message.size() > 0 &&
         data.createdAt is timestamp;
}
```

---

## ⏰ Exemplo: Rate Limiting

Previne spam:

```firestore
match /messages/{messageId} {
  allow create: if isSignedIn() &&
                request.time > resource.data.lastMessageTime + duration.value(1, 's');
  // Apenas 1 mensagem por segundo
}
```

---

## 🧹 Limpeza de Dados Antigos

```firestore
match /quotes/{quoteId} {
  // Deleta automaticamente quotes com mais de 1 ano
  allow read: if resource.data.createdAt > now - duration.value(365, 'd');
}
```

---

## 🔐 Boas Práticas

### ✅ Faça:
- Sempre valide dados
- Use `isSignedIn()` para proteger
- Especifique exatamente quem acessa
- Teste as regras antes de deploy

### ❌ Não faça:
```firestore
// ❌ NUNCA: Allow tudo
allow read, write: if true;

// ❌ NUNCA: Sem validação
allow write: if request.auth != null;

// ❌ NUNCA: Confie no frontend
// (regras devem ser a única proteção)
```

---

## 🧪 Testar Regras Localmente

```bash
# 1. Inicie o emulador
firebase emulators:start

# 2. Abra em outro terminal
firebase emulators:exec ./test.js

# 3. No seu código de teste
const db = firebase.firestore();
db.useEmulator("localhost", 8080);

// Agora pode testar sem afetar produção
```

---

## 🚀 Deploy de Regras

```bash
# Valida sintaxe
firebase deploy --dry-run --only firestore:rules

# Deploy real
firebase deploy --only firestore:rules
```

**Antes de fazer deploy:**
- [ ] Testou localmente?
- [ ] Seus admins estão na lista?
- [ ] Validações fazem sentido?
- [ ] Nenhuma regra aberta acidentalmente?

---

## 📊 Exemplo Completo (Produção)

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
    
    // Helpers
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isSignedIn() && 
        request.auth.token.email != null && (
          request.auth.token.email.lower() == 'contatorobertgomes@gmail.com' ||
          request.auth.token.email.lower() == 'admin@rdparfums.com'
        );
    }
    
    // === PERFUMES (Catálogo) ===
    match /perfumes/{perfumeId} {
      allow read: if true;  // Público
      allow write: if isAdmin();  // Admin only
    }
    
    // === QUOTES (Orçamentos) ===
    match /quotes/{quoteId} {
      allow read: if resource.data.userId == request.auth.uid;
      allow create: if isSignedIn();
      allow update, delete: if resource.data.userId == request.auth.uid;
    }
    
    // === ADMIN ===
    match /admin/{document=**} {
      allow read, write: if isAdmin();
    }
  }
}
```

---

## 📞 Recursos

- **Firebase Rules Docs**: https://firebase.google.com/docs/firestore/security/get-started
- **Rules Simulator**: Firebase Console → Firestore → Rules → Test
- **Tutorial**: https://firebase.google.com/docs/firestore/security/rules-query

---

**Dica**: Use o "Rules Simulator" no Firebase Console para testar antes de fazer deploy!
