# ⚡ Cheat Sheet - Comandos Rápidos

Referência rápida de comandos mais usados.

---

## 🚀 Startup (Primeira Vez)

```bash
# Copie template
cp .env.example .env.local

# Preencha com credenciais
# (abra .env.local e cole valores do Firebase Console)

# Instale
npm install

# Rode
npm run dev

# Abra: http://localhost:3000
```

---

## 💻 Desenvolvimento

```bash
# Dev server (com hot reload)
npm run dev

# Verificar erros TypeScript
npm run lint

# Build para produção
npm run build

# Preview do build
npm run preview

# Limpar build
npm run clean
```

---

## 📦 Dependências

```bash
# Adicionar novo pacote
npm install nome-do-pacote

# Verificar vulnerabilidades
npm audit

# Consertar vulnerabilidades
npm audit fix

# Atualizar tudo
npm update
```

---

## 🌐 Git & Deploy

```bash
# Status
git status

# Adicionar mudanças
git add .

# Commit
git commit -m "feat: description"

# Push (aciona deploy automático na Vercel)
git push origin main

# Ver histórico
git log --oneline
```

---

## 🔐 Variáveis de Ambiente

```bash
# Ver variáveis no navegador (DevTools Console)
console.log(import.meta.env)

# Adicionar nova variável
# 1. Adicione em .env.local
# 2. Prefixo VITE_ (importante!)
# 3. Reinicie: npm run dev
# 4. Use: import.meta.env.VITE_MEU_VAR
```

---

## 🔥 Firebase

```bash
# Login no Firebase
firebase login

# Abrir console
firebase open

# Deploy só das regras
firebase deploy --only firestore:rules

# Ver logs
firebase functions:log
```

---

## 🚀 Vercel

```bash
# Instalar CLI
npm install -g vercel

# Link projeto
vercel link

# Deploy manual
vercel deploy

# Ver logs
vercel logs
```

---

## 🐛 Debug

```bash
# Erro no build?
npm run build 2>&1 | tail -50

# Porta em uso?
npm run dev -- --port 3001

# Limpar cache
rm -rf node_modules package-lock.json
npm install

# Ver package.json
cat package.json

# Ver configuração vite
cat vite.config.ts
```

---

## 📊 Verificações Pré-Deploy

```bash
# Checklist antes de fazer push
npm run lint      # ✓ Erros TypeScript?
npm run build     # ✓ Compila?
npm run preview   # ✓ Funciona visualmente?

# Se tudo passou
git add .
git commit -m "feat: descrição"
git push
# Vercel faz deploy automaticamente!
```

---

## 🆘 SOS

```bash
# Tudo quebrou, comece do zero
rm -rf node_modules dist .vercel
npm install
npm run build
npm run dev

# Se ainda não funciona
git reset --hard HEAD
npm install
npm run dev

# Se Firebase não conecta
# 1. Verifique .env.local tem valores
# 2. Reinicie npm run dev
# 3. Veja console do navegador
```

---

## 📁 Arquivos Importantes

```
.env.local                  ← Credenciais (não commitado!)
vite.config.ts              ← Build config
src/data/firebase.ts        ← Firebase setup
firestore.rules             ← Security rules
vercel.json                 ← Deploy config
package.json                ← Dependências
```

---

## 🎯 URLs Úteis

```
http://localhost:3000       ← Dev local
http://localhost:5173       ← Vite preview (alt port)

https://console.firebase.google.com     ← Firebase Console
https://vercel.com/dashboard            ← Vercel Dashboard
https://github.com/seu-user/seu-repo    ← Seu repositório
```

---

## ✅ Rotina Semanal

```bash
# Segunda-feira
npm audit fix              # Atualizar segurança
npm run lint              # Verificar erros
npm run build             # Build

# Antes de push
git status                # O que vai subir?
npm run build             # Compila?
npm run preview           # Funciona?
git add .
git commit -m "..."
git push                  # Deploy!
```

---

## 📊 Estrutura Rápida

```
src/
├── components/    ← Componentes React
├── data/          ← Firebase e dados
├── assets/        ← Imagens e estilos
├── App.tsx        ← Componente raiz
└── main.tsx       ← Entry point

.env.example       ← Template (commit)
.env.local         ← Valores (não commit!)
vite.config.ts     ← Build config
firestore.rules    ← DB security
vercel.json        ← Deploy config
```

---

## 🎓 Próximo Passo

Leia **[INDICE.md](./INDICE.md)** para documentação completa.
