# 🚀 Guia de Configuração - Vercel + Firebase com Variáveis de Ambiente

## 📋 Índice
1. [Configuração Local](#configuração-local)
2. [Deploy na Vercel](#deploy-na-vercel)
3. [Segurança](#segurança)
4. [Troubleshooting](#troubleshooting)

---

## 🔧 Configuração Local

### 1. Copiar o arquivo de exemplo
```bash
cp .env.example .env.local
```

### 2. Preencher as variáveis de ambiente
Abra `.env.local` e preencha com suas credenciais Firebase:

```env
VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_id_do_projeto
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_id_sender
VITE_FIREBASE_APP_ID=seu_app_id
VITE_FIREBASE_MEASUREMENT_ID=seu_measurement_id
```

### 3. Encontrar suas credenciais Firebase
1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Selecione seu projeto
3. Clique em **Configurações do Projeto** (engrenagem) → **Geral**
4. Copie os valores em "Seu aplicativo da web"

### 4. Rodar localmente
```bash
npm install
npm run dev
```

---

## 🌐 Deploy na Vercel

### 1. Conectar repositório na Vercel
1. Acesse [Vercel](https://vercel.com)
2. Clique em **New Project**
3. Conecte seu repositório GitHub
4. Selecione o projeto `rd-parfums`

### 2. Configurar Variáveis de Ambiente

Na dashboard da Vercel, vá para **Settings** → **Environment Variables**

**Adicione as seguintes variáveis** (copie do seu `.env.local`):

| Chave | Valor | Escopo |
|-------|-------|--------|
| `VITE_FIREBASE_API_KEY` | *sua_api_key* | Production, Preview, Development |
| `VITE_FIREBASE_AUTH_DOMAIN` | *seu_auth_domain* | Production, Preview, Development |
| `VITE_FIREBASE_PROJECT_ID` | *seu_project_id* | Production, Preview, Development |
| `VITE_FIREBASE_STORAGE_BUCKET` | *seu_storage_bucket* | Production, Preview, Development |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | *seu_sender_id* | Production, Preview, Development |
| `VITE_FIREBASE_APP_ID` | *seu_app_id* | Production, Preview, Development |
| `VITE_FIREBASE_MEASUREMENT_ID` | *seu_measurement_id* | Production, Preview, Development |

### 3. Deploy automático
Qualquer push para a branch `main` fará deploy automático na Vercel.

---

## 🔒 Segurança

### ✅ O que foi feito para proteger seu projeto:

1. **Arquivo `.gitignore` atualizado**
   - `.env.local` e arquivos de ambiente são ignorados automaticamente
   - Seus arquivos sensíveis nunca serão commitados no Git

2. **Variáveis de Ambiente Protegidas**
   - Credenciais do Firebase **não estão no código**
   - Vercel gerencia as variáveis de forma segura
   - Diferentes variáveis para dev e production

3. **Vite Configuration Segura**
   - Source maps apenas em desenvolvimento
   - Minification ativado em produção
   - Bundle otimizado para segurança

### ⚠️ Boas práticas de segurança:

1. **NUNCA faça commit de `.env.local`** 🚫
   ```bash
   # ❌ Errado
   git add .env.local

   # ✅ Correto
   git add .env.example
   ```

2. **Rotacione suas chaves regularmente**
   - Altere sua `VITE_FIREBASE_API_KEY` a cada 3 meses
   - Use a opção "Regenerar chave" do Firebase Console

3. **Restrinja permissões no Firebase**
   - Configure regras de segurança adequadas no Firestore
   - Use autenticação antes de acessar dados sensíveis
   - Exemplo seguro em `firestore.rules`

4. **Variaveis públicas vs. privadas**
   - API Keys do Firebase no client são **seguras** (contêm `VITE_` prefix)
   - Dados sensíveis devem estar no backend (não implementado aqui)

---

## 🔐 Firestore Security Rules

Edite `firestore.rules` para proteger seus dados:

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read access to perfumes collection
    match /perfumes/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Protect admin data
    match /admin/{document=**} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Protect user quotes/orders
    match /quotes/{document=**} {
      allow read: if resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
      allow update, delete: if resource.data.userId == request.auth.uid;
    }
  }
}
```

Deploy das regras:
```bash
firebase deploy --only firestore:rules
```

---

## 🐛 Troubleshooting

### Erro: "Firebase not initialized"
**Solução**: Verifique se todas as variáveis `VITE_FIREBASE_*` estão corretas em `.env.local`

### Erro: "Permission denied" no Firestore
**Solução**: Verifique as regras em `firestore.rules` e se tem autenticação ativa

### Build falha na Vercel
**Solução**: 
1. Verifique se todas as variáveis de ambiente estão configuradas
2. Rode `npm run build` localmente para debug
3. Veja os logs na aba "Deployments" → "Build Logs"

### Variáveis de ambiente não aparecem no frontend
**Verificação**:
1. Certifique-se que tem prefixo `VITE_` (Vite específico)
2. Reinicie o dev server: `npm run dev`
3. Verifique no console do navegador: `console.log(import.meta.env)`

---

## 📦 Scripts úteis

```bash
# Desenvolvimento local
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Verificar tipagem TypeScript
npm run lint

# Deployt manual (se tiver Firebase CLI)
firebase deploy --only firestore:rules
```

---

## 🎯 Próximos passos

1. ✅ Configurar variáveis localmente (`.env.local`)
2. ✅ Conectar repositório na Vercel
3. ✅ Adicionar variáveis na dashboard da Vercel
4. ✅ Configurar regras do Firestore
5. ✅ Fazer primeiro deploy
6. ⏰ Monitorar logs e performance

---

**Dúvidas?** Consulte a documentação oficial:
- [Vercel Docs](https://vercel.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Vite Docs](https://vitejs.dev)
