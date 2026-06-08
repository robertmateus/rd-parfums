# 🐛 Troubleshooting & Debug

Guia para resolver problemas comuns durante desenvolvimento e deploy.

---

## 🔧 Problemas Locais

### ❌ Erro: "Cannot find module 'dotenv'"
```bash
# Solução: Instale dependências
npm install
```

### ❌ Firebase não inicializa
**Sintomas:** Console mostra "Firebase is not configured"

**Solução:**
```bash
# 1. Verifique se .env.local existe
ls -la .env.local

# 2. Verifique conteúdo (não comente nada)
cat .env.local

# 3. Certifique que todas as variáveis estão preenchidas
# (não deixe vazio, use valores reais do Firebase)

# 4. Reinicie o dev server
npm run dev
```

### ❌ Erro: "VITE_FIREBASE_API_KEY is undefined"
**Solução:**
```bash
# 1. Copie o template correto
cp .env.example .env.local

# 2. Abra e preencha cada variável
# (procure em Firebase Console → Settings → General)

# 3. Restart do dev server
npm run dev

# 4. Verifique no console do navegador
# (abra DevTools → Console)
console.log(import.meta.env.VITE_FIREBASE_API_KEY)
# deve mostrar algo como: AIzaSy...
```

### ❌ Build falha localmente
```bash
# Teste o build
npm run build

# Se falhar, veja o erro completo
npm run build 2>&1 | tail -50

# Verifique TypeScript
npm run lint

# Se tudo falhar, reinstale do zero
rm -rf node_modules package-lock.json
npm install
npm run build
```

### ❌ Porta 3000 já em uso
```bash
# Encontre o processo
lsof -i :3000  # Mac/Linux
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess  # Windows

# Mude a porta no vite.config.ts ou use:
npm run dev -- --port 3001
```

---

## 🌐 Problemas no Deploy (Vercel)

### ❌ Build falha na Vercel
**Passos para debugar:**

1. **Verifique logs**
   ```
   Vercel Dashboard → Deployments → [seu deploy] → Build Logs
   ```

2. **Procure por erros de variáveis**
   ```
   "Cannot find environment variable: VITE_FIREBASE_API_KEY"
   ```

3. **Solução**
   - Vá para Settings → Environment Variables
   - Verifique se todas as 7 variáveis estão lá
   - Elas precisam estar configuradas para: Production, Preview, Development

4. **Teste localmente**
   ```bash
   npm run build  # Deve gerar /dist
   npm run preview  # Preview do build
   ```

### ❌ Site funciona, mas sem dados do Firebase
**Sintomas:** Página carrega mas não mostra perfumes

**Debug:**
```javascript
// Abra DevTools → Console e execute:
console.log(import.meta.env)
// Deve mostrar todas as variáveis VITE_FIREBASE_*

// Se aparecer undefined, o Vercel não configurou certo
```

**Solução:**
1. Vercel Dashboard → Settings → Environment Variables
2. Verifique **escopo**: deve incluir "Production"
3. Se modificou, acione novo deploy: "Redeploy"

### ❌ "Access Denied" / "Permission Denied"
**Problema:** Firebase rejeita requisições

**Causas:**
1. Firestore Security Rules muito restritivas
2. Autenticação não configurada
3. CORS bloqueando requisições

**Solução:**
```firestore
// Adicione ao firestore.rules para teste
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // ⚠️ APENAS PARA TESTE!
    }
  }
}
```

Depois configure regras corretas (veja SECURITY.md)

---

## 🔍 Debug Avançado

### Ver variáveis de ambiente em produção
```javascript
// No navegador, execute:
console.log(import.meta.env)
```

### Verificar se Firebase conecta
```javascript
// No console do navegador:
import { db } from './src/data/firebase.ts'
if (db) {
  console.log("✅ Firebase Firestore conectado")
} else {
  console.log("❌ Firebase não inicializado")
}
```

### Monitorar requisições Firestore
```
Firebase Console → Firestore Database → Logs
```

### Ver source maps (apenas dev)
```
DevTools → Sources → veja arquivos .ts originais
```

---

## 📊 Checklist de Debug

```
Local Development
[ ] npm install rodou sem erros?
[ ] .env.local foi criado e preenchido?
[ ] npm run dev funciona?
[ ] Site abre em localhost:3000?
[ ] Firebase conecta (vê mensagens no console)?

Build
[ ] npm run build gera pasta /dist?
[ ] npm run lint passa sem erros?
[ ] npm run preview funciona?

Vercel Deploy
[ ] Projeto conectado no Vercel?
[ ] Todas as 7 variáveis estão em Environment Variables?
[ ] Variáveis têm escopo "Production"?
[ ] Primeiro deploy completou (sem falhas)?

Produção
[ ] Site abre em seu domínio?
[ ] Dados do Firebase aparecem?
[ ] Nenhuma erro no DevTools Console?
[ ] Performance está boa (DevTools → Lighthouse)?
```

---

## 🆘 Últimas opções

Se nada funcionar:

1. **Limpe tudo e recomeçe**
   ```bash
   rm -rf node_modules package-lock.json dist
   npm install
   npm run dev
   ```

2. **Verifique credenciais Firebase**
   - Firebase Console → Project Settings → Geral
   - Copie literalmente, sem espaços em branco

3. **Redeploye na Vercel**
   - Vercel Dashboard → Deployments → ... → Redeploy

4. **Resete Vercel Environment**
   - Settings → Environment Variables → Delete all
   - Adicione novamente, uma por uma

---

## 📞 Recursos

- **Firebase Docs**: https://firebase.google.com/docs/firestore/errors
- **Vercel Docs**: https://vercel.com/docs/troubleshoot
- **Vite Docs**: https://vitejs.dev/guide/troubleshooting.html

---

**Problema persistente?** Colete informações para debug:
- Saída de `npm run build`
- Screenshot do console do navegador
- Screenshot do Vercel Build Logs
- Content de `.env.local` (sem valores sensíveis)
