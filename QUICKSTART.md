# 📋 Quick Start - Configuração Rápida

## Para Desenvolvedores Locais (1º acesso)

### 1️⃣ Clone o repositório
```bash
git clone <seu-repo>
cd rd-parfums
```

### 2️⃣ Configure variáveis de ambiente
```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Abra e preencha as credenciais Firebase
# (veja SETUP_VERCEL.md para instruções detalhadas)
code .env.local
```

### 3️⃣ Instale dependências
```bash
npm install
```

### 4️⃣ Rode o dev server
```bash
npm run dev
```

Acesse em: `http://localhost:3000`

---

## Para Fazer Deploy (Primeiras Vezes na Vercel)

### ✅ Pré-requisitos
- [ ] Conta na [Vercel](https://vercel.com)
- [ ] Repositório Git conectado (GitHub/GitLab)
- [ ] Credenciais Firebase prontas

### 🚀 Passos para Deploy

1. **Conecte seu repositório na Vercel**
   - Acesse https://vercel.com/new
   - Selecione seu repositório
   - Vercel detectará automaticamente Vite + React

2. **Configure Environment Variables**
   - Vá para **Settings** → **Environment Variables**
   - Cole as variáveis do seu `.env.local`:
     ```
     VITE_FIREBASE_API_KEY
     VITE_FIREBASE_AUTH_DOMAIN
     VITE_FIREBASE_PROJECT_ID
     VITE_FIREBASE_STORAGE_BUCKET
     VITE_FIREBASE_MESSAGING_SENDER_ID
     VITE_FIREBASE_APP_ID
     VITE_FIREBASE_MEASUREMENT_ID
     ```

3. **Deploy automático**
   - Pronto! Todo `git push` faz deploy automaticamente

---

## 🔐 Checklist de Segurança

Antes de fazer commit ou push:

```bash
# ✅ Nunca commit .env.local
[ ] .env.local está no .gitignore?

# ✅ Verifique TypeScript
npm run lint

# ✅ Teste o build
npm run build

# ✅ Veja se o site funciona
npm run preview

# ✅ Finalmente, faça commit
git add .
git commit -m "feat: description"
git push
```

---

## 📚 Documentação Completa

- **[SETUP_VERCEL.md](./SETUP_VERCEL.md)** - Guia completo de configuração
- **[SECURITY.md](./SECURITY.md)** - Guia de segurança e boas práticas
- **[.env.example](./.env.example)** - Template de variáveis

---

## 🆘 Problemas Comuns?

**Firebase não conecta?**
```
→ Verifique se todas as variáveis VITE_FIREBASE_* estão em .env.local
→ Rode: npm run dev (aparecerá mensagem de erro)
```

**Build falha na Vercel?**
```
→ Veja logs em Vercel Dashboard → Deployments → Build Logs
→ Teste localmente: npm run build
```

**Erro: "Cannot find .env.local"**
```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Preencha com suas credenciais
```

---

## 💡 Dicas Úteis

```bash
# Veja as variáveis de ambiente disponíveis
npm run dev  # Veja console durante startup

# Limpe cache e reinstale
rm -rf node_modules package-lock.json
npm install

# Formate código antes de commit
npm run lint  # Verifica erros TypeScript
```

---

**Pronto para começar?** Siga os passos acima e boa sorte! 🚀
