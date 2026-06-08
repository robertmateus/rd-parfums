import React, { useState, useEffect } from "react";
import { Coupon } from "../types";
import * as perfumeService from "../data/perfumeService";
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Ticket,
  AlertCircle,
  Calendar,
} from "lucide-react";

export default function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    discountType: "fixed" as "fixed" | "percentage",
    discountValue: 0,
    maxUses: 0,
    usesPerPerson: 1,
    currentUses: 0,
    validFrom: new Date().toISOString().split("T")[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    isActive: true,
    description: "",
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const data = await perfumeService.getCoupons();
      setCoupons(data);
      setError("");
    } catch (err) {
      setError("Erro ao carregar cupons");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      discountType: "fixed",
      discountValue: 0,
      maxUses: 0,
      usesPerPerson: 1,
      currentUses: 0,
      validFrom: new Date().toISOString().split("T")[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      isActive: true,
      description: "",
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleSave = async () => {
    if (!formData.code.trim()) {
      setError("Código do cupom é obrigatório");
      return;
    }
    if (!formData.name.trim()) {
      setError("Nome do cupom é obrigatório");
      return;
    }
    if (!formData.discountValue || formData.discountValue <= 0) {
      setError("Valor de desconto deve ser maior que 0");
      return;
    }
    if (formData.discountType === "percentage" && formData.discountValue > 100) {
      setError("Desconto em porcentagem não pode ser maior que 100%");
      return;
    }
    if (!formData.maxUses || formData.maxUses <= 0) {
      setError("Número máximo de usos deve ser maior que 0");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await perfumeService.editCoupon(editingId, formData);
      } else {
        await perfumeService.addCoupon({ ...formData, currentUses: 0 });
      }
      await loadCoupons();
      resetForm();
      setError("");
    } catch (err) {
      setError("Erro ao salvar cupom");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setFormData({
      code: coupon.code,
      name: coupon.name,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxUses: coupon.maxUses,
      usesPerPerson: coupon.usesPerPerson,
      currentUses: coupon.currentUses,
      validFrom: coupon.validFrom.split("T")[0],
      validUntil: coupon.validUntil.split("T")[0],
      isActive: coupon.isActive,
      description: coupon.description || "",
    });
    setEditingId(coupon.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja deletar este cupom?")) {
      setLoading(true);
      try {
        await perfumeService.deleteCoupon(id);
        await loadCoupons();
        setError("");
      } catch (err) {
        setError("Erro ao deletar cupom");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const isExpired = (coupon: Coupon): boolean => {
    return new Date(coupon.validUntil) < new Date();
  };

  const isComingSoon = (coupon: Coupon): boolean => {
    return new Date(coupon.validFrom) > new Date();
  };

  const getProgressPercent = (coupon: Coupon): number => {
    return Math.round((coupon.currentUses / coupon.maxUses) * 100);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-serif text-white uppercase tracking-wider flex items-center gap-2">
          <Ticket className="w-5 h-5 text-gold-400" />
          Gerenciar Cupons
        </h3>
        {!isAdding && (
          <button
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="px-4 py-2 bg-gold-500 text-luxury-950 rounded-sm flex items-center gap-2 text-xs font-bold hover:bg-gold-400 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Novo Cupom
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-sm p-3 flex items-start gap-2 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      {isAdding && (
        <div className="bg-luxury-900 border border-zinc-800/50 rounded-sm p-4 md:p-6 space-y-6">
          <h4 className="font-mono text-xs md:text-sm text-gold-400 uppercase tracking-wider mb-4">
            {editingId ? "Editar Cupom" : "Novo Cupom"}
          </h4>

          {/* INFORMAÇÕES BÁSICAS */}
          <div className="space-y-3 border-b border-zinc-800/40 pb-4">
            <h5 className="font-mono text-[10px] md:text-xs text-gold-400 uppercase tracking-widest">Informações Básicas</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1.5 font-medium">Código do Cupom</label>
                <input
                  type="text"
                  placeholder="Ex: SUMMER2024"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  disabled={!!editingId}
                  className="w-full bg-black/40 border border-zinc-800 p-2.5 rounded-sm text-xs text-white placeholder-zinc-600 outline-none disabled:opacity-50 focus:border-gold-500/70"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1.5 font-medium">Nome do Cupom</label>
                <input
                  type="text"
                  placeholder="Ex: Desconto de Verão"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black/40 border border-zinc-800 p-2.5 rounded-sm text-xs text-white placeholder-zinc-600 outline-none focus:border-gold-500/70"
                />
              </div>
            </div>
          </div>

          {/* TIPO E VALOR DO DESCONTO */}
          <div className="space-y-3 border-b border-zinc-800/40 pb-4">
            <h5 className="font-mono text-[10px] md:text-xs text-gold-400 uppercase tracking-widest">Desconto</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1.5 font-medium">Tipo de Desconto</label>
                <select
                  value={formData.discountType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountType: e.target.value as "fixed" | "percentage",
                    })
                  }
                  className="w-full bg-black/40 border border-zinc-800 p-2.5 rounded-sm text-xs text-white outline-none focus:border-gold-500/70"
                >
                  <option value="fixed">Desconto Fixo (R$)</option>
                  <option value="percentage">Desconto em % (%)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1.5 font-medium">Valor</label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder={formData.discountType === "fixed" ? "Ex: 49,90" : "Ex: 15"}
                  value={String(formData.discountValue === 0 ? "" : formData.discountValue).replace('.', ',')}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\s+/g, '').replace(',', '.');
                    const num = parseFloat(raw);
                    const value = isNaN(num) ? 0 : Math.max(0, num);
                    setFormData({ ...formData, discountValue: value });
                  }}
                  className="w-full bg-black/40 border border-zinc-800 p-2.5 rounded-sm text-xs text-white placeholder-zinc-600 outline-none focus:border-gold-500/70"
                />
              </div>
            </div>
            <p className="text-[10px] text-zinc-500 italic">Use <strong>vírgula</strong> para casas decimais (ex: 49,90). Porcentagem: 0-100%.</p>
          </div>

          {/* LIMITES DE USO */}
          <div className="space-y-3 border-b border-zinc-800/40 pb-4">
            <h5 className="font-mono text-[10px] md:text-xs text-gold-400 uppercase tracking-widest">Limites de Uso</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1.5 font-medium">Limite Total na Loja</label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  placeholder="Número máximo de usos"
                  value={formData.maxUses}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxUses: Math.max(1, parseInt(e.target.value || '0')),
                    })
                  }
                  className="w-full bg-black/40 border border-zinc-800 p-2.5 rounded-sm text-xs text-white placeholder-zinc-600 outline-none focus:border-gold-500/70"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1.5 font-medium">Limite por Cliente</label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  placeholder="Usos por pessoa"
                  value={formData.usesPerPerson}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      usesPerPerson: Math.max(1, parseInt(e.target.value || '1')),
                    })
                  }
                  className="w-full bg-black/40 border border-zinc-800 p-2.5 rounded-sm text-xs text-white placeholder-zinc-600 outline-none focus:border-gold-500/70"
                />
              </div>
            </div>
            <p className="text-[10px] text-zinc-500 italic">Clientes são identificados por número de WhatsApp.</p>
          </div>

          {/* VALIDADE */}
          <div className="space-y-3 border-b border-zinc-800/40 pb-4">
            <h5 className="font-mono text-[10px] md:text-xs text-gold-400 uppercase tracking-widest">Validade</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1.5 font-medium">Válido de</label>
                <input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) =>
                    setFormData({ ...formData, validFrom: e.target.value })
                  }
                  className="w-full bg-black/40 border border-zinc-800 p-2.5 rounded-sm text-xs text-white outline-none focus:border-gold-500/70"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1.5 font-medium">Válido até</label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) =>
                    setFormData({ ...formData, validUntil: e.target.value })
                  }
                  className="w-full bg-black/40 border border-zinc-800 p-2.5 rounded-sm text-xs text-white outline-none focus:border-gold-500/70"
                />
              </div>
            </div>
          </div>

          {/* NOTAS ADMINISTRATIVAS */}
          <div className="space-y-3">
            <h5 className="font-mono text-[10px] md:text-xs text-gold-400 uppercase tracking-widest">Notas Administrativas</h5>
            
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1.5 font-medium">Descrição Interna (Opcional)</label>
              <textarea
                placeholder="Motivo, comentários ou notas sobre este cupom..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full bg-black/40 border border-zinc-800 p-2.5 rounded-sm text-xs text-white placeholder-zinc-600 outline-none focus:border-gold-500/70 resize-none h-20"
              />
              <p className="text-[10px] text-zinc-500 italic mt-1.5">Apenas para referência interna — não exibida ao cliente.</p>
            </div>

            <div className="flex items-center gap-3 bg-black/20 p-3 rounded-sm border border-zinc-800/40">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-5 h-5 cursor-pointer rounded"
              />
              <label htmlFor="isActive" className="text-sm text-white cursor-pointer font-medium">
                Cupom ativo
              </label>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-zinc-800/40">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 px-4 py-3 md:py-2 bg-gold-500 text-luxury-950 rounded-sm text-xs md:text-sm font-bold hover:bg-gold-400 disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5 md:w-4 md:h-4" />
              Salvar
            </button>
            <button
              onClick={resetForm}
              disabled={loading}
              className="flex-1 px-4 py-3 md:py-2 bg-zinc-800 text-white rounded-sm text-xs md:text-sm font-bold hover:bg-zinc-700 disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5 md:w-4 md:h-4" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Coupons List */}
      {loading && <div className="text-center text-zinc-400 py-4">Carregando...</div>}

      {!loading && coupons.length === 0 && !isAdding && (
        <div className="text-center py-8 text-zinc-500">
          <Ticket className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhum cupom criado ainda</p>
        </div>
      )}

      <div className="space-y-2">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className={`border ${
              isExpired(coupon)
                ? "border-red-500/20 bg-red-500/5"
                : isComingSoon(coupon)
                  ? "border-blue-500/20 bg-blue-500/5"
                  : "border-zinc-800/50 bg-black/20"
            } rounded-sm p-3 space-y-2`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-gold-300">
                    {coupon.code}
                  </span>
                  {isExpired(coupon) && (
                    <span className="text-[8px] px-2 py-1 bg-red-500/20 text-red-300 rounded">
                      EXPIRADO
                    </span>
                  )}
                  {isComingSoon(coupon) && (
                    <span className="text-[8px] px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                      EM BREVE
                    </span>
                  )}
                  {!coupon.isActive && (
                    <span className="text-[8px] px-2 py-1 bg-gray-500/20 text-gray-300 rounded">
                      INATIVO
                    </span>
                  )}
                </div>
                <p className="text-xs text-white mt-1">{coupon.name}</p>
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(coupon)}
                  className="p-1.5 text-zinc-500 hover:text-gold-400 transition-colors cursor-pointer"
                  title="Editar"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(coupon.id)}
                  className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                  title="Deletar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] text-zinc-400">
              <div>
                <span className="block text-zinc-500">Desconto</span>
                <span className="text-white font-mono">
                  {coupon.discountType === "fixed"
                    ? `R$ ${coupon.discountValue}`
                    : `${coupon.discountValue}%`}
                </span>
              </div>
              <div>
                <span className="block text-zinc-500">Uso</span>
                <span className="text-white font-mono">
                  {coupon.currentUses}/{coupon.maxUses}
                </span>
              </div>
              <div>
                <span className="block text-zinc-500">Por Pessoa</span>
                <span className="text-white font-mono">
                  {coupon.usesPerPerson}x
                </span>
              </div>
            </div>

            <div className="w-full bg-zinc-800/50 rounded-full h-1.5">
              <div
                className="bg-gold-500 h-full rounded-full transition-all"
                style={{ width: `${getProgressPercent(coupon)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-zinc-500">
              <span>
                {getProgressPercent(coupon)}% - {coupon.currentUses} de{" "}
                {coupon.maxUses} usos
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(coupon.validUntil).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
