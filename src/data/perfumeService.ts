import { Perfume, Coupon, CouponUsage } from '../types';
import { db, auth, isConfigured } from './firebase';
import { PERFUMES_DATA } from './perfumes';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'rd_parfums_catalog';

// Helper to handle Firestore errors conforming to Firebase Integration guidelines
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Get raw state from localStorage
function getLocalPerfumes(): Perfume[] {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(PERFUMES_DATA));
    return PERFUMES_DATA;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return PERFUMES_DATA;
  }
}

function saveLocalPerfumes(perfumes: Perfume[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(perfumes));
}

export async function getPerfumes(): Promise<Perfume[]> {
  if (isConfigured && db) {
    try {
      const perfumesCol = collection(db, 'perfumes');
      const snapshot = await getDocs(perfumesCol);
      const list: Perfume[] = [];
      
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Perfume);
      });

      if (list.length === 0) {
        // Authenticated admin checks to allow seeding securely
        const adminEmail = auth?.currentUser?.email;
        const isAdminLogged = adminEmail && 
          ['contatorobertgomes@gmail.com', 'admin@rdparfums.com'].includes(adminEmail.toLowerCase());
          
        if (isAdminLogged) {
          console.log("Firestore empty and Admin detected. Seeding perfumes catalog on demand...");
          const batch = writeBatch(db);
          PERFUMES_DATA.forEach((perfume) => {
            const docRef = doc(db, 'perfumes', perfume.id);
            const { id, ...data } = perfume;
            batch.set(docRef, data);
          });
          await batch.commit();
          return PERFUMES_DATA;
        } else {
          console.log("Firestore empty. Standard guest fallback to local storage...");
          return getLocalPerfumes();
        }
      }
      return list;
    } catch (error) {
      console.warn("Firestore fetch failed, falling back to localStorage:", error);
      try {
        handleFirestoreError(error, OperationType.LIST, 'perfumes');
      } catch (logErr) {
        // Log formatted JSON representation of error
      }
      return getLocalPerfumes();
    }
  }
  return getLocalPerfumes();
}

export async function addPerfume(perfume: Omit<Perfume, 'id'> & { id?: string }): Promise<Perfume> {
  const finalId = perfume.id || perfume.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const newPerfume: Perfume = {
    ...perfume,
    id: finalId,
  };

  let dbFailed = false;
  let dbErrorMsg = '';

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'perfumes', finalId);
      const { id, ...data } = newPerfume;
      await setDoc(docRef, data);
    } catch (error: any) {
      console.warn("Firestore set performance blocked:", error);
      dbFailed = true;
      try {
        handleFirestoreError(error, OperationType.WRITE, `perfumes/${finalId}`);
      } catch (formattedError: any) {
        dbErrorMsg = formattedError.message;
      }
    }
  }

  // Always update local storage too to keep in sync
  const local = getLocalPerfumes();
  // Avoid duplicate ID
  const filtered = local.filter(p => p.id !== finalId);
  filtered.push(newPerfume);
  saveLocalPerfumes(filtered);

  if (dbFailed) {
    throw new Error(`SYNC_WARNING: O perfume foi adicionado localmente, mas não pôde ser sincronizado no banco de dados na nuvem (${dbErrorMsg}).`);
  }

  return newPerfume;
}

export async function editPerfume(id: string, perfumeUpdates: Partial<Omit<Perfume, 'id'>>): Promise<void> {
  let dbFailed = false;
  let dbErrorMsg = '';

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'perfumes', id);
      await updateDoc(docRef, perfumeUpdates);
    } catch (error: any) {
      console.warn("Firestore update performance blocked:", error);
      dbFailed = true;
      try {
        handleFirestoreError(error, OperationType.WRITE, `perfumes/${id}`);
      } catch (formattedError: any) {
        dbErrorMsg = formattedError.message;
      }
    }
  }

  const local = getLocalPerfumes();
  const index = local.findIndex(p => p.id === id);
  if (index !== -1) {
    local[index] = { ...local[index], ...perfumeUpdates };
    saveLocalPerfumes(local);
  }

  if (dbFailed) {
    throw new Error(`SYNC_WARNING: O perfume foi atualizado localmente, mas não pôde ser sincronizado no banco de dados na nuvem (${dbErrorMsg}).`);
  }
}

export async function removePerfume(id: string): Promise<void> {
  let dbFailed = false;
  let dbErrorMsg = '';

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'perfumes', id);
      await deleteDoc(docRef);
    } catch (error: any) {
      console.warn("Firestore delete performance blocked:", error);
      dbFailed = true;
      try {
        handleFirestoreError(error, OperationType.DELETE, `perfumes/${id}`);
      } catch (formattedError: any) {
        dbErrorMsg = formattedError.message;
      }
    }
  }

  const local = getLocalPerfumes();
  const filtered = local.filter(p => p.id !== id);
  saveLocalPerfumes(filtered);

  if (dbFailed) {
    throw new Error(`SYNC_WARNING: O perfume foi removido localmente, mas não pôde ser sincronizado no banco de dados na nuvem (${dbErrorMsg}).`);
  }
}

export async function resetCatalogToDefault(): Promise<void> {
  let dbFailed = false;
  let dbErrorMsg = '';

  if (isConfigured && db) {
    try {
      const perfumesCol = collection(db, 'perfumes');
      const snapshot = await getDocs(perfumesCol);
      const batch = writeBatch(db);
      snapshot.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      
      PERFUMES_DATA.forEach((perfume) => {
        const docRef = doc(db, 'perfumes', perfume.id);
        const { id, ...data } = perfume;
        batch.set(docRef, data);
      });
      
      await batch.commit();
    } catch (error: any) {
      console.warn("Firestore reset performance blocked:", error);
      dbFailed = true;
      try {
        handleFirestoreError(error, OperationType.WRITE, 'perfumes_reset');
      } catch (formattedError: any) {
        dbErrorMsg = formattedError.message;
      }
    }
  }

  saveLocalPerfumes(PERFUMES_DATA);

  if (dbFailed) {
    throw new Error(`SYNC_WARNING: O catálogo foi restaurado localmente, mas não pôde ser sincronizado completamente no banco de dados na nuvem (${dbErrorMsg}).`);
  }
}

// ============ COUPON SYSTEM ============

const COUPONS_STORAGE_KEY = 'rd_parfums_coupons';
const COUPON_USAGE_STORAGE_KEY = 'rd_parfums_coupon_usage';

function getLocalCoupons(): Coupon[] {
  try {
    const stored = localStorage.getItem(COUPONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalCoupons(coupons: Coupon[]) {
  localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(coupons));
}

function getLocalCouponUsage(): CouponUsage[] {
  try {
    const stored = localStorage.getItem(COUPON_USAGE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalCouponUsage(usage: CouponUsage[]) {
  localStorage.setItem(COUPON_USAGE_STORAGE_KEY, JSON.stringify(usage));
}

export async function getCoupons(): Promise<Coupon[]> {
  if (isConfigured && db) {
    try {
      const couponsCol = collection(db, 'coupons');
      const snapshot = await getDocs(couponsCol);
      const coupons: Coupon[] = [];
      
      snapshot.forEach((docSnap) => {
        coupons.push({ id: docSnap.id, ...docSnap.data() } as Coupon);
      });
      
      return coupons;
    } catch (error) {
      console.warn("Firestore fetch coupons failed, falling back to localStorage:", error);
      return getLocalCoupons();
    }
  }
  return getLocalCoupons();
}

export async function addCoupon(coupon: Omit<Coupon, 'id'>): Promise<Coupon> {
  const id = coupon.code.toUpperCase();
  const newCoupon: Coupon = {
    ...coupon,
    id,
    code: coupon.code.toUpperCase(),
    currentUses: 0,
  };

  let dbFailed = false;

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'coupons', id);
      await setDoc(docRef, newCoupon);
    } catch (error: any) {
      console.warn("Firestore add coupon failed:", error);
      dbFailed = true;
    }
  }

  const local = getLocalCoupons();
  local.push(newCoupon);
  saveLocalCoupons(local);

  if (dbFailed) {
    console.warn("Cupom adicionado localmente, mas não sincronizado com Firestore");
  }

  return newCoupon;
}

export async function editCoupon(id: string, updates: Partial<Omit<Coupon, 'id'>>): Promise<void> {
  let dbFailed = false;

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'coupons', id);
      await updateDoc(docRef, updates);
    } catch (error: any) {
      console.warn("Firestore update coupon failed:", error);
      dbFailed = true;
    }
  }

  const local = getLocalCoupons();
  const index = local.findIndex(c => c.id === id);
  if (index !== -1) {
    local[index] = { ...local[index], ...updates };
    saveLocalCoupons(local);
  }

  if (dbFailed) {
    console.warn("Cupom atualizado localmente, mas não sincronizado com Firestore");
  }
}

export async function deleteCoupon(id: string): Promise<void> {
  let dbFailed = false;

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'coupons', id);
      await deleteDoc(docRef);
    } catch (error: any) {
      console.warn("Firestore delete coupon failed:", error);
      dbFailed = true;
    }
  }

  const local = getLocalCoupons();
  const filtered = local.filter(c => c.id !== id);
  saveLocalCoupons(filtered);

  if (dbFailed) {
    console.warn("Cupom deletado localmente, mas não sincronizado com Firestore");
  }
}

export interface CouponValidationResult {
  isValid: boolean;
  error?: string;
  coupon?: Coupon;
  discount?: number;
}

export async function validateAndApplyCoupon(
  code: string,
  whatsappNumber: string,
  cartTotal: number
): Promise<CouponValidationResult> {
  const coupons = await getCoupons();
  const coupon = coupons.find(c => c.code === code.toUpperCase());

  if (!coupon) {
    return {
      isValid: false,
      error: "Cupom não encontrado",
    };
  }

  // Verificar se está ativo
  if (!coupon.isActive) {
    return {
      isValid: false,
      error: "Este cupom não está ativo",
    };
  }

  // Verificar data de validade
  const now = new Date();
  const validFrom = new Date(coupon.validFrom);
  const validUntil = new Date(coupon.validUntil);

  if (now < validFrom) {
    return {
      isValid: false,
      error: `Cupom válido a partir de ${validFrom.toLocaleDateString("pt-BR")}`,
    };
  }

  if (now > validUntil) {
    return {
      isValid: false,
      error: `Cupom expirou em ${validUntil.toLocaleDateString("pt-BR")}`,
    };
  }

  // Verificar se atingiu o limite total
  if (coupon.currentUses >= coupon.maxUses) {
    return {
      isValid: false,
      error: "Este cupom atingiu o número máximo de usos",
    };
  }

  // Verificar se o usuário já usou (baseado em WhatsApp)
  const usage = getLocalCouponUsage();
  const userUsageCount = usage.filter(
    u => u.couponId === coupon.id && u.whatsappNumber === whatsappNumber
  ).length;

  if (userUsageCount >= coupon.usesPerPerson) {
    return {
      isValid: false,
      error: `Você já usou este cupom ${coupon.usesPerPerson}x (limite máximo)`,
    };
  }

  // Calcular desconto
  let discount = 0;
  if (coupon.discountType === 'fixed') {
    discount = Math.min(coupon.discountValue, cartTotal);
  } else {
    discount = (cartTotal * coupon.discountValue) / 100;
  }

  return {
    isValid: true,
    coupon,
    discount,
  };
}

export async function recordCouponUsage(
  couponId: string,
  whatsappNumber: string,
  discountApplied: number,
  orderTotal: number
): Promise<void> {
  const usage: CouponUsage = {
    id: `${couponId}-${whatsappNumber}-${Date.now()}`,
    couponId,
    whatsappNumber,
    usedAt: new Date().toISOString(),
    discountApplied,
    orderTotal,
  };

  let dbFailed = false;

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'coupon_usage', usage.id);
      await setDoc(docRef, usage);
    } catch (error: any) {
      console.warn("Firestore record coupon usage failed:", error);
      dbFailed = true;
    }
  }

  const local = getLocalCouponUsage();
  local.push(usage);
  saveLocalCouponUsage(local);

  // Atualizar currentUses do cupom
  const coupons = await getCoupons();
  const coupon = coupons.find(c => c.id === couponId);
  if (coupon) {
    await editCoupon(couponId, {
      currentUses: coupon.currentUses + 1,
    });
  }

  if (dbFailed) {
    console.warn("Uso do cupom registrado localmente, mas não sincronizado com Firestore");
  }
}
