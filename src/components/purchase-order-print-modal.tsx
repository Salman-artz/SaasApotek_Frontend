"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer, X, FileText, CheckCircle2, Shield } from "lucide-react";

export interface PurchaseOrderItemPrint {
  id: string;
  productName: string;
  genericName?: string | null;
  quantity: number;
  unitName: string;
  dosageForm?: string | null;
  strength?: string | null;
  notes?: string | null;
}

export interface PurchaseOrderPrintData {
  id: string;
  orderNumber: string;
  orderType: "REGULAR" | "PRECURSOR" | "OOT" | "PSYCHOTROPIC" | "NARCOTIC";
  orderDate: string;
  status: string;
  apaName?: string | null;
  apaSipa?: string | null;
  notes?: string | null;
  outletName: string;
  outletAddress?: string | null;
  outletPhone?: string | null;
  outletSia?: string | null;
  outletSipa?: string | null;
  supplierName: string;
  supplierPhone?: string | null;
  supplierAddress?: string | null;
  items: PurchaseOrderItemPrint[];
}

interface Props {
  data: PurchaseOrderPrintData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PurchaseOrderPrintModal({ data, isOpen, onClose }: Props) {
  const printContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !data) return null;

  const handlePrint = () => {
    const printContents = printContentRef.current?.innerHTML;
    if (!printContents) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Surat Pesanan - ${data.orderNumber}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm 20mm;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              color: #111;
              line-height: 1.4;
              padding: 0;
              margin: 0;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 8px;
              margin-bottom: 16px;
            }
            .header h1 {
              margin: 0 0 4px 0;
              font-size: 16px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .header p {
              margin: 2px 0;
              font-size: 11px;
            }
            .title {
              text-align: center;
              margin: 12px 0 16px 0;
            }
            .title h2 {
              margin: 0;
              font-size: 14px;
              text-decoration: underline;
              text-transform: uppercase;
            }
            .title p {
              margin: 4px 0 0 0;
              font-size: 11px;
              font-weight: bold;
            }
            .recipient {
              margin-bottom: 16px;
              font-size: 12px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 16px 0;
              font-size: 11px;
            }
            th, td {
              border: 1px solid #333;
              padding: 6px 8px;
            }
            th {
              background-color: #f0f0f0;
              text-align: center;
              font-weight: bold;
            }
            .footer-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              margin-top: 32px;
              page-break-inside: avoid;
            }
            .sig-box {
              text-align: center;
            }
            .sig-space {
              height: 70px;
            }
            .sig-name {
              font-weight: bold;
              text-decoration: underline;
            }
            .badge-narc {
              color: #b91c1c;
              font-weight: bold;
              border: 1px solid #b91c1c;
              padding: 2px 6px;
              display: inline-block;
              margin-bottom: 4px;
              font-size: 10px;
            }
          </style>
        </head>
        <body>
          ${printContents}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getOrderTitle = (type: string) => {
    switch (type) {
      case "NARCOTIC":
        return "SURAT PESANAN NARKOTIKA";
      case "PSYCHOTROPIC":
        return "SURAT PESANAN PSIKOTROPIKA";
      case "PRECURSOR":
        return "SURAT PESANAN OBAT MENGANDUNG PREKURSOR FARMASI";
      case "OOT":
        return "SURAT PESANAN OBAT-OBAT TERTENTU (OOT)";
      default:
        return "SURAT PESANAN OBAT";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col max-h-[90vh] overflow-hidden border border-gray-100 dark:border-gray-700">
        {/* Header Modal Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg text-emerald-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Pratinjau Surat Pesanan (SP) Resmi
              </h2>
              <p className="text-xs text-gray-500 font-mono">
                No. SP: {data.orderNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Cetak Dokumen SP
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content View */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-100 dark:bg-gray-900">
          <div
            ref={printContentRef}
            className="bg-white text-gray-900 p-8 rounded-lg shadow-sm border border-gray-200 max-w-2xl mx-auto text-xs font-sans leading-relaxed"
          >
            {/* Header Apotek */}
            <div className="text-center border-b-2 border-black pb-3 mb-4">
              <h1 className="text-base font-black uppercase tracking-wider">
                {data.outletName || "APOTEK DIGITAL INDONESIA"}
              </h1>
              <p className="text-[11px] text-gray-700 mt-0.5">
                {data.outletAddress || "Alamat Outlet Apotek"}
              </p>
              <div className="flex items-center justify-center gap-4 text-[10px] text-gray-600 font-semibold mt-1">
                <span>No. SIA: {data.outletSia || "445/SIA/2026/001"}</span>
                <span>•</span>
                <span>Telp: {data.outletPhone || "-"}</span>
              </div>
            </div>

            {/* Judul Dokumen SP */}
            <div className="text-center my-4">
              {data.orderType !== "REGULAR" && (
                <div className="inline-block border border-red-600 text-red-600 px-2 py-0.5 font-bold text-[10px] uppercase mb-1 rounded">
                  Format Khusus BPOM RI
                </div>
              )}
              <h2 className="text-sm font-black underline uppercase">
                {getOrderTitle(data.orderType)}
              </h2>
              <p className="text-[11px] font-bold font-mono mt-1">
                Nomor: {data.orderNumber}
              </p>
            </div>

            {/* Penerima Pesanan (PBF) */}
            <div className="mb-4 text-[11px] leading-relaxed">
              <p>Yang bertanda tangan di bawah ini Apoteker Pengelola Apotek (APA):</p>
              <div className="grid grid-cols-3 gap-1 my-1.5 pl-3">
                <span className="text-gray-600">Nama Lengkap</span>
                <span className="col-span-2 font-bold">: {data.apaName || "Apoteker Penanggung Jawab"}</span>
                <span className="text-gray-600">Nomor SIPA</span>
                <span className="col-span-2 font-mono">: {data.apaSipa || data.outletSipa || "19940101/SIPA/2026/01"}</span>
                <span className="text-gray-600">Nama Apotek</span>
                <span className="col-span-2">: {data.outletName}</span>
                <span className="text-gray-600">Alamat Apotek</span>
                <span className="col-span-2">: {data.outletAddress || "-"}</span>
              </div>
              <p className="mt-2">
                Mengajukan pesanan obat kepada:
              </p>
              <div className="grid grid-cols-3 gap-1 my-1.5 pl-3">
                <span className="text-gray-600">Nama Distributor / PBF</span>
                <span className="col-span-2 font-bold">: {data.supplierName}</span>
                <span className="text-gray-600">Alamat PBF</span>
                <span className="col-span-2">: {data.supplierAddress || "-"}</span>
                <span className="text-gray-600">Telepon</span>
                <span className="col-span-2">: {data.supplierPhone || "-"}</span>
              </div>
              <p className="mt-2">Dengan rincian daftar obat sebagai berikut:</p>
            </div>

            {/* Tabel Obat Pesanan */}
            <table className="w-full border-collapse border border-gray-400 text-[11px] my-3">
              <thead>
                <tr className="bg-gray-100 text-center font-bold">
                  <th className="border border-gray-400 p-2 w-8">No</th>
                  <th className="border border-gray-400 p-2 text-left">Nama Obat / Zat Aktif</th>
                  <th className="border border-gray-400 p-2 w-24">Bentuk Sediaan</th>
                  <th className="border border-gray-400 p-2 w-20">Kekuatan</th>
                  <th className="border border-gray-400 p-2 w-16">Jumlah</th>
                  <th className="border border-gray-400 p-2 w-20">Satuan</th>
                  <th className="border border-gray-400 p-2 text-left">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="border border-gray-400 p-2 text-center">{idx + 1}</td>
                    <td className="border border-gray-400 p-2 font-semibold">
                      {item.productName}
                      {item.genericName && (
                        <div className="text-[10px] text-gray-500 font-normal italic">
                          ({item.genericName})
                        </div>
                      )}
                    </td>
                    <td className="border border-gray-400 p-2 text-center">
                      {item.dosageForm || "Tablet"}
                    </td>
                    <td className="border border-gray-400 p-2 text-center">
                      {item.strength || "-"}
                    </td>
                    <td className="border border-gray-400 p-2 text-center font-black">
                      {item.quantity}
                    </td>
                    <td className="border border-gray-400 p-2 text-center">
                      {item.unitName}
                    </td>
                    <td className="border border-gray-400 p-2 text-gray-600">
                      {item.notes || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="text-[10px] text-gray-500 italic mt-1">
              * Obat pesanan tersebut akan dipergunakan untuk keperluan pelayanan kefarmasian di Apotek kami sesuai ketentuan perundang-undangan.
            </p>

            {/* Footer & Tanda Tangan */}
            <div className="grid grid-cols-2 mt-8 pt-4">
              <div></div>
              <div className="text-center">
                <p className="text-[11px]">
                  Dipesan pada tanggal:{" "}
                  <strong>
                    {new Date(data.orderDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </strong>
                </p>
                <p className="text-[11px] font-semibold mt-1">
                  Apoteker Penanggung Jawab (APA)
                </p>
                <div className="h-16 flex items-center justify-center">
                  <span className="text-[10px] text-gray-400 italic">
                    [Tanda Tangan & Cap Stempel Apotek]
                  </span>
                </div>
                <p className="font-bold underline text-[11px]">
                  ( {data.apaName || "Apoteker Pengelola Apotek"} )
                </p>
                <p className="text-[10px] font-mono text-gray-600 mt-0.5">
                  SIPA: {data.apaSipa || data.outletSipa || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Close */}
        <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
