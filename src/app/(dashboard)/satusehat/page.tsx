"use client";

import { useState, useEffect } from "react";
import {
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  Building,
  Key,
  Database,
  ShieldCheck,
  Activity,
  FileCode,
} from "lucide-react";
import { ApiClient } from "@/lib/api";

interface SatuSehatConfig {
  organizationId: string;
  clientId: string;
  environment: "SANDBOX" | "PRODUCTION";
  isConnected: boolean;
  lastSyncAt: string | null;
}

interface SatuSehatLog {
  id: string;
  resourceType: string;
  resourceId: string;
  status: string;
  responseMessage: string;
  createdAt: string;
}

export default function SatuSehatPage() {
  const [config, setConfig] = useState<SatuSehatConfig>({
    organizationId: "1000001",
    clientId: "satusehat_client_id_demo",
    environment: "SANDBOX",
    isConnected: true,
    lastSyncAt: new Date().toISOString(),
  });
  const [logs, setLogs] = useState<SatuSehatLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingConnection, setTestingConnection] = useState(false);
  const [syncingResource, setSyncingResource] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cfgRes, logsRes]: any = await Promise.all([
        ApiClient.get("/satusehat/config"),
        ApiClient.get("/satusehat/logs"),
      ]);

      if (cfgRes.data) setConfig(cfgRes.data);
      if (logsRes.data) setLogs(logsRes.data);
    } catch (err: any) {
      console.error("Gagal memuat SatuSehat:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTestConnection = async () => {
    try {
      setTestingConnection(true);
      const res: any = await ApiClient.post("/satusehat/test-connection", {});
      alert(res.message || "Koneksi ke SatuSehat Kemenkes berhasil!");
    } catch (err: any) {
      alert(err.message || "Gagal menghubungi SatuSehat server");
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res: any = await ApiClient.post("/satusehat/config", config);
      alert(res.message || "Kredensial disimpan!");
      fetchData();
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan konfigurasi");
    } finally {
      setSaving(false);
    }
  };

  const handleSyncMockDispense = async () => {
    try {
      setSyncingResource(true);
      const res: any = await ApiClient.post("/satusehat/sync-dispense", {
        drugName: "Amoxicillin 500mg Kapsul",
        kfaCode: "93001045",
        patientIhs: "P10987654321",
      });
      alert(res.message || "FHIR MedicationDispense terkirim!");
      fetchData();
    } catch (err: any) {
      alert(err.message || "Gagal sync MedicationDispense");
    } finally {
      setSyncingResource(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-900 p-6 rounded-2xl border border-teal-800 text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-teal-600/30 border border-teal-400/40 flex items-center justify-center text-teal-300 shadow-inner">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Integrasi SatuSehat Kemenkes RI</h1>
            <span className="text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Activity className="h-3 w-3" /> FHIR R4 Ready
            </span>
          </div>
          <p className="text-xs text-teal-200/80 mt-1 max-w-2xl">
            Kepatuhan Permenkes No. 24 Tahun 2022: Integrasi interoperabilitas data kefarmasian, Kamus Farmasi dan Alat Kesehatan (KFA), serta pelaporan MedicationDispense nasional.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTestConnection}
            disabled={testingConnection}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-teal-600/30 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${testingConnection ? "animate-spin" : ""}`} />
            {testingConnection ? "Menghubungkan..." : "Uji Koneksi OAuth"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Credentials Form */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-primary-container" />
                <h3 className="text-sm font-bold text-on-surface">Kredensial API SatuSehat</h3>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Terkoneksi
              </span>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-on-surface mb-1">
                  Organization ID (Fasyankes Kemenkes)
                </label>
                <input
                  type="text"
                  required
                  value={config.organizationId}
                  onChange={(e) => setConfig({ ...config, organizationId: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl font-mono text-on-surface focus:ring-2 focus:ring-primary-container focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">
                  Client ID
                </label>
                <input
                  type="text"
                  required
                  value={config.clientId}
                  onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl font-mono text-on-surface focus:ring-2 focus:ring-primary-container focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">
                  Environment
                </label>
                <select
                  value={config.environment}
                  onChange={(e: any) => setConfig({ ...config, environment: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-on-surface focus:ring-2 focus:ring-primary-container focus:outline-none"
                >
                  <option value="SANDBOX">Sandbox (Uji Coba Pengembang)</option>
                  <option value="PRODUCTION">Production (Live Kemenkes)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <span className="text-[11px] text-on-surface-variant">
                  Sinkronisasi Terakhir: {new Date(config.lastSyncAt || Date.now()).toLocaleTimeString("id-ID")}
                </span>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary-container hover:bg-blue-700 text-white rounded-xl font-semibold transition disabled:opacity-50 shadow-sm"
                >
                  {saving ? "Menyimpan..." : "Simpan Kredensial"}
                </button>
              </div>
            </form>
          </div>

          {/* Quick FHIR Dispatch test */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 text-xs text-on-surface space-y-3">
            <div className="flex items-center gap-2 font-bold text-primary-container">
              <FileCode className="h-4 w-4" />
              Pengujian Pengiriman Data Resep FHIR
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Kirimkan simulasi transaksi penyerahan obat (MedicationDispense) dengan kode Kamus Farmasi Alkes (KFA) ke server SatuSehat.
            </p>
            <button
              onClick={handleSyncMockDispense}
              disabled={syncingResource}
              className="px-4 py-2 bg-primary-container hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              {syncingResource ? "Mengirim ke FHIR Server..." : "Kirim Sampel MedicationDispense"}
            </button>
          </div>
        </div>

        {/* Audit Logs */}
        <div className="lg:col-span-6 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-primary-container" />
                <h3 className="text-sm font-bold text-on-surface">Log Interoperabilitas FHIR Kemenkes</h3>
              </div>
              <span className="text-xs text-on-surface-variant">{logs.length} Log Tercatat</span>
            </div>

            {logs.length === 0 ? (
              <div className="py-16 text-center text-on-surface-variant">
                <ShieldCheck className="h-10 w-10 text-outline-variant mx-auto mb-2" />
                <p className="text-xs font-semibold text-on-surface">Belum ada riwayat pengiriman FHIR</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  Gunakan tombol "Kirim Sampel MedicationDispense" untuk menguji aliran data.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 bg-surface-container-low border border-outline-variant/30 rounded-xl space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-on-surface font-mono">
                        {log.resourceType} / {log.resourceId}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-bold text-[10px]">
                        {log.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant">{log.responseMessage}</p>
                    <span className="text-[10px] text-on-surface-variant/70 block pt-1 border-t border-outline-variant/20">
                      Waktu: {new Date(log.createdAt).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
