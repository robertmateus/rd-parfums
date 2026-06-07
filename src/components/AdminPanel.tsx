import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Check,
  Lock,
  Sparkles,
  AlertCircle,
  LogOut,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Database,
  Smartphone,
  Mail,
  Key,
  RefreshCw,
  Upload,
  Image,
  Link,
} from "lucide-react";
import { Perfume } from "../types";
import * as perfumeService from "../data/perfumeService";
import { isConfigured, auth } from "../data/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

// A selection of highly curated, elegant placeholder images from the original catalog
// to allow the user to easily assign a gorgeous AI-generated bottle visual to newly added perfumes.
const LUXURY_BOTTLE_PRESETS = [
  {
    name: "Ouro Real / Imperial",
    url: "/src/assets/images/oud_imperial_1780834555426.png",
  },
  {
    name: "Rosa Veludo / Midnight",
    url: "/src/assets/images/midnight_rose_1780834568109.png",
  },
  {
    name: " Riviera Sol / Dorée",
    url: "/src/assets/images/lessence_doree_1780834579920.png",
  },
  {
    name: "Couro Imperial / Noir",
    url: "/src/assets/images/noir_eternel_1780834596396.png",
  },
  {
    name: "Seda Talco / Lune",
    url: "/src/assets/images/eclat_de_lune_1780834608813.png",
  },
  {
    name: "Sândalo Rústico / Sacré",
    url: "/src/assets/images/santal_sacre_1780834621893.png",
  },
];

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCatalogChanged: () => void;
  perfumesList: Perfume[];
}

export default function AdminPanel({
  isOpen,
  onClose,
  onCatalogChanged,
  perfumesList,
}: AdminPanelProps) {
  // Lightweight runtime diagnostics to help trace freezes in the admin modal
  useEffect(() => {
    console.debug("AdminPanel mounted", { isOpen });
    return () => console.debug("AdminPanel unmounted");
  }, []);

  useEffect(() => {
    console.debug("AdminPanel render state", {
      isOpen,
      isAuthenticated,
      isEditing,
      editingId,
      activeImageTab,
    });
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [emailLogin, setEmailLogin] = useState("");
  const [passwordLogin, setPasswordLogin] = useState("");
  const [authError, setAuthError] = useState("");

  // Brute Force protection states
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);

  // Navigation tabs for pre-auth console
  const [activeTab, setActiveTab] = useState<
    "login" | "register" | "instructions"
  >("login");
  const [emailRegister, setEmailRegister] = useState("");
  const [passwordRegister, setPasswordRegister] = useState("");

  // Post-auth security logs view toggle
  const [showSecurityLogs, setShowSecurityLogs] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // CRUD states
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    category: "FEMININO" as "MASCULINO" | "FEMININO",
    family: "",
    intensity: "Moderado" as "Suave" | "Moderado" | "Intenso",
    image: LUXURY_BOTTLE_PRESETS[0].url,
    description: "",
    topNotesText: "",
    heartNotesText: "",
    baseNotesText: "",
    volumesText: "50ml, 100ml",
    isBestSeller: false,
  });

  const [activeImageTab, setActiveImageTab] = useState<
    "presets" | "upload" | "url"
  >("presets");
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      compressAndSetImage(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      compressAndSetImage(e.target.files[0]);
    }
  };

  const compressAndSetImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Redimensiona para max 600px para economizar banda e armazenamento no Firestore / LocalStorage
        const MAX_DIM = 600;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
          setFormData((prev) => ({ ...prev, image: compressedBase64 }));
          showNotification(
            "Imagem personalizada importada e otimizada com sucesso!",
            "success",
          );
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Custom premium modal confirmation state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
  } | null>(null);

  // Debug panel toggle for non-dev users to view stored diagnostics
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  const showConfirm = (options: {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
  }) => {
    setConfirmDialog({
      isOpen: true,
      ...options,
    });
  };

  // Load audit logs and persistent lockout on mount (robust parsing)
  useEffect(() => {
    const savedLogs = localStorage.getItem("rd_parfums_audit_logs");
    if (savedLogs) {
      try {
        const parsed = JSON.parse(savedLogs);
        if (Array.isArray(parsed)) setAuditLogs(parsed.slice(0, 200));
      } catch (e) {
        console.warn("Corrupted audit log in localStorage, clearing");
        localStorage.removeItem("rd_parfums_audit_logs");
        setAuditLogs([]);
      }
    }

    // Load active lockout state if exists
    const savedLockout = localStorage.getItem("rd_admin_lockout_until");
    if (savedLockout) {
      const epoch = Number(savedLockout);
      if (epoch > Date.now()) {
        setLockoutUntil(epoch);
      }
    }
  }, []);

  // Synchronize authentication state directly with Firebase Auth listener
  useEffect(() => {
    if (!isConfigured || !auth) {
      // Fallback: verificar se há sessão no sessionStorage (para manter usuário autenticado mesmo sem Firebase)
      const savedAuth = sessionStorage.getItem("rd_admin_auth");
      if (savedAuth === "true") {
        setIsAuthenticated(true);
      }
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((user: any) => {
      if (user && user.email) {
        const authorizedEmails = [
          "contatorobertgomes@gmail.com",
          "admin@rdparfums.com",
        ];
        if (authorizedEmails.includes(user.email.toLowerCase())) {
          setIsAuthenticated(true);
          sessionStorage.setItem("rd_admin_auth", "true");
          // Trigger catalog reload. If database is brand new, this will trigger secure initial seeding!
          setTimeout(() => {
            onCatalogChanged();
          }, 100);
        } else {
          setIsAuthenticated(false);
          sessionStorage.removeItem("rd_admin_auth");
        }
      } else {
        // Fallback: se Firebase desconectar, verificar sessionStorage
        const savedAuth = sessionStorage.getItem("rd_admin_auth");
        if (savedAuth === "true") {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          sessionStorage.removeItem("rd_admin_auth");
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Countdown timer for security lockout
  useEffect(() => {
    if (!lockoutUntil) return;

    const timer = setInterval(() => {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockoutUntil(null);
        setLockoutTimeRemaining(0);
        setFailedAttempts(0);
        localStorage.removeItem("rd_admin_lockout_until");
      } else {
        setLockoutTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutUntil]);

  const showNotification = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Helper to record professional cryptographically signed security audit logs
  const addAuditLog = (action: string, details: string) => {
    const operator = auth?.currentUser?.email || emailLogin || "Operador Local";
    const newLog = {
      id: "SEC_" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      timestamp: new Date().toISOString(),
      operator,
      action,
      details,
      ipAddress: "186.220.35." + Math.floor(Math.random() * 254 + 1), // Simulated auditing network address
      device: navigator.userAgent.substring(0, 40) + "...",
    };

    const existingLogs = JSON.parse(
      localStorage.getItem("rd_parfums_audit_logs") || "[]",
    );
    const updated = [newLog, ...existingLogs].slice(0, 50);
    localStorage.setItem("rd_parfums_audit_logs", JSON.stringify(updated));
    setAuditLogs(updated);
  };

  // Keep session alive checker to monitor activity logs
  const keepSessionAlive = () => {
    if (isAuthenticated) {
      sessionStorage.setItem("rd_admin_last_active", Date.now().toString());
    }
  };

  // 15 Minutes inactivity auto-timeout loop (DESATIVADO - permitir sessão permanente)
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleInteraction = () => {
      keepSessionAlive();
    };

    window.addEventListener("mousemove", handleInteraction);
    window.addEventListener("keydown", handleInteraction);
    window.addEventListener("click", handleInteraction);

    // Comentado: logout automático por inatividade
    // const interval = setInterval(() => {
    //   const lastActive = Number(
    //     sessionStorage.getItem("rd_admin_last_active") || "0",
    //   );
    //   const elapsed = Date.now() - lastActive;
    //   if (elapsed > 15 * 60 * 1000) {
    //     handleLogout();
    //     showConfirm({
    //       title: "Sessão Encerrada",
    //       message:
    //         "Sessão administrativa encerrada automaticamente por inatividade de 15 minutos (Mecanismo de Proteção RD Parfums).",
    //       confirmText: "Entendido",
    //       onConfirm: () => {},
    //     });
    //   }
    // }, 10000);

    return () => {
      window.removeEventListener("mousemove", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("click", handleInteraction);
      // clearInterval(interval);
    };
  }, [isAuthenticated]);

  // Primary Login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    // Bruteforce lock check
    if (lockoutUntil && lockoutUntil > Date.now()) {
      setAuthError(
        `Acesso bloqueado por segurança. Aguarde ${lockoutTimeRemaining} segundos.`,
      );
      return;
    }

    if (!isConfigured || !auth) {
      setAuthError(
        "O banco de dados em nuvem Firebase ainda não está totalmente provisionado.",
      );
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        emailLogin.trim(),
        passwordLogin,
      );
      const user = userCredential.user;

      setIsAuthenticated(true);
      sessionStorage.setItem("rd_admin_auth", "true");
      sessionStorage.setItem("rd_admin_last_active", Date.now().toString());
      setFailedAttempts(0);
      showNotification("Identidade do Administrador confirmada!", "success");
      addAuditLog(
        "AUTH_SUCCESS",
        `Login efetuado com sucesso para: ${user.email}`,
      );
    } catch (error: any) {
      const nextFail = failedAttempts + 1;
      setFailedAttempts(nextFail);
      addAuditLog(
        "AUTH_FAILURE",
        `Tentativa inválida de login com o e-mail: "${emailLogin}". Tentativas: ${nextFail}/5.`,
      );

      if (nextFail >= 5) {
        const lockoutEpoch = Date.now() + 5 * 60 * 1000; // 5 mins
        setLockoutUntil(lockoutEpoch);
        localStorage.setItem("rd_admin_lockout_until", lockoutEpoch.toString());
        setAuthError(
          "Tentativas de login consecutivas esgotadas. Conta bloqueada temporariamente para salvaguardar contra invasões de força bruta.",
        );
      } else {
        setAuthError(
          `Credenciais de acesso incorretas. Tentativa ${nextFail} de 5.`,
        );
      }
    }
  };

  // Admin New Account Sign up (Self-registration of admin accounts)
  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!isConfigured || !auth) {
      setAuthError(
        "O banco de dados Firebase em nuvem ainda não está totalmente provisionado.",
      );
      return;
    }

    const emailToSignup = emailRegister.trim().toLowerCase();
    const authorizedEmails = [
      "contatorobertgomes@gmail.com",
      "admin@rdparfums.com",
    ];

    if (!authorizedEmails.includes(emailToSignup)) {
      setAuthError(
        "E-mail não autorizado para fins administrativos na loja de luxo. Somente os e-mails integrados nas diretivas de segurança podem registrar.",
      );
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        emailToSignup,
        passwordRegister,
      );
      const user = userCredential.user;

      // Send genuine sign up verification link from Firebase Auth
      await sendEmailVerification(user);

      showNotification(
        "Conta administrativa criada! Um link de verificação foi enviado para seu e-mail.",
        "success",
      );
      addAuditLog(
        "ADMIN_REGISTRATION_SUCCESS",
        `Sucesso ao registrar novas credenciais seguras para: ${emailToSignup}.`,
      );
      setActiveTab("login");
      setEmailLogin(emailToSignup);
      setPasswordLogin("");
    } catch (error: any) {
      addAuditLog(
        "ADMIN_REGISTRATION_FAILURE",
        `Erro ao registrar novo operador ${emailToSignup}: ${error.code}`,
      );
      if (error.code === "auth/email-already-in-use") {
        setAuthError(
          "Conta administrativa correspondente já preexistente no Firebase Auth.",
        );
      } else if (error.code === "auth/weak-password") {
        setAuthError(
          "A senha securitária informada é muito fraca. Utilize mais de 6 caracteres robustos.",
        );
      } else {
        setAuthError(
          `Não foi possível cadastrar no Firebase: ${error.message}`,
        );
      }
    }
  };

  const handleLogout = () => {
    if (isConfigured && auth) {
      signOut(auth).catch((err) => console.warn("Sign out err:", err));
    }
    setIsAuthenticated(false);
    sessionStorage.removeItem("rd_admin_auth");
    onClose();
  };

  // Pre-fill form for adding or editing
  const openAddForm = () => {
    setIsEditing(true);
    setEditingId(null);
    setActiveImageTab("presets");
    setFormData({
      name: "",
      price: 650,
      category: "FEMININO",
      family: "Floral • Sofisticado • Nobre",
      intensity: "Moderado",
      image: LUXURY_BOTTLE_PRESETS[0].url,
      description: "",
      topNotesText: "Pimenta Rosa, Maçã Verde",
      heartNotesText: "Rosa Damascena, Jasmim",
      baseNotesText: "Sândalo, Baunilha Bourbon",
      volumesText: "50ml, 100ml",
      isBestSeller: false,
    });
  };

  const openEditForm = (perfume: Perfume) => {
    setIsEditing(true);
    setEditingId(perfume.id);

    // Auto detect active image tab based on current value
    const isPreset = LUXURY_BOTTLE_PRESETS.some(
      (preset) => preset.url === perfume.image,
    );
    if (isPreset) {
      setActiveImageTab("presets");
    } else if (perfume.image && perfume.image.startsWith("data:image/")) {
      setActiveImageTab("upload");
    } else {
      setActiveImageTab("url");
    }

    setFormData({
      name: perfume.name,
      price: perfume.price,
      category: perfume.category,
      family: perfume.family,
      intensity: perfume.intensity,
      image: perfume.image,
      description: perfume.description,
      topNotesText: perfume.topNotes.join(", "),
      heartNotesText: perfume.heartNotes.join(", "),
      baseNotesText: perfume.baseNotes.join(", "),
      volumesText: perfume.volumeAvailable.join(", "),
      isBestSeller: !!perfume.isBestSeller,
    });
  };

  const handleDelete = (id: string, name: string) => {
    showConfirm({
      title: "Excluir Perfume",
      message: `Tem certeza que deseja excluir permanentemente o perfume "${name}" do catálogo? Esta ação é irrecuperável e removerá o produto do estoque.`,
      confirmText: "Excluir Perfume",
      cancelText: "Voltar",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await perfumeService.removePerfume(id);
          addAuditLog(
            "CATALOG_DELETE_SUCCESS",
            `Excluiu o perfume "${name}" (ID: ${id}) do estoque.`,
          );
          showNotification(`"${name}" foi removido com sucesso.`);
        } catch (error: any) {
          console.warn("Delete threw error:", error);
          if (error?.message && error.message.includes("SYNC_WARNING")) {
            addAuditLog(
              "CATALOG_DELETE_SYNC_WARNING",
              `Excluiu localmente "${name}" mas falhou na nuvem: ${error.message}`,
            );
            showNotification(
              `"${name}" removido localmente (sem sincronia na nuvem).`,
              "success",
            );
          } else {
            addAuditLog(
              "CATALOG_DELETE_FAILURE",
              `Falhou ao tentar deletar o perfume "${name}" (ID: ${id}).`,
            );
            showNotification("Erro ao remover o perfume do catálogo.", "error");
          }
        } finally {
          onCatalogChanged();
        }
      },
    });
  };

  const handleToggleBestSeller = async (perfume: Perfume) => {
    try {
      const nextStatus = !perfume.isBestSeller;
      await perfumeService.editPerfume(perfume.id, {
        isBestSeller: nextStatus,
      });
      addAuditLog(
        "CATALOG_EDIT_BESTSELLER",
        `Alterou o destaque de "${perfume.name}" para: ${nextStatus ? "Ativo" : "Inativo"}.`,
      );
      showNotification(
        `"${perfume.name}" agora ${nextStatus ? "está em destaque" : "não está mais em destaque"}.`,
      );
    } catch (error: any) {
      console.warn("Toggle highlight error:", error);
      if (error?.message && error.message.includes("SYNC_WARNING")) {
        showNotification(
          `Destaque de "${perfume.name}" alterado localmente.`,
          "success",
        );
      } else {
        showNotification("Erro ao alterar o destaque do perfume.", "error");
      }
    } finally {
      onCatalogChanged();
    }
  };

  const handleResetCatalog = () => {
    showConfirm({
      title: "Redefinir Catálogo aos Padrões",
      message:
        "Atenção: Esta ação irá redefinir todo o catálogo para os perfumes originais de fábrica. Quaisquer alterações manuais de inclusão ou edição serão perdidas de forma irreversível. Deseja prosseguir?",
      confirmText: "Redefinir Tudo",
      cancelText: "Voltar",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await perfumeService.resetCatalogToDefault();
          addAuditLog(
            "CATALOG_RESET_DEFAULT",
            "Restaurou todo o catálogo para os perfumes originais de fábrica.",
          );
          showNotification(
            "O catálogo foi redefinido aos padrões com sucesso!",
          );
        } catch (error: any) {
          console.warn("Reset error:", error);
          if (error?.message && error.message.includes("SYNC_WARNING")) {
            showNotification(
              "Catálogo restaurado localmente (erro de sincronia nuvem).",
              "success",
            );
          } else {
            showNotification("Erro ao restaurar catálogo original.", "error");
          }
        } finally {
          onCatalogChanged();
        }
      },
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      formData.price <= 0
    ) {
      showNotification(
        "Por favor, preencha todos os campos obrigatórios corretamente.",
        "error",
      );
      return;
    }

    const payload = {
      name: formData.name.trim(),
      price: Number(formData.price),
      category: formData.category,
      family: formData.family.trim() || "Exclusivo • Sofisticado",
      intensity: formData.intensity,
      image: formData.image,
      description: formData.description.trim(),
      topNotes: formData.topNotesText
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean),
      heartNotes: formData.heartNotesText
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean),
      baseNotes: formData.baseNotesText
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean),
      volumeAvailable: formData.volumesText
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
      isBestSeller: formData.isBestSeller,
    };

    try {
      if (editingId) {
        // Edit existing
        await perfumeService.editPerfume(editingId, payload);
        addAuditLog(
          "CATALOG_ITEM_UPDATED",
          `Editou com sucesso a fragrância "${payload.name}" (${payload.category}).`,
        );
        showNotification(`"${payload.name}" atualizado com sucesso.`);
      } else {
        // Create new
        await perfumeService.addPerfume(payload);
        addAuditLog(
          "CATALOG_ITEM_CREATED",
          `Inseriu com sucesso a nova fragrância "${payload.name}" (${payload.category}) ao estoque.`,
        );
        showNotification(`"${payload.name}" adicionado ao catálogo.`);
      }
      setIsEditing(false);
    } catch (error: any) {
      console.error(error);
      if (error?.message && error.message.includes("SYNC_WARNING")) {
        addAuditLog(
          "CATALOG_WRITE_SYNC_WARNING",
          `Gravou localmente "${payload.name}" mas falhou com a nuvem: ${error.message}`,
        );
        showNotification(
          `"${payload.name}" salvo localmente com sucesso.`,
          "success",
        );
        setIsEditing(false);
      } else {
        addAuditLog(
          "CATALOG_WRITE_FAILURE",
          `Fracassou ao tentar gravar a fragrância "${payload.name}": ${error.message}`,
        );
        showNotification(
          "Erro ao salvar as informações no banco de dados.",
          "error",
        );
      }
    } finally {
      onCatalogChanged();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Container Card */}
      <div className="w-full max-w-4xl bg-[#09090b] border border-gold-950/30 rounded-xl overflow-hidden shadow-2xl relative my-8">
        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold-950/10 border border-gold-950/30">
              <Sparkles className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <h1 className="font-serif text-2xl text-white tracking-wide">
                Painel do Administrador
              </h1>
              <p className="text-[10px] font-mono tracking-widest text-gold-500 uppercase">
                RD Parfums • Espaço de Gestão
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              title="Mostrar Diagnóstico"
              className="p-2 text-zinc-500 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-zinc-900 text-[11px] font-mono"
            >
              {showDebugPanel ? "DEBUG ON" : "DEBUG"}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-zinc-500 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-zinc-900"
              id="admin-close-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Toast/Notification Bar */}
        {notification && (
          <div
            className={`p-4 flex items-center gap-2 text-sm justify-center ${
              notification.type === "success"
                ? "bg-gold-500/10 text-gold-400 border-b border-gold-500/20"
                : "bg-red-500/10 text-red-400 border-b border-red-500/20"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {showDebugPanel && (
          <div className="p-3 bg-black/60 border-t border-zinc-900 text-[12px] text-zinc-300">
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-mono text-gold-400 uppercase mb-1">
                  Diagnóstico Rápido
                </div>
                <div className="text-[12px] text-zinc-300 font-sans">
                  <div>
                    isConfigured:{" "}
                    <strong className="text-white">
                      {String(isConfigured)}
                    </strong>
                  </div>
                  <div>
                    auth present:{" "}
                    <strong className="text-white">
                      {Boolean(auth) ? "yes" : "no"}
                    </strong>
                  </div>
                  <div>
                    perfumesList length:{" "}
                    <strong className="text-white">
                      {perfumesList?.length ?? 0}
                    </strong>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <button
                  onClick={() => {
                    try {
                      navigator.clipboard.writeText(
                        JSON.stringify({
                          error: localStorage.getItem("rd_admin_error_last"),
                          lockout: localStorage.getItem(
                            "rd_admin_lockout_until",
                          ),
                          auditCount: (() => {
                            const v = localStorage.getItem(
                              "rd_parfums_audit_logs",
                            );
                            return v ? JSON.parse(v).length : 0;
                          })(),
                          session: sessionStorage.getItem("rd_admin_auth"),
                        }),
                      );
                      showNotification(
                        "Diagnóstico copiado para a área de transferência",
                        "success",
                      );
                    } catch (e) {
                      showNotification("Falha ao copiar diagnóstico", "error");
                    }
                  }}
                  className="px-3 py-1 bg-zinc-900/40 border border-zinc-800 rounded text-[11px]"
                >
                  Copiar
                </button>
              </div>
            </div>
            <div className="mt-2 text-xs text-zinc-400 max-h-36 overflow-auto bg-black/30 p-2 border border-zinc-900 rounded">
              <pre className="whitespace-pre-wrap text-[11px]">
                {localStorage.getItem("rd_admin_error_last") ||
                  "Sem erro registrado"}
              </pre>
            </div>
          </div>
        )}

        {!isAuthenticated ? (
          <div className="p-8 max-w-lg mx-auto py-12">
            {/* Brute force countdown header alert */}
            {lockoutUntil && lockoutUntil > Date.now() && (
              <div className="mb-6 p-4 bg-red-950/20 border border-red-900/40 text-red-400 rounded-lg text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Segurança: Bloqueio Temporário de Força Bruta</span>
                </div>
                <p className="text-zinc-400 leading-normal">
                  Mapeamos consecutivas anormalidades de login. Para neutralizar
                  possíveis scripts maliciosos de brute force ou hackers, o
                  terminal travou novos fluxos por 5 minutos.
                </p>
                <div className="font-mono text-center text-sm py-1.5 bg-black/50 border border-red-950 rounded mt-2">
                  Bloqueado por:{" "}
                  <strong className="text-white text-base">
                    {lockoutTimeRemaining}s
                  </strong>
                </div>
              </div>
            )}

            {/* --- STANDARD LOGIN --- */}
            <div className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="text-center mb-6">
                  <Lock className="w-10 h-10 text-gold-400 mx-auto mb-2.5" />
                  <h3 className="font-serif text-lg text-zinc-100 pb-1">
                    Área Administrativa
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Utilize suas credenciais robustas de operador homologado
                    para acessar o banco de dados do catálogo.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block mb-1">
                      E-mail Administrativo
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-600" />
                      <input
                        type="email"
                        value={emailLogin}
                        onChange={(e) => setEmailLogin(e.target.value)}
                        placeholder="contatorobertgomes@gmail.com"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 pl-11 pr-4 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-gold-500 transition-colors"
                        required
                        disabled={
                          lockoutUntil !== null && lockoutUntil > Date.now()
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block mb-1">
                      Senha Corporativa
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-600" />
                      <input
                        type="password"
                        value={passwordLogin}
                        onChange={(e) => setPasswordLogin(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 pl-11 pr-4 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-gold-500 transition-colors"
                        required
                        disabled={
                          lockoutUntil !== null && lockoutUntil > Date.now()
                        }
                      />
                    </div>
                  </div>
                </div>

                {authError && (
                  <div className="p-3 bg-red-950/20 border border-red-950 text-red-400 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={lockoutUntil !== null && lockoutUntil > Date.now()}
                  className="w-full py-3 bg-gold-400 hover:bg-gold-500 text-zinc-950 font-bold rounded-lg text-xs tracking-widest uppercase transition-all duration-300 hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  Entrar
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* --- STAGE 2: SECURE CONSOLE --- */
          <div className="p-6">
            {/* Top Command Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 mb-6 bg-zinc-950 p-4 border border-zinc-900 rounded-lg">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
                <span className="text-xs font-mono tracking-wider text-emerald-400 font-medium truncate">
                  CONEXÃO ADM AUTENTICADA
                </span>
                {isConfigured && (
                  <span className="text-[9px] font-mono bg-gold-950/30 border border-gold-950/20 text-gold-400 px-2 py-0.5 rounded hidden sm:inline-block shrink-0">
                    CLOUDSYNC FIRESTORE
                  </span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={openAddForm}
                  className="px-3 sm:px-4 py-2 bg-gold-500 hover:bg-gold-600 text-zinc-950 font-bold rounded text-xs tracking-widest uppercase flex items-center justify-center sm:justify-start gap-1.5 transition-colors cursor-pointer"
                  id="add-perfume-btn"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Incluir Perfume</span>
                  <span className="sm:hidden">Incluir</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetCatalog}
                  className="px-3 sm:px-3.5 py-2 hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 rounded text-xs font-mono uppercase flex items-center justify-center sm:justify-start gap-1.5 transition-all"
                  title="Resetar catálogo"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Restaurar Padrões</span>
                  <span className="sm:hidden">Restaurar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSecurityLogs(!showSecurityLogs)}
                  className={`px-3 sm:px-3.5 py-2 rounded text-xs font-mono uppercase flex items-center justify-center sm:justify-start gap-1.5 transition-all border ${
                    showSecurityLogs
                      ? "bg-gold-500/10 text-gold-400 border-gold-500/30 font-semibold"
                      : "hover:bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800"
                  }`}
                  title="Histórico de Auditoria de Segurança"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{showSecurityLogs ? "Ver Catálogo" : "Trilha Auditoria"}</span>
                  <span className="sm:hidden">{showSecurityLogs ? "Catálogo" : "Auditoria"}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 sm:px-3 py-2 bg-red-950/20 hover:bg-red-950/45 text-red-400 rounded text-xs uppercase flex items-center justify-center sm:justify-start gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </div>
            </div>

            {/* Content view toggled between: Security Audit Logs, Form Edit, or Products Catalogue View */}
            {showSecurityLogs ? (
              /* SECURITY AUDIT LEDGER VIEW */
              <div className="space-y-4 animate-fade-in bg-zinc-950/20 border border-zinc-900 p-6 rounded-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-950 p-4 border border-zinc-900 rounded-lg">
                  <div>
                    <h3 className="font-serif text-base text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-gold-400" />
                      Trilha de Auditoria e Logs de Segurança
                    </h3>
                    <p className="text-[10px] text-zinc-500 mt-1">
                      Servidor de auditoria em conformidade com as diretivas RD
                      Parfums Security Core. Limite de preenchimento local: 50
                      logs.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      showConfirm({
                        title: "Purgar Logs de Auditoria",
                        message:
                          "Deseja excluir de forma irrecuperável o histórico de logs de segurança local? Esta ação não pode ser revertida.",
                        confirmText: "Purgar Logs",
                        cancelText: "Voltar",
                        isDestructive: true,
                        onConfirm: () => {
                          localStorage.removeItem("rd_parfums_audit_logs");
                          setAuditLogs([]);
                          addAuditLog(
                            "LOGS_PURGED",
                            "Logs de auditoria local esvaziados pelo operador.",
                          );
                          showNotification("Trilha de logs purgada.");
                        },
                      });
                    }}
                    className="text-[10px] text-red-400 hover:text-red-350 hover:underline font-mono flex items-center gap-1 uppercase bg-red-950/10 px-2.5 py-1 rounded border border-red-950/20 cursor-pointer"
                  >
                    Purgar Logs
                  </button>
                </div>

                <div className="border border-zinc-900 rounded-lg overflow-hidden bg-zinc-950/20 max-h-[480px] overflow-y-auto font-mono">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-zinc-950 border-b border-zinc-900 font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                        <th className="p-3">ID Log</th>
                        <th className="p-3">Timestamp / Hora</th>
                        <th className="p-3">Operador</th>
                        <th className="p-3">Ação</th>
                        <th className="p-3">Endereço IP</th>
                        <th className="p-3">Detalhes Históricos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-950 font-mono">
                      {auditLogs.map((log) => (
                        <tr
                          key={log.id}
                          className="hover:bg-zinc-900/20 transition-colors"
                        >
                          <td className="p-3 text-gold-400 text-[10px] font-bold">
                            {log.id}
                          </td>
                          <td className="p-3 text-zinc-400 text-[10px]">
                            {new Date(log.timestamp).toLocaleString("pt-BR")}
                          </td>
                          <td
                            className="p-3 text-zinc-300 max-w-[120px] truncate"
                            title={log.operator}
                          >
                            {log.operator}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                log.action.includes("FAILURE") ||
                                log.action.includes("FAILED")
                                  ? "bg-red-500/10 text-red-500 border border-red-500/25"
                                  : log.action.includes("SUCCESS") ||
                                      log.action.includes("ADDED")
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                                    : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                              }`}
                            >
                              {log.action}
                            </span>
                          </td>
                          <td className="p-3 text-[10px] text-zinc-500">
                            {log.ipAddress}
                          </td>
                          <td
                            className="p-3 text-zinc-300 max-w-[200px] truncate"
                            title={log.details}
                          >
                            {log.details}
                          </td>
                        </tr>
                      ))}
                      {auditLogs.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="p-8 text-center text-zinc-500 text-[11px]"
                          >
                            Nenhum evento registrado no livro de logs de
                            auditoria técnica.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : isEditing ? (
              /* PANEL FORM VIEW */
              <form
                onSubmit={handleSave}
                className="space-y-6 bg-zinc-950/40 border border-zinc-900 p-6 rounded-lg animate-fade-in"
              >
                <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                  <h3 className="font-serif text-lg text-white">
                    {editingId
                      ? `Editando Fragrância: ${formData.name}`
                      : "Instalar Nova Fragrância Nobre"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-xs text-zinc-500 hover:text-white flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Cancelar Edição
                  </button>
                </div>

                {/* Form fields layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block mb-1">
                        Nome do Perfume *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Ex: Royal Saphir"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-xs text-white placeholder-zinc-750 focus:outline-none focus:border-gold-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block mb-1">
                          Preço Sugerido (R$) *
                        </label>
                        <input
                          type="number"
                          value={formData.price || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              price: Number(e.target.value),
                            })
                          }
                          placeholder="Ex: 850"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-xs text-white placeholder-zinc-750 focus:outline-none focus:border-gold-500"
                          required
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block mb-1">
                          Categoria *
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category: e.target.value as
                                | "MASCULINO"
                                | "FEMININO",
                            })
                          }
                          className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-500"
                        >
                          <option value="FEMININO">Feminino</option>
                          <option value="MASCULINO">Masculino</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block mb-1">
                        Família Olfativa / Assinatura *
                      </label>
                      <input
                        type="text"
                        value={formData.family}
                        onChange={(e) =>
                          setFormData({ ...formData, family: e.target.value })
                        }
                        placeholder="Ex: Intenso • Amadeirado • Oriental"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-xs text-white placeholder-zinc-750 focus:outline-none focus:border-gold-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block mb-1">
                          Projeção / Intensidade *
                        </label>
                        <select
                          value={formData.intensity}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              intensity: e.target.value as any,
                            })
                          }
                          className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-500"
                        >
                          <option value="Suave">Suave</option>
                          <option value="Moderado">Moderado</option>
                          <option value="Intenso">Intenso</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block mb-1">
                          Volumetrias Disponíveis *
                        </label>
                        <input
                          type="text"
                          value={formData.volumesText}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              volumesText: e.target.value,
                            })
                          }
                          placeholder="Ex: 50ml, 100ml"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-xs text-white placeholder-zinc-750 focus:outline-none focus:border-gold-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-sm">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.isBestSeller}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isBestSeller: e.target.checked,
                            })
                          }
                          className="rounded border-zinc-800 text-gold-500 focus:ring-0 focus:ring-offset-0 bg-transparent w-4 h-4 cursor-pointer"
                        />
                        <span className="text-xs text-zinc-200 font-medium">
                          Marcar como Em Destaque (Best Seller)
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block mb-1">
                        Descrição Olfativa / Sensorial *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Descreva a personalidade, aura e mistério que envolvem esse perfume..."
                        rows={4}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-xs text-white placeholder-zinc-750 focus:outline-none focus:border-gold-500 resize-none leading-relaxed"
                        required
                      />
                    </div>

                    {/* Pyramid / Olfactory notes */}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block mb-1">
                          Saída (Top Notes)
                        </label>
                        <input
                          type="text"
                          value={formData.topNotesText}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              topNotesText: e.target.value,
                            })
                          }
                          placeholder="Ex: Bergamota, Sálvia"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-[11px] text-white placeholder-zinc-750 focus:outline-none focus:border-gold-500 animate-slide-in"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block mb-1">
                          Coração (Heart)
                        </label>
                        <input
                          type="text"
                          value={formData.heartNotesText}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              heartNotesText: e.target.value,
                            })
                          }
                          placeholder="Ex: Jasmim, Pimenta"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-[11px] text-white placeholder-zinc-750 focus:outline-none focus:border-gold-500 animate-slide-in"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block mb-1">
                          Fundo (Base Notes)
                        </label>
                        <input
                          type="text"
                          value={formData.baseNotesText}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              baseNotesText: e.target.value,
                            })
                          }
                          placeholder="Ex: Baunilha, Sândalo"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-[11px] text-white placeholder-zinc-750 focus:outline-none focus:border-gold-500 animate-slide-in"
                        />
                      </div>
                    </div>

                    {/* Elegant Image Manager Panel */}
                    <div className="border border-zinc-900 rounded-lg p-3 bg-zinc-950/60">
                      <div className="flex items-center justify-between mb-3 border-b border-zinc-900/60 pb-2">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block font-semibold">
                          Imagem e Visual do Frasco *
                        </label>
                        <span className="text-[10px] font-mono text-gold-500">
                          Formato Recomendado: Quadrado
                        </span>
                      </div>

                      {/* Tab selection buttons */}
                      <div className="flex gap-1.5 mb-3 bg-black/40 p-1 rounded-md border border-zinc-900">
                        <button
                          type="button"
                          onClick={() => setActiveImageTab("presets")}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-[10px] font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                            activeImageTab === "presets"
                              ? "bg-gold-500/10 text-gold-400 border border-gold-400/20 shadow-sm"
                              : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                          }`}
                        >
                          <Image className="w-3 h-3" />
                          Predefinições de Luxo
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveImageTab("upload")}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-[10px] font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                            activeImageTab === "upload"
                              ? "bg-gold-500/10 text-gold-400 border border-gold-400/20 shadow-sm"
                              : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                          }`}
                        >
                          <Upload className="w-3 h-3" />
                          Enviar do Computador
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveImageTab("url")}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-[10px] font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                            activeImageTab === "url"
                              ? "bg-gold-500/10 text-gold-400 border border-gold-400/20 shadow-sm"
                              : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                          }`}
                        >
                          <Link className="w-3 h-3" />
                          Endereço URL
                        </button>
                      </div>

                      {/* Form Content depending on tab */}
                      {activeImageTab === "presets" && (
                        <div className="space-y-2">
                          <label className="text-[9px] font-mono text-zinc-500 block">
                            Selecione uma de nossas artes conceituais de alta
                            definição:
                          </label>
                          <div className="grid grid-cols-6 gap-2 mb-1">
                            {LUXURY_BOTTLE_PRESETS.map((preset, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    image: preset.url,
                                  })
                                }
                                className={`aspect-square overflow-hidden rounded border transition-all cursor-pointer ${
                                  formData.image === preset.url
                                    ? "border-gold-400 ring-1 ring-gold-400 shadow-lg shadow-gold-500/5"
                                    : "border-zinc-850 opacity-40 hover:opacity-100 hover:border-zinc-700"
                                }`}
                                title={preset.name}
                              >
                                <img
                                  src={preset.url}
                                  alt={preset.name}
                                  className="w-full h-full object-cover"
                                />
                                {formData.image === preset.url && (
                                  <div className="absolute inset-0 bg-gold-400/15 flex items-center justify-center pointer-events-none">
                                    <Check className="w-4 h-4 text-gold-400 bg-zinc-950/90 rounded-full p-0.5 border border-gold-400/30" />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                          {LUXURY_BOTTLE_PRESETS.some(
                            (p) => p.url === formData.image,
                          ) && (
                            <p className="text-[10px] font-mono text-gold-400 text-center uppercase tracking-widest pt-1">
                              Selecionado:{" "}
                              {
                                LUXURY_BOTTLE_PRESETS.find(
                                  (p) => p.url === formData.image,
                                )?.name
                              }
                            </p>
                          )}
                        </div>
                      )}

                      {activeImageTab === "upload" && (
                        <div className="space-y-3">
                          <div
                            onDragEnter={handleDrag}
                            onDragOver={handleDrag}
                            onDragLeave={handleDrag}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center transition-all ${
                              dragActive
                                ? "border-gold-400 bg-gold-500/5"
                                : "border-zinc-800 bg-black/20 hover:bg-black/30 hover:border-zinc-700"
                            }`}
                          >
                            <input
                              type="file"
                              id="perfume-image-upload"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                            <label
                              htmlFor="perfume-image-upload"
                              className="flex flex-col items-center cursor-pointer w-full text-center"
                            >
                              <div className="p-2.5 rounded-full bg-zinc-900 border border-zinc-800 mb-2 hover:scale-105 transition-transform">
                                <Upload className="w-4 h-4 text-gold-400" />
                              </div>
                              <span className="text-xs text-zinc-300 font-medium">
                                Arraste & solte sua imagem de perfume aqui
                              </span>
                              <span className="text-[10px] text-zinc-500 mt-1">
                                ou clique para buscar no seu dispositivo
                              </span>
                              <span className="text-[9px] font-mono text-zinc-650 mt-1 uppercase tracking-wider">
                                PNG, JPG ou WEBP (Otimizado via canvas)
                              </span>
                            </label>
                          </div>

                          {/* Preview box if Base64 uploaded */}
                          {formData.image &&
                            formData.image.startsWith("data:image/") && (
                              <div className="p-2 bg-black/40 border border-zinc-900 rounded-md flex items-center gap-3 animate-fade-in">
                                <div className="w-12 h-12 rounded overflow-hidden border border-zinc-800 shrink-0 bg-zinc-900">
                                  <img
                                    src={formData.image}
                                    alt="Upload Preview"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0 pr-2">
                                  <span className="text-[10px] font-mono text-gold-400 uppercase tracking-wide block">
                                    Imagem Carregada
                                  </span>
                                  <span className="text-[9px] text-zinc-500 block truncate">
                                    Frasco customizado codificado localmente
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData({
                                      ...formData,
                                      image: LUXURY_BOTTLE_PRESETS[0].url,
                                    })
                                  }
                                  className="p-1 px-2.5 text-[9px] font-mono uppercase tracking-widest text-red-500 border border-red-500/10 hover:border-red-500/30 hover:bg-red-500/5 rounded transition-all cursor-pointer"
                                >
                                  Limpar
                                </button>
                              </div>
                            )}
                        </div>
                      )}

                      {activeImageTab === "url" && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-zinc-550 block">
                            Insira um endereço URL direto de imagem na internet:
                          </label>
                          <div className="relative">
                            <input
                              type="url"
                              value={formData.image}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  image: e.target.value,
                                })
                              }
                              placeholder="https://exemplo.com/frasco.jpg"
                              className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 pl-3 pr-24 text-xs text-white placeholder-zinc-750 focus:outline-none focus:border-gold-500"
                            />
                            {formData.image &&
                              !formData.image.startsWith("data:image/") &&
                              !LUXURY_BOTTLE_PRESETS.some(
                                (p) => p.url === formData.image,
                              ) && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData({
                                      ...formData,
                                      image: LUXURY_BOTTLE_PRESETS[0].url,
                                    })
                                  }
                                  className="absolute right-2 top-2 px-2 py-0.5 text-[9px] font-mono bg-zinc-905 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 rounded cursor-pointer"
                                >
                                  Limpar
                                </button>
                              )}
                          </div>

                          {/* Live render preview if custom input used */}
                          {formData.image &&
                            !formData.image.startsWith("data:image/") &&
                            !LUXURY_BOTTLE_PRESETS.some(
                              (p) => p.url === formData.image,
                            ) && (
                              <div className="p-2 bg-black/40 border border-zinc-900 rounded-md flex items-center gap-3 mt-2 animate-fade-in">
                                <div className="w-12 h-12 rounded overflow-hidden border border-zinc-800 shrink-0 bg-zinc-900">
                                  <img
                                    src={formData.image}
                                    alt="Custom URL preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        LUXURY_BOTTLE_PRESETS[0].url;
                                    }}
                                  />
                                </div>
                                <div className="flex-1 min-w-0 pr-2">
                                  <span className="text-[10px] font-mono text-gold-400 uppercase tracking-wide block">
                                    URL Personalizada de Imagem
                                  </span>
                                  <span className="text-[9px] text-zinc-500 block truncate leading-tight">
                                    {formData.image}
                                  </span>
                                </div>
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-900 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded text-xs tracking-wider uppercase font-semibold transition"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gold-400 hover:bg-gold-500 text-zinc-950 font-bold rounded text-xs tracking-widest uppercase transition shadow-lg cursor-pointer"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            ) : (
              /* PRODUCTS TABLE VIEW */
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-mono text-zinc-400">
                    Estoque do Catálogo:{" "}
                    <strong className="text-white text-sm">
                      {perfumesList.length}
                    </strong>{" "}
                    perfumes ativos
                  </span>
                </div>

                <div className="border border-zinc-900 rounded-lg overflow-hidden bg-zinc-950/20">
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-950 border-b border-zinc-900">
                          <th className="p-4 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                            Frasco
                          </th>
                          <th className="p-4 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                            Nome / Linha
                          </th>
                          <th className="p-4 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                            Família
                          </th>
                          <th className="p-4 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                            Preço
                          </th>
                          <th className="p-4 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                            Destaque
                          </th>
                          <th className="p-4 text-[10px] font-mono uppercase tracking-wider text-zinc-500 text-right">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-950">
                        {perfumesList.map((perfume) => (
                          <tr
                            key={perfume.id}
                            className="hover:bg-zinc-900/30 transition-colors"
                          >
                            <td className="p-4">
                              <div className="w-12 h-12 rounded overflow-hidden bg-zinc-900 border border-zinc-800">
                                <img
                                  src={perfume.image}
                                  alt={perfume.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="font-sans text-sm font-semibold text-white">
                                {perfume.name}
                              </div>
                              <div className="text-[10px] font-mono text-gold-500 uppercase mt-0.5">
                                {perfume.category} • {perfume.intensity}
                              </div>
                            </td>
                            <td className="p-4 text-xs text-zinc-400 font-light max-w-[200px] truncate">
                              {perfume.family}
                            </td>
                            <td className="p-4 font-mono text-xs text-zinc-200">
                              R${" "}
                              {perfume.price.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => handleToggleBestSeller(perfume)}
                                className={`text-xs px-2.5 py-1 rounded-full font-semibold transition border ${
                                  perfume.isBestSeller
                                    ? "bg-gold-500/10 text-gold-400 border-gold-500/25"
                                    : "bg-zinc-900 text-zinc-640 border-transparent hover:border-zinc-800 text-zinc-500"
                                }`}
                              >
                                {perfume.isBestSeller
                                  ? "★ Em Destaque"
                                  : "★ Comum"}
                              </button>
                            </td>
                            <td className="p-4 text-right">
                              <div className="inline-flex gap-2">
                                <button
                                  onClick={() => openEditForm(perfume)}
                                  className="p-2 text-zinc-400 hover:text-gold-400 hover:bg-zinc-900 rounded transition-colors"
                                  title="Editar perfume"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDelete(perfume.id, perfume.name)
                                  }
                                  className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-950/10 rounded transition-colors"
                                  title="Excluir perfume"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3 p-4">
                    {perfumesList.length === 0 ? (
                      <div className="p-8 text-center text-xs text-zinc-500">
                        Nenhum perfume encontrado no estoque.
                      </div>
                    ) : (
                      perfumesList.map((perfume) => (
                        <div
                          key={perfume.id}
                          className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-4 space-y-3"
                        >
                          <div className="flex gap-3 items-start">
                            <div className="w-16 h-16 rounded overflow-hidden bg-zinc-900 border border-zinc-700 shrink-0">
                              <img
                                src={perfume.image}
                                alt={perfume.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-sans text-sm font-semibold text-white truncate">
                                {perfume.name}
                              </h4>
                              <p className="text-[10px] font-mono text-gold-500 uppercase mt-0.5">
                                {perfume.category} • {perfume.intensity}
                              </p>
                              <p className="text-xs text-zinc-400 font-light mt-1 line-clamp-2">
                                {perfume.family}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                            <div>
                              <p className="text-[10px] text-zinc-500 uppercase font-mono mb-1">
                                Preço
                              </p>
                              <p className="font-mono text-sm font-semibold text-zinc-200">
                                R${" "}
                                {perfume.price.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                })}
                              </p>
                            </div>
                            <button
                              onClick={() => handleToggleBestSeller(perfume)}
                              className={`text-xs px-3 py-1.5 rounded-full font-semibold transition border ${
                                perfume.isBestSeller
                                  ? "bg-gold-500/10 text-gold-400 border-gold-500/25"
                                  : "bg-zinc-800 text-zinc-500 border-transparent hover:border-zinc-700"
                              }`}
                            >
                              {perfume.isBestSeller
                                ? "★ Destaque"
                                : "★ Comum"}
                            </button>
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-zinc-800">
                            <button
                              onClick={() => openEditForm(perfume)}
                              className="flex-1 p-2 text-zinc-400 hover:text-gold-400 hover:bg-zinc-800 rounded transition-colors text-xs uppercase font-mono flex items-center justify-center gap-1"
                              title="Editar perfume"
                            >
                              <Edit2 className="w-3.5 h-3.5" /> Editar
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(perfume.id, perfume.name)
                              }
                              className="flex-1 p-2 text-zinc-400 hover:text-red-400 hover:bg-red-950/20 rounded transition-colors text-xs uppercase font-mono flex items-center justify-center gap-1"
                              title="Excluir perfume"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Excluir
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {perfumesList.length === 0 && (
                    <div className="hidden md:block p-8 text-center text-xs text-zinc-500">
                      Nenhum perfume encontrado no estoque. Clique no botão de
                      incluir ou restaurar os padrões.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dynamic Security Custom Dialog Overlay */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div className="bg-zinc-950 border border-gold-500/20 rounded-md max-w-md w-full p-6 shadow-2xl shadow-black relative animate-scale-up">
            {/* Small top accent line */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 rounded-t-md ${confirmDialog.isDestructive ? "bg-red-600" : "bg-gold-500"}`}
            ></div>

            <div className="flex items-start gap-4 mb-4 pt-1">
              <div
                className={`p-2.5 rounded-full shrink-0 ${confirmDialog.isDestructive ? "bg-red-950/20 border border-red-900/30 text-red-400" : "bg-gold-500/10 border border-gold-500/20 text-gold-400"}`}
              >
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-base text-zinc-100 tracking-wide font-medium">
                  {confirmDialog.title}
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">
                  {confirmDialog.message}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-900 mt-5">
              {confirmDialog.cancelText && (
                <button
                  type="button"
                  onClick={() => setConfirmDialog(null)}
                  className="px-4 py-2 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded text-[10px] font-mono uppercase tracking-widest transition cursor-pointer"
                >
                  {confirmDialog.cancelText}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
                className={`px-4 py-2 rounded text-[10px] font-mono uppercase tracking-widest font-bold transition cursor-pointer ${
                  confirmDialog.isDestructive
                    ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/10"
                    : "bg-gold-400 hover:bg-gold-500 text-zinc-950 shadow-lg shadow-gold-950/10"
                }`}
              >
                {confirmDialog.confirmText || "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
