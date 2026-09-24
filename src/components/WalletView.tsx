import React, { useState } from 'react';
import {
  Coins,
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  CheckCircle2,
  Lock,
  Upload,
  Clock,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { TokenPackage, PaymentMethod, KYCRecord, KYCStatus } from '../types';
import { TOKEN_PACKAGES } from '../data/mockFootballData';
import { formatCOP } from '../utils/scoring';

interface WalletViewProps {
  userTokens: number;
  onBuyTokens: (pkg: TokenPackage, method: PaymentMethod) => void;
  kycRecord: KYCRecord;
  onUpdateKYC: (record: Partial<KYCRecord>) => void;
  onRequestWithdrawal: (amountTokens: number, destination: string) => void;
}

export const WalletView: React.FC<WalletViewProps> = ({
  userTokens,
  onBuyTokens,
  kycRecord,
  onUpdateKYC,
  onRequestWithdrawal,
}) => {
  const [selectedPackage, setSelectedPackage] = useState<TokenPackage>(TOKEN_PACKAGES[2]);
  const [isCustomVIP, setIsCustomVIP] = useState<boolean>(false);
  const [customAmountCOP, setCustomAmountCOP] = useState<number>(200000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Nequi');
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // KYC form local state
  const [docType, setDocType] = useState(kycRecord.documentType);
  const [fullName, setFullName] = useState(kycRecord.fullName);
  const [docNumber, setDocNumber] = useState(kycRecord.documentNumber);
  const [phone, setPhone] = useState(kycRecord.phone);
  const [bankName, setBankName] = useState(kycRecord.bankName);
  const [accountNumber, setAccountNumber] = useState(kycRecord.accountNumber);

  // Withdraw state
  const [withdrawTokens, setWithdrawTokens] = useState<number>(20);
  const [withdrawDestination, setWithdrawDestination] = useState<string>('Nequi: 312 849 2011');

  const handleSaveKYC = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateKYC({
      documentType: docType,
      fullName,
      documentNumber: docNumber,
      phone,
      bankName,
      accountNumber,
      documentFrontUploaded: true,
      documentBackUploaded: true,
      status: 'verified',
      submittedAt: new Date().toISOString(),
    });
    setShowKYCModal(false);
  };

  const handleWithdrawClick = () => {
    if (kycRecord.status !== 'verified') {
      setShowKYCModal(true);
      return;
    }
    setShowWithdrawModal(true);
  };

  const submitWithdrawal = () => {
    if (withdrawTokens > userTokens) {
      alert('Saldo insuficiente en tokens.');
      return;
    }
    onRequestWithdrawal(withdrawTokens, withdrawDestination);
    setShowWithdrawModal(false);
    alert(`Solicitud de retiro por ${withdrawTokens} DT ($${withdrawTokens.toLocaleString('es-CO')} COP) enviada con éxito a tu red de agente.`);
  };

  return (
    <div className="space-y-5 text-left">
      {/* Wallet Balance Hero Card */}
      <div className="bg-gradient-to-br from-[#0C1D16] via-[#0F2319] to-[#071410] border border-[#E6BE55]/40 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E6BE55]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest block">
              Billetera Oficial Master DT
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-4xl sm:text-5xl font-black text-[#E6BE55] tracking-tight">
                {userTokens}
              </span>
              <span className="text-lg font-mono font-bold text-gray-300">DT TOKENS</span>
            </div>
            <span className="text-sm font-mono text-[#54C3BB] mt-1 block">
              Equivalente: ${userTokens.toLocaleString('es-CO')} COP (cada 1 token $DT vale 1 peso • cambio 1 a 1)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                const el = document.getElementById('token-packages-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C9F04D] hover:bg-[#D5F565] text-[#071410] font-mono font-bold text-xs shadow-lg transition cursor-pointer active:scale-95"
            >
              <ArrowDownLeft className="w-4 h-4" /> Recargar Tokens
            </button>

            <button
              onClick={handleWithdrawClick}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0F2319] hover:bg-[#153827] text-white border border-[#143426] hover:border-gray-500 font-mono font-bold text-xs transition cursor-pointer active:scale-95"
            >
              <ArrowUpRight className="w-4 h-4 text-[#FF7A59]" /> Solicitar Retiro
            </button>
          </div>
        </div>

        {/* Deferred KYC Alert Bar */}
        <div className="mt-5 pt-4 border-t border-[#143426] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {kycRecord.status === 'verified' ? (
              <span className="flex items-center gap-1 text-[#7AC492] font-semibold">
                <ShieldCheck className="w-4 h-4" /> KYC Verificado (Cédula de Ciudadanía aprobada)
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[#E6BE55] font-semibold">
                <AlertTriangle className="w-4 h-4" /> KYC Diferido Activo (Juega y deposita sin fricción; verificación solo al retirar)
              </span>
            )}
          </div>

          <button
            onClick={() => setShowKYCModal(true)}
            className="text-xs text-[#54C3BB] hover:underline font-mono cursor-pointer"
          >
            {kycRecord.status === 'verified' ? 'Ver Datos de Identidad' : 'Completar Verificación KYC Ahora →'}
          </button>
        </div>
      </div>

      {/* TOKEN PURCHASE PACKAGES ($9.900 to $149.900 COP) */}
      <div id="token-packages-section" className="bg-[#0C1D16] border border-[#143426] rounded-3xl p-5 shadow-lg space-y-4">
        <div>
          <h3 className="font-display text-xl font-bold text-white tracking-wide">
            Paquetes de Tokens Disponibles
          </h3>
          <p className="text-xs text-[#C9F04D] font-mono mt-0.5">
            Cada 1 token $DT vale 1 peso - el cambio es uno a uno (1 $DT = $1 COP). Tarifas oficiales en Pesos Colombianos con entrega instantánea a través de la Red de Agentes Master DT.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {TOKEN_PACKAGES.map((pkg) => {
            const isSelected = !isCustomVIP && selectedPackage?.id === pkg.id;
            return (
              <div
                key={pkg.id}
                onClick={() => {
                  setSelectedPackage(pkg);
                  setIsCustomVIP(false);
                }}
                className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between text-center relative ${
                  isSelected
                    ? 'bg-[#153827] border-[#C9F04D] ring-2 ring-[#C9F04D]/30 shadow-lg'
                    : 'bg-[#0F2319] border-[#143426] hover:border-gray-600'
                }`}
              >
                {pkg.badge && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.2 rounded-full text-[9px] font-bold font-mono bg-[#E6BE55] text-[#071410] uppercase shadow">
                    {pkg.badge}
                  </span>
                )}

                <div>
                  <span className="font-mono text-2xl font-black text-white block mt-1">
                    {pkg.tokens.toLocaleString('es-CO')} DT
                  </span>
                  {pkg.bonusTokens && (
                    <span className="text-[10px] font-mono text-[#C9F04D] font-bold block">
                      +{pkg.bonusTokens.toLocaleString('es-CO')} DT Bonus
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-[#143426]/60">
                  <span className="font-mono font-bold text-sm text-[#E6BE55] block">
                    {formatCOP(pkg.priceCOP)}
                  </span>
                  <span className="text-[9px] text-gray-400 font-mono">COP</span>
                </div>
              </div>
            );
          })}

          {/* Opcion Otra / VIP (> $150.000 COP) */}
          <div
            onClick={() => setIsCustomVIP(true)}
            className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between text-center relative ${
              isCustomVIP
                ? 'bg-[#1e1a0b] border-[#E6BE55] ring-2 ring-[#E6BE55]/40 shadow-xl'
                : 'bg-[#0F2319] border-[#E6BE55]/30 hover:border-[#E6BE55]'
            }`}
          >
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.2 rounded-full text-[9px] font-bold font-mono bg-[#FF7A59] text-white uppercase shadow">
              VIP HIGH ROLLER
            </span>

            <div>
              <span className="font-mono text-xl sm:text-2xl font-black text-[#E6BE55] block mt-1">
                Otra / VIP
              </span>
              <span className="text-[10px] font-mono text-[#C9F04D] font-bold block">
                +35% Bonus VIP
              </span>
            </div>

            <div className="mt-3 pt-2 border-t border-[#E6BE55]/30">
              <span className="font-mono font-bold text-xs text-[#E6BE55] block">
                &gt; $150.000
              </span>
              <span className="text-[9px] text-gray-400 font-mono">COP Personalizado</span>
            </div>
          </div>
        </div>

        {/* Custom VIP Amount Box if isCustomVIP */}
        {isCustomVIP && (
          <div className="p-4 rounded-2xl bg-[#091812] border border-[#E6BE55]/50 space-y-3 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono font-bold text-[#E6BE55] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#E6BE55]" /> Carga VIP Personalizada (&gt; $150.000 COP)
                </span>
                <p className="text-[11px] text-gray-400">
                  Ingresa cualquier monto superior a $150.000 COP. Incluye +35% de tokens bonus y atención directa de tu agente.
                </p>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[200000, 500000, 1000000, 2000000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCustomAmountCOP(amt)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer ${
                      customAmountCOP === amt
                        ? 'bg-[#E6BE55] text-[#071410]'
                        : 'bg-[#0F2319] text-gray-300 border border-[#143426] hover:border-[#E6BE55]'
                    }`}
                  >
                    ${(amt / 1000).toLocaleString('es-CO')}k
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div>
                <label className="text-[11px] text-gray-400 font-mono block mb-1">
                  Monto en COP (Mínimo $150.000):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm">$</span>
                  <input
                    type="number"
                    min={150000}
                    step={10000}
                    value={customAmountCOP}
                    onChange={(e) => setCustomAmountCOP(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-[#071410] border border-[#1E4333] focus:border-[#E6BE55] text-white font-mono font-bold text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-[#071410] p-2.5 rounded-xl border border-[#143426] font-mono text-xs">
                <span className="text-gray-400 block text-[10px] uppercase">Cálculo de Tokens DT (1:1):</span>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="text-gray-300">Base: {Math.floor(customAmountCOP).toLocaleString('es-CO')} DT</span>
                  <span className="text-[#C9F04D] font-bold">
                    +{Math.floor(customAmountCOP * 0.35).toLocaleString('es-CO')} DT Bonus
                  </span>
                </div>
              </div>

              <div className="bg-[#0C1D16] p-2.5 rounded-xl border border-[#E6BE55]/40 font-mono text-center">
                <span className="text-[10px] text-gray-400 uppercase block">Total a Recibir:</span>
                <span className="text-xl font-black text-[#E6BE55] block">
                  {(Math.floor(customAmountCOP) + Math.floor(customAmountCOP * 0.35)).toLocaleString('es-CO')} DT
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Methods Options */}
        <div className="pt-3 border-t border-[#143426] space-y-2.5">
          <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
            Selecciona tu Método de Pago en Colombia (Modelo ClubGG Agente):
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['Nequi', 'Daviplata', 'Bancolombia', 'Efecty / Cash'] as PaymentMethod[]).map((m) => (
              <button
                key={m}
                onClick={() => setPaymentMethod(m)}
                className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  paymentMethod === m
                    ? 'bg-[#E6BE55] text-[#071410] border-[#E6BE55]'
                    : 'bg-[#0F2319] text-gray-300 border-[#143426] hover:border-gray-600'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{m}</span>
              </button>
            ))}
          </div>

          {/* Action Row */}
          <div className="p-3 rounded-xl bg-[#14281E]/60 border border-[#234D35] flex items-center justify-between text-xs mb-1">
            <span className="text-[11px] font-mono text-[#C9F04D] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Modo BETA Freemium: Las recargas con dinero real están temporalmente desactivadas.</span>
            </span>
          </div>

          {isCustomVIP ? (
            <div className="p-3.5 rounded-xl bg-[#071410] border border-[#E6BE55]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-white font-bold block text-sm">
                  Recarga VIP: {(Math.floor(customAmountCOP) + Math.floor(customAmountCOP * 0.35)).toLocaleString('es-CO')} DT por {formatCOP(customAmountCOP)} vía {paymentMethod}
                </span>
                <span className="text-gray-400 text-[11px]">
                  Canalizado con prioridad VIP a través de la Red de Agentes Oficiales Master DT.
                </span>
              </div>
              <button
                disabled={true}
                title="Recargas desactivadas en esta prueba BETA Freemium"
                className="px-5 py-2.5 rounded-xl font-mono font-bold text-xs bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed shrink-0"
              >
                Confirmar Recarga VIP (Desactivado en BETA)
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-[#071410] border border-[#143426] flex items-center justify-between text-xs">
              <div>
                <span className="text-gray-300 font-bold block">
                  Comprar {selectedPackage.tokens} DT por {formatCOP(selectedPackage.priceCOP)} vía {paymentMethod}
                </span>
                <span className="text-gray-500 text-[11px]">
                  Pago canalizado a través del agente oficial más cercano en tu ciudad con comprobante seguro.
                </span>
              </div>
              <button
                disabled={true}
                title="Recargas desactivadas en esta prueba BETA Freemium"
                className="px-4 py-2 rounded-xl bg-gray-800 text-gray-500 font-mono font-bold text-xs border border-gray-700 cursor-not-allowed shrink-0"
              >
                Confirmar Recarga (Desactivado en BETA)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* WITHDRAWAL MODAL */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#0C1D16] border border-[#54C3BB]/50 p-6 shadow-2xl text-left">
            <h3 className="font-display text-xl font-bold text-white tracking-wide">
              Solicitud de Retiro de Fondos
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Tu identidad KYC ha sido verificada. Ingresa la cantidad de tokens que deseas transferir a tu cuenta bancaria o Nequi.
            </p>

            <div className="my-4 space-y-3 font-mono text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Cantidad de Tokens a Retirar (Saldo: {userTokens} DT)</label>
                <input
                  type="number"
                  min={10}
                  max={userTokens}
                  value={withdrawTokens}
                  onChange={(e) => setWithdrawTokens(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2319] border border-[#1E4333] text-white font-bold text-sm"
                />
                <span className="text-[11px] text-[#54C3BB] mt-1 block">
                  Equivalente en COP: ${((withdrawTokens || 0)).toLocaleString('es-CO')} COP (1 $DT = $1 COP)
                </span>
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Cuenta de Destino (Nequi / Daviplata / Banco)</label>
                <input
                  type="text"
                  value={withdrawDestination}
                  onChange={(e) => setWithdrawDestination(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2319] border border-[#1E4333] text-white text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#0F2319] text-gray-300 font-mono text-xs hover:bg-[#143426] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={submitWithdrawal}
                className="flex-1 py-2.5 rounded-xl bg-[#C9F04D] text-[#071410] font-mono font-bold text-xs hover:bg-[#D5F565] cursor-pointer"
              >
                Procesar Retiro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KYC MODAL (DEFERRED KYC FLOW) */}
      {showKYCModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#0C1D16] border border-[#E6BE55]/50 p-6 shadow-2xl text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-[#E6BE55]" />
              <h3 className="font-display text-xl font-bold text-white tracking-wide">
                Verificación de Identidad KYC (Requerido para Retiros)
              </h3>
            </div>
            <p className="text-xs text-gray-300 mb-4">
              Cumpliendo con la normativa colombiana de juegos de destreza y prevención de fraudes,
              los retiros de fondos requieren validar tu Cédula de Ciudadanía y cuenta bancaria titular.
            </p>

            <form onSubmit={handleSaveKYC} className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-400 block mb-1">Tipo de Documento</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F2319] border border-[#1E4333] text-white"
                  >
                    <option value="CC">Cédula de Ciudadanía (CC)</option>
                    <option value="CE">Cédula de Extranjería (CE)</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Número de Documento</label>
                  <input
                    type="text"
                    required
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder="1.032.482.910"
                    className="w-full px-3 py-2 rounded-xl bg-[#0F2319] border border-[#1E4333] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Nombre Completo (Como figura en documento)</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Carlos Andrés Montoya Restrepo"
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2319] border border-[#1E4333] text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-400 block mb-1">Banco / Billetera</label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Bancolombia / Nequi"
                    className="w-full px-3 py-2 rounded-xl bg-[#0F2319] border border-[#1E4333] text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Número de Cuenta / Teléfono</label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="312 849 2011"
                    className="w-full px-3 py-2 rounded-xl bg-[#0F2319] border border-[#1E4333] text-white"
                  />
                </div>
              </div>

              {/* Document Photo Upload Simulation */}
              <div className="p-3 rounded-xl bg-[#071410] border border-[#143426] space-y-2">
                <span className="text-gray-300 font-bold block">Documento de Identidad (Fotos)</span>
                <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
                  <div className="p-3 rounded-xl border border-dashed border-[#54C3BB]/50 bg-[#0F2319] text-[#54C3BB] flex flex-col items-center gap-1 cursor-pointer hover:border-[#C9F04D]">
                    <Upload className="w-4 h-4" />
                    <span>Frente Cédula ✓</span>
                  </div>
                  <div className="p-3 rounded-xl border border-dashed border-[#54C3BB]/50 bg-[#0F2319] text-[#54C3BB] flex flex-col items-center gap-1 cursor-pointer hover:border-[#C9F04D]">
                    <Upload className="w-4 h-4" />
                    <span>Reverso Cédula ✓</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKYCModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#0F2319] text-gray-300 font-mono text-xs hover:bg-[#143426] cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#E6BE55] text-[#071410] font-mono font-bold text-xs hover:bg-[#F2CE6E] cursor-pointer"
                >
                  Validar y Guardar KYC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
