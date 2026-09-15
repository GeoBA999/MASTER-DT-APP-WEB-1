import React, { useState } from 'react';
import {
  Users,
  Shield,
  Coins,
  PlusCircle,
  FileCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Database,
  Lock,
} from 'lucide-react';
import { AgentTransaction, PaymentMethod, KYCRecord } from '../types';
import { INITIAL_AGENT_TRANSACTIONS } from '../data/mockFootballData';
import { formatCOP } from '../utils/scoring';

interface AgentPortalProps {
  transactions: AgentTransaction[];
  onMintTokens: (newTx: Omit<AgentTransaction, 'id' | 'timestamp'>) => void;
  kycRecord: KYCRecord;
  onApproveKYC: () => void;
  onRejectKYC: (reason: string) => void;
}

export const AgentPortal: React.FC<AgentPortalProps> = ({
  transactions,
  onMintTokens,
  kycRecord,
  onApproveKYC,
  onRejectKYC,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'mint' | 'audit' | 'kyc'>('mint');

  // Minting form state
  const [targetUserId, setTargetUserId] = useState('usr-user-me');
  const [targetUserName, setTargetUserName] = useState('Mi Usuario DT');
  const [targetUserPhone, setTargetUserPhone] = useState('312 849 2011');
  const [tokenAmount, setTokenAmount] = useState<number>(55);
  const [copAmount, setCopAmount] = useState<number>(49900);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Nequi');
  const [referenceCode, setReferenceCode] = useState(`NEQ-${Math.floor(10000000 + Math.random() * 90000000)}`);
  const [notes, setNotes] = useState('Pago verificado por comprobante Nequi QR');

  // Audit filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('all');

  const handleMintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onMintTokens({
      userId: targetUserId,
      userName: targetUserName,
      userPhone: targetUserPhone,
      amountTokens: Number(tokenAmount),
      amountCOP: Number(copAmount),
      method: paymentMethod,
      referenceCode,
      agentId: 'agt-col-01',
      agentName: 'Agente Oficial Medellín / Bogotá',
      status: 'approved',
      notes,
      type: 'deposit',
    });

    // Reset reference
    setReferenceCode(`REF-${Math.floor(10000000 + Math.random() * 90000000)}`);
    alert(`¡Éxito! Se han minteado y acreditado ${tokenAmount} DT Tokens al usuario ${targetUserName}. Registro guardado en el log inmutable.`);
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filterMethod !== 'all' && tx.method !== filterMethod) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        tx.userName.toLowerCase().includes(q) ||
        tx.referenceCode.toLowerCase().includes(q) ||
        tx.userId.toLowerCase().includes(q) ||
        tx.userPhone.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5 text-left">
      {/* Agent Header Hero */}
      <div className="bg-[#0C1D16] border border-[#7AC492]/40 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#7AC492]/20 text-[#7AC492] border border-[#7AC492]/40 uppercase">
              Modelo ClubGG Agent Network
            </span>
            <span className="text-xs text-gray-400 font-mono">Agencia ID: agt-col-01</span>
          </div>
          <h2 className="font-display text-2xl font-black text-white tracking-wide mt-1">
            Portal de Administración de Agentes Master DT
          </h2>
          <p className="text-xs text-gray-300 mt-0.5">
            Recaudación externa de fondos (Nequi, Daviplata, Bancolombia, Efectivo), minteo directo de tokens y auditoría inmutable de transacciones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-2 rounded-2xl bg-[#071410] border border-[#143426] font-mono text-xs">
            <span className="text-gray-400 block text-[10px]">Total Operaciones</span>
            <span className="font-bold text-white text-sm">{transactions.length} Transacciones</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0C1D16] border border-[#143426]">
        <button
          onClick={() => setActiveSubTab('mint')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
            activeSubTab === 'mint'
              ? 'bg-[#7AC492] text-[#071410] font-bold shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Mintear & Acreditar Tokens</span>
        </button>

        <button
          onClick={() => setActiveSubTab('audit')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
            activeSubTab === 'audit'
              ? 'bg-[#E6BE55] text-[#071410] font-bold shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Log Inmutable de Auditoría ({transactions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('kyc')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
            activeSubTab === 'kyc'
              ? 'bg-[#54C3BB] text-[#071410] font-bold shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Revisión KYC Diferido</span>
        </button>
      </div>

      {/* SUBTAB 1: MINTING & CREDITING WALLET */}
      {activeSubTab === 'mint' && (
        <div className="bg-[#0C1D16] border border-[#143426] rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#143426] mb-4">
            <div>
              <h3 className="font-display text-lg font-bold text-white tracking-wide">
                Cargar Saldo Manual a Usuario (Minteo de Tokens)
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                Registra la recepción de dinero fuera de la app y acredita de inmediato la billetera del usuario.
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#C9F04D]/20 text-[#C9F04D]">
              Emisión Autorizada
            </span>
          </div>

          <form onSubmit={handleMintSubmit} className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-gray-400 block mb-1">ID Usuario / Teléfono</label>
                <input
                  type="text"
                  required
                  value={targetUserPhone}
                  onChange={(e) => setTargetUserPhone(e.target.value)}
                  placeholder="312 849 2011"
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2319] border border-[#1E4333] text-white"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Nombre Completo DT</label>
                <input
                  type="text"
                  required
                  value={targetUserName}
                  onChange={(e) => setTargetUserName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2319] border border-[#1E4333] text-white"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Método de Recaudo Externo</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2319] border border-[#1E4333] text-white"
                >
                  <option value="Nequi">Nequi (Transferencia/QR)</option>
                  <option value="Daviplata">Daviplata</option>
                  <option value="Bancolombia">Bancolombia App</option>
                  <option value="Efecty / Cash">Efecty / Efectivo Físico</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-gray-400 block mb-1">Tokens a Mintear (DT)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={tokenAmount}
                  onChange={(e) => {
                    const t = Number(e.target.value);
                    setTokenAmount(t);
                    setCopAmount(t * 1000);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2319] border border-[#1E4333] text-white font-bold text-sm"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Monto Recaudado en COP</label>
                <input
                  type="number"
                  required
                  value={copAmount}
                  onChange={(e) => setCopAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2319] border border-[#1E4333] text-[#E6BE55] font-bold text-sm"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Código de Referencia / Comprobante</label>
                <input
                  type="text"
                  required
                  value={referenceCode}
                  onChange={(e) => setReferenceCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2319] border border-[#1E4333] text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-400 block mb-1">Notas de Auditoría del Agente</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Comprobante revisado en terminal Nequi..."
                className="w-full px-3 py-2 rounded-xl bg-[#0F2319] border border-[#1E4333] text-white"
              />
            </div>

            <div className="p-3 rounded-xl bg-[#071410] border border-[#143426] flex items-center justify-between">
              <span className="text-xs text-gray-300">
                La operación se firmará criptográficamente bajo el ID de agente <strong className="text-[#7AC492]">agt-col-01</strong>.
              </span>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#7AC492] hover:bg-[#8CD8A4] text-[#071410] font-mono font-bold text-xs transition cursor-pointer active:scale-95"
              >
                Mintear y Acreditar {tokenAmount} DT ({formatCOP(copAmount)})
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUBTAB 2: IMMUTABLE AUDIT LOG */}
      {activeSubTab === 'audit' && (
        <div className="bg-[#0C1D16] border border-[#143426] rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#143426]">
            <div>
              <h3 className="font-display text-lg font-bold text-white tracking-wide">
                Registro Inmutable de Transacciones de Agentes
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                Historial trazable de todas las cargas manuales, método de pago, fecha/hora y usuario receptor.
              </p>
            </div>

            {/* Filter toolbar */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar usuario o ref..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-[#0F2319] border border-[#1E4333] text-xs text-white placeholder-gray-500 focus:outline-none"
                />
              </div>

              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-[#0F2319] border border-[#1E4333] text-xs text-gray-200 focus:outline-none"
              >
                <option value="all">Todos los Métodos</option>
                <option value="Nequi">Nequi</option>
                <option value="Daviplata">Daviplata</option>
                <option value="Bancolombia">Bancolombia</option>
                <option value="Efecty / Cash">Efecty / Cash</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs divide-y divide-[#143426]">
              <thead>
                <tr className="text-gray-400 text-[11px] uppercase">
                  <th className="py-2.5 px-3">Fecha / ID</th>
                  <th className="py-2.5 px-3">Usuario</th>
                  <th className="py-2.5 px-3">Tokens / COP</th>
                  <th className="py-2.5 px-3">Método / Ref</th>
                  <th className="py-2.5 px-3">Agente</th>
                  <th className="py-2.5 px-3 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#143426]/50">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#0F2319]/60 transition">
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-white block">{tx.timestamp}</span>
                      <span className="text-[10px] text-gray-500">{tx.id}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-gray-200 block">{tx.userName}</span>
                      <span className="text-[10px] text-gray-400">{tx.userPhone}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        {tx.type === 'deposit' ? (
                          <ArrowDownLeft className="w-3.5 h-3.5 text-[#C9F04D]" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#FF7A59]" />
                        )}
                        <span className="font-bold text-[#E6BE55]">{tx.amountTokens} DT</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{formatCOP(tx.amountCOP)}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#071410] border border-[#143426] text-[#54C3BB]">
                        {tx.method}
                      </span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">{tx.referenceCode}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-gray-300 block">{tx.agentName}</span>
                      <span className="text-[10px] text-gray-500">{tx.notes}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#7AC492]/20 text-[#7AC492] border border-[#7AC492]/30">
                        {tx.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: DEFERRED KYC REVIEW */}
      {activeSubTab === 'kyc' && (
        <div className="bg-[#0C1D16] border border-[#143426] rounded-3xl p-5 shadow-xl space-y-4">
          <div className="pb-3 border-b border-[#143426]">
            <h3 className="font-display text-lg font-bold text-white tracking-wide">
              Revisión de Solicitudes KYC (Verificación de Retiros)
            </h3>
            <p className="text-xs text-gray-400 font-mono">
              Los usuarios juegan sin barreras. Solo se valida la identidad al tramitar retiros de fondos reales.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F2319] border border-[#143426] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm font-mono">
                  {kycRecord.fullName || 'Carlos Andrés Montoya Restrepo'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#E6BE55]/20 text-[#E6BE55] border border-[#E6BE55]/40">
                  {kycRecord.documentType}: {kycRecord.documentNumber || '1.032.482.910'}
                </span>
              </div>
              <div className="text-xs text-gray-400 font-mono">
                <span>Tel: {kycRecord.phone || '312 849 2011'}</span> •{' '}
                <span>Cuenta: {kycRecord.bankName} - {kycRecord.accountNumber}</span>
              </div>
              <div className="text-[11px] text-[#54C3BB] font-mono">
                Documentos adjuntos: Frente Cédula (OK), Reverso Cédula (OK)
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono">
              <button
                onClick={() => onRejectKYC('Foto borrosa o no coincide')}
                className="px-3 py-1.5 rounded-xl bg-[#FF7A59]/20 text-[#FF7A59] border border-[#FF7A59]/40 hover:bg-[#FF7A59]/30 text-xs font-bold transition cursor-pointer"
              >
                Rechazar
              </button>
              <button
                onClick={onApproveKYC}
                className="px-4 py-1.5 rounded-xl bg-[#7AC492] hover:bg-[#8CD8A4] text-[#071410] text-xs font-bold transition cursor-pointer shadow"
              >
                Aprobar KYC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
