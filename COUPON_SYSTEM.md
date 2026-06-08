# 🎟️ Sistema de Cupons - Guia de Integração

Seu sistema de cupons foi implementado com sucesso! Aqui está como funciona:

---

## 📁 Arquivos Criados

### 1. **Tipos de Dados** (`src/types.ts`)
- `Coupon` - Interface para cupons
- `CouponUsage` - Rastreamento de uso
- `CartItemWithCoupon` - Item da sacola com cupom

###2. **Lógica de Cupons** (`src/data/perfumeService.ts`)
Novas funções:
- `getCoupons()` - Listar cupons
- `addCoupon()` - Criar cupom
- `editCoupon()` - Editar cupom
- `deleteCoupon()` - Deletar cupom
- `validateAndApplyCoupon()` - Validar e aplicar
- `recordCouponUsage()` - Registrar uso

### 3. **Componente de Gerenciamento** (`src/components/CouponManager.tsx`)
Interface completa para admin gerenciar cupons

### 4. **Sacola Atualizada** (`src/components/CartDrawer.tsx`)
- Campo para inserir código do cupom
- Validação em tempo real
- Exibição de desconto aplicado
- Mensagem WhatsApp com desconto

### 5. **Firestore Rules** (`firestore.rules`)
- Regras de segurança para coleções:
  - `coupons` (public read, admin write)
  - `coupon_usage` (admin read, guest write)

---

## 🔧 Como Integrar ao AdminPanel

Adicione o seguinte ao `src/components/AdminPanel.tsx`:

###1. **Importação**
```typescript
import CouponManager from "./CouponManager";
```

### 2. **Estado para navegação**
```typescript
const [adminSection, setAdminSection] = useState<"catalog" | "coupons">("catalog");
```

### 3. **Botões de navegação** (na seção pós-autenticação)
Adicione botões para alternar entre "Catálogo" e "Cupons"

### 4. **Renderização condicional**
```typescript
{adminSection === "catalog" ? (
  // Renderizar seção de catálogo existente
) : (
  <CouponManager />
)}
```

---

## 🚀 Funcionalidades Implementadas

### Admin Panel
✅ Criar cupom com:
- Código único
- Nome
- Tipo de desconto (fixo R$ ou %)
- Valor do desconto
- Número máximo de usos
- Limite por pessoa (1x por WhatsApp)
- Data de válidade (início e fim)
- Status ativo/inativo

✅ Editar e deletar cupons
✅ Ver progresso de uso (barra de progresso)
✅ Ver cupons expirados, em breve, inativos

### Cliente
✅ Inserir código do cupom na sacola
✅ Validação em tempo real
✅ Mostrar desconto aplicado
✅ Limite de 1 cupom por WhatsApp
✅ Desconto aparece na mensagem WhatsApp
✅ Registro automático de uso

---

## 📊 Estrutura de Dados (Firestore)

### Collection: `coupons`
```json
{
  "code": "SUMMER2024",
  "name": "Desconto de Verão",
  "discountType": "percentage",
  "discountValue": 15,
  "maxUses": 100,
  "currentUses": 45,
  "usesPerPerson": 1,
  "validFrom": "2024-06-01T00:00:00.000Z",
  "validUntil": "2024-08-31T23:59:59.000Z",
  "isActive": true,
  "description": "15% de desconto para clientes do verão"
}
```

### Collection: `coupon_usage`
```json
{
  "couponId": "SUMMER2024",
  "whatsappNumber": "11999999999",
  "usedAt": "2024-06-08T10:30:00.000Z",
  "discountApplied": 150.00,
  "orderTotal": 1000.00
}
```

---

## 🔐 Security Rules

✅ Apenas guests podem **ler** cupons ativos
✅ Apenas guests podem **registrar** uso
✅ Apenas admins podem **criar/editar/deletar** cupons
✅ Apenas admins podem **ler** histórico de uso

---

## 🧪 Como Testar

1. **Acesse o Admin Panel** (autenticado como admin)
2. **Clique em "Cupons"** (após integrar ao AdminPanel)
3. **Crie um cupom**:
   - Código: `TESTE2024`
   - Tipo: Desconto Fixo
   - Valor: R$ 50
   - Máximo de usos: 5
   - Válido até: Data futura
4. **Abra a Sacola** no site
5. **Insira o cupom**: `TESTE2024`
6. **Veja o desconto** sendo aplicado
7. **Envie via WhatsApp** para ver desconto na mensagem

---

## 📱 Exemplo de Mensagem WhatsApp com Cupom

```
✨ *RD PARFUMS - NOVA CONSULTA DE INTERESSE* ✨

👤 *Nome do Cliente:* João Silva
📞 *Contato:* +5511999999999

📋 *Fragrâncias de Interesse:* 
⚜️ *Oud Imperial*
   • Valor Unitário: R$ 890,00
   • Quantidade: 1 unidade(s)
   • Total deste Item: R$ 890,00

💰 *Subtotal:* R$ 890,00
🎟️ *Cupom Aplicado:* TESTE2024
💝 *Desconto:* -R$ 50,00

💰 *TOTAL COM DESCONTO:* R$ 840,00
```

---

## 🐛 Troubleshooting

**Cupom não valida?**
- Verifique se está dentro da data válida
- Verifique se não atingiu limite máximo de usos
- Verifique se cliente já não usou este cupom no seu WhatsApp

**Desconto não aparece na mensagem?**
- Cupom não foi aplicado corretamente
- Cliente não preencheu WhatsApp
- Tente novamente

**Erro ao criar cupom?**
- Preencha todos os campos obrigatórios
- Código deve ser único
- Valor deve ser > 0

---

##  ℹ️ Informações Adicionais

- **Storage**: LocalStorage + Firestore (sincronização automática)
- **Validação**: Backend rules (Firestore) + Frontend (UX)
- **Rastreamento**: Cada uso é registrado com WhatsApp do cliente
- **Admin Control**: Total controle sobre cupons (ativo/inativo, datas, limites)

---

**Próximo passo**: Integre o `CouponManager` ao `AdminPanel`!

Quer que eu faça a integração automaticamente?
