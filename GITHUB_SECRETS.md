# 🔑 Secrets do GitHub Actions (Opcional - Para CI/CD Automático)

Se quiser fazer deploy automático via GitHub Actions, configure estes secrets no GitHub:

## Como adicionar Secrets no GitHub

1. Vá para seu repositório
2. **Settings** → **Secrets and variables** → **Actions**
3. Clique **New repository secret** e adicione:

### Secrets necessários

| Nome | Descrição |
|------|-----------|
| `VERCEL_TOKEN` | Token de autenticação da Vercel |
| `VERCEL_ORG_ID` | ID da organização Vercel |
| `VERCEL_PROJECT_ID` | ID do projeto na Vercel |

## Como conseguir cada secret

### 📌 VERCEL_TOKEN
1. Acesse https://vercel.com/account/tokens
2. Clique **Create** 
3. Copie o token completo
4. Cole como `VERCEL_TOKEN` no GitHub

### 📌 VERCEL_ORG_ID & VERCEL_PROJECT_ID
1. Execute localmente:
```bash
npm install -g vercel
vercel login
vercel link
```
2. Abra `.vercel/project.json` e copie:
   - `"orgId"` → `VERCEL_ORG_ID`
   - `"projectId"` → `VERCEL_PROJECT_ID`

3. Ou encontre em Vercel Dashboard:
   - **Settings** → **General** → copie IDs

---

## Como funciona

Quando você faz `git push` para `main`:

```
1. ✅ GitHub Actions roda testes e build
2. ✅ Verifica se não há .env files
3. ✅ Se tudo passar, faz deploy automático
4. ✅ Projeto fica disponível em production
```

---

## Status do Deploy

Veja em:
- **GitHub**: Actions tab (check mark ✅ ou ❌)
- **Vercel**: Dashboard → Deployments
- **Web**: Seu site ao vivo

---

**Nota**: Sem configurar CI/CD, você ainda pode fazer deploy manual ou via `git push` simples na Vercel.
