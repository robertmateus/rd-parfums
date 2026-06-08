# 🔐 Guia de Segurança - RD Parfums

Este documento detalha as medidas de segurança implementadas e boas práticas para manter seu projeto seguro.

---

## 🛡️ Segurança Implementada

### 1. **Variáveis de Ambiente Protegidas**

✅ **O que foi feito:**
- Todas as credenciais movidas para variáveis de ambiente
- Arquivo `.env.local` nunca é commitado (`.gitignore` configurado)
- Diferentes variáveis para desenvolvimento e produção
- Vercel gerencia variáveis de forma segura

✅ **Checklist:**
```
[ ] .env.local criado e preenchido
[ ] .env.local está no .gitignore
[ ] Nunca fez git add .env.local
[ ] Verificou se o .env foi commitado anteriormente
    → Se sim: git rm --cached .env && git commit -m "Remove .env"
```

### 2. **Credenciais Firebase Seguras**

✅ **Por que Firebase Web API Keys são seguras:**
- Têm um prefixo `VITE_` (indicando que são públicas)
- São projetadas para serem expostas no frontend
- Funcionam apenas com as Regras de Segurança do Firebase
- Sem chave de servidor, não é possível acessar dados sensíveis

✅ **Proteção adicional:**
```typescript
// ✅ Seguro - Público, protegido por regras
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

// ❌ NUNCA exponha isso no frontend
const adminConfig = {
  serviceAccountKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
};
```

### 3. **Firestore Security Rules**

✅ **Regras configuradas em `firestore.rules`:**

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Apenas leitura pública para catálogo
    match /perfumes/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Proteção de dados sensíveis
    match /quotes/{document=**} {
      allow read: if resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
      allow update, delete: if resource.data.userId == request.auth.uid;
    }
  }
}
```

### 4. **Build Otimizado para Produção**

✅ **Vite configurado para segurança:**
- Source maps apenas em desenvolvimento
- Minification habilitado em produção
- Bundle splitting para melhor caching
- Sem logs sensíveis em produção

---

## ⚠️ Vulnerabilidades Comuns (EVITE!)

### ❌ NUNCA faça isso:

```typescript
// ❌ Nunca commit .env
git add .env

// ❌ Nunca exponha chaves no código
const apiKey = "AIzaSyD..."; // ❌ INSEGURO!

// ❌ Nunca logue credenciais em produção
console.log("Firebase Config:", firebaseConfig); // ❌ Expõe dados

// ❌ Nunca confie apenas em validação frontend
if (user.isAdmin) { // ❌ Pode ser alterado no DevTools
  // Executar ação de admin
}

// ❌ Nunca acesse dados sem autenticação
const quotes = await getDocs(collection(db, "quotes")); // ❌ Sem validação
```

### ✅ Faça assim:

```typescript
// ✅ Use variáveis de ambiente
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

// ✅ Valide no backend (quando implementar)
if (await checkAdminStatus(userId)) {
  // Executar ação segura
}

// ✅ Especifique usuário nas queries
const userQuotes = query(
  collection(db, "quotes"),
  where("userId", "==", currentUser.uid)
);

// ✅ Trate erros apropriadamente
try {
  const data = await getDocs(userQuotes);
} catch (error) {
  console.error("Erro ao buscar quotes (apenas em dev)");
  // Não exponha detalhes em produção
}
```

---

## 🔄 Rotinas de Segurança

### **Mensal:**
- [ ] Revisar logs do Firestore no Firebase Console
- [ ] Verificar regras do Firestore (nenhuma regra aberta)
- [ ] Monitorar abuso de quotas

### **Trimestral:**
- [ ] Rotacionar chaves Firebase
  ```
  Firebase Console → Settings → Service Accounts → Generate new private key
  ```
- [ ] Revisar colaboradores do projeto
- [ ] Atualizar dependências de segurança
  ```bash
  npm audit fix
  npm update
  ```

### **Anual:**
- [ ] Auditar todas as variáveis de ambiente
- [ ] Revisar política de acesso no Firebase
- [ ] Planejar migração de infraestrutura se necessário

---

## 📊 Checklist de Segurança Pré-Deploy

```
Segurança
─────────────────────────────────────────
[ ] .env.local NÃO foi commitado
[ ] Todas as VITE_FIREBASE_* estão preenchidas
[ ] Firestore rules foram revisadas
[ ] CORS está configurado no Firebase
[ ] API Key está restrita a domínios corretos

Configuração
─────────────────────────────────────────
[ ] vercel.json criado
[ ] Variáveis adicionadas na Vercel Dashboard
[ ] Build local funciona: npm run build
[ ] npm run lint passa sem erros

Performance & Monitoramento
─────────────────────────────────────────
[ ] Source maps apenas em dev
[ ] Bundle size < 500KB
[ ] Nenhum console.log() sensível em produção
[ ] Error tracking configurado (recomendado)

Documentação
─────────────────────────────────────────
[ ] README.md atualizado
[ ] SETUP_VERCEL.md disponível para time
[ ] .env.example completo e atualizado
```

---

## 🆘 Se Credenciais Foram Expostas

**AÇÃO IMEDIATA (< 5 minutos):**

1. **Regenerar todas as chaves no Firebase**
   ```
   Firebase Console → Project Settings → Service Accounts → Generate new key
   ```

2. **Atualizar em todos os ambientes**
   - `.env.local` (local)
   - Vercel Dashboard (produção)

3. **Forçar novo build**
   ```bash
   npm run build
   git push  # Aciona rebuild na Vercel
   ```

4. **Revisar logs**
   - Firestore Console → Logs
   - Cloud Audit Logs
   - Vercel Analytics

---

## 📚 Referências

- [Firebase Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [OWASP Top 10 Web](https://owasp.org/www-project-top-ten/)
- [Vite Security](https://vitejs.dev/guide/features.html#security)
- [Vercel Security](https://vercel.com/docs/security)

---

## ✅ Status de Segurança

| Item | Status | Data |
|------|--------|------|
| Variáveis de Ambiente | ✅ | 2024-06-08 |
| Vite Configuration | ✅ | 2024-06-08 |
| Vercel Setup | ✅ | 2024-06-08 |
| Firestore Rules | ⏳ | Manual |

---

**Dúvidas sobre segurança?** Entre em contato com o time de desenvolvimento.
