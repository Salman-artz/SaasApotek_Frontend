"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer, X, Receipt, CheckCircle2, Share2, Send } from "lucide-react";

export interface ReceiptItem {
  id?: string;
  productName: string;
  productSku?: string | null;
  unitName: string;
  quantity: number;
  unitPrice: number | string;
  discountPerItem?: number | string;
  subtotal: number | string;
  isRacikan?: boolean;
  racikanName?: string | null;
  signa?: string | null;
}

export interface ReceiptData {
  id?: string;
  invoiceCode: string;
  outletName: string;
  outletAddress?: string | null;
  outletPhone?: string | null;
  outletSia?: string | null;
  outletSipa?: string | null;
  cashierName: string;
  customerName?: string | null;
  customerPhone?: string | null;
  doctorName?: string | null;
  prescriptionNumber?: string | null;
  isPrescription?: boolean;
  tuslahFee?: number | string;
  totalSubtotal: number | string;
  discountAmount?: number | string;
  taxAmount?: number | string;
  grandTotal: number | string;
  paidAmount: number | string;
  changeAmount: number | string;
  paymentMethod: string;
  createdAt: string;
  items: ReceiptItem[];
}

interface Props {
  data: ReceiptData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PosReceiptModal({ data, isOpen, onClose }: Props) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !data) return null;

  const formatRupiah = (num: number | string) => {
    const val = typeof num === "string" ? parseFloat(num) : num;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handlePrint = () => {
    const printContents = receiptRef.current?.innerHTML;
    if (!printContents) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Struk Pembayaran - ${data.invoiceCode}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 4mm;
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: 11px;
              color: #000;
              line-height: 1.3;
              margin: 0;
              padding: 4px;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-left { text-align: left; }
            .font-bold { font-weight: bold; }
            .divider {
              border-top: 1px dashed #000;
              margin: 6px 0;
            }
            .double-divider {
              border-top: 2px dashed #000;
              margin: 6px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
            }
            th, td {
              padding: 2px 0;
            }
            .signa-text {
              font-style: italic;
              font-size: 10px;
              padding-left: 8px;
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full flex flex-col max-h-[90vh] overflow-hidden border border-gray-100 dark:border-gray-700">
        {/* Header Modal Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Struk Transaksi POS
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Paper View (Thermal 80mm preview) */}
        <div className="flex-1 overflow-y-auto p-5 bg-gray-100 dark:bg-gray-900">
          <div
            ref={receiptRef}
            className="bg-white text-gray-900 p-4 rounded shadow-sm font-mono text-[11px] leading-relaxed border border-gray-200"
          >
            {/* Header Apotek */}
            <div className="text-center">
              <h2 className="text-xs font-black uppercase tracking-wider">
                {data.outletName || "APOTEK DIGITAL"}
              </h2>
              <p className="text-[10px] text-gray-700 mt-0.5">{data.outletAddress || "Alamat Outlet Apotek"}</p>
              <p className="text-[10px] text-gray-600">Telp: {data.outletPhone || "-"}</p>
              {data.outletSia && <p className="text-[9px] text-gray-500">SIA: {data.outletSia}</p>}
              {data.outletSipa && <p className="text-[9px] text-gray-500">SIPA: {data.outletSipa}</p>}
            </div>

            <div className="border-t border-dashed border-gray-400 my-2"></div>

            {/* Info Transaksi */}
            <div className="text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>No. Struk:</span>
                <span className="font-bold">{data.invoiceCode}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal:</span>
                <span>
                  {new Date(data.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>{data.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span>Pelanggan:</span>
                <span>{data.customerName || "Umum"}</span>
              </div>
              {data.isPrescription && (
                <div className="pt-0.5 border-t border-dotted border-gray-300">
                  <div className="flex justify-between font-bold text-emerald-700">
                    <span>Layanan:</span>
                    <span>Resep Dokter</span>
                  </div>
                  {data.doctorName && (
                    <div className="flex justify-between">
                      <span>Dokter:</span>
                      <span>{data.doctorName}</span>
                    </div>
                  )}
                  {data.prescriptionNumber && (
                    <div className="flex justify-between">
                      <span>No. Resep:</span>
                      <span>{data.prescriptionNumber}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-dashed border-gray-400 my-2"></div>

            {/* Items Table */}
            <div className="space-y-1.5 text-[11px]">
              {data.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-semibold">
                    <span className="truncate max-w-[170px]">
                      {item.productName}
                      {item.isRacikan && ` (${item.racikanName || "Racikan"})`}
                    </span>
                    <span>{formatRupiah(item.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-600 pl-2">
                    <span>
                      {item.quantity} {item.unitName} x {formatRupiah(item.unitPrice)}
                    </span>
                    {Number(item.discountPerItem || 0) > 0 && (
                      <span className="text-red-500">Disc -{formatRupiah(item.discountPerItem || 0)}</span>
                    )}
                  </div>
                  {item.signa && (
                    <div className="text-[10px] text-emerald-700 font-semibold italic pl-2">
                      S: {item.signa}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-gray-400 my-2"></div>

            {/* Totals Calculation */}
            <div className="space-y-0.5 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatRupiah(data.totalSubtotal)}</span>
              </div>
              {Number(data.tuslahFee || 0) > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Tuslah / Jasa Racik:</span>
                  <span>{formatRupiah(data.tuslahFee || 0)}</span>
                </div>
              )}
              {Number(data.discountAmount || 0) > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Diskon:</span>
                  <span>-{formatRupiah(data.discountAmount || 0)}</span>
                </div>
              )}
              {Number(data.taxAmount || 0) > 0 && (
                <div className="flex justify-between">
                  <span>PPN:</span>
                  <span>{formatRupiah(data.taxAmount || 0)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-xs border-t border-gray-400 pt-1 mt-1">
                <span>GRAND TOTAL:</span>
                <span>{formatRupiah(data.grandTotal)}</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span>Metode Bayar:</span>
                <span className="uppercase font-bold">{data.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Uang Diterima:</span>
                <span>{formatRupiah(data.paidAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700">
                <span>Kembalian:</span>
                <span>{formatRupiah(data.changeAmount)}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-400 my-2"></div>

            {/* Footer Message */}
            <div className="text-center text-[10px] text-gray-600 space-y-0.5">
              <p className="font-bold">Semoga Lekas Sembuh</p>
              <p>Terima kasih atas kunjungan Anda</p>
              <p className="text-[8px] text-gray-400 pt-1">
                Barang yang sudah dibeli tidak dapat ditukar/dikembalikan kecuali ada perjanjian sebelumnya.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Tutup
          </Button>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                const phone = (data.customerPhone || "").replace(/\D/g, "");
                let targetPhone = phone;
                if (targetPhone.startsWith("0")) targetPhone = "62" + targetPhone.slice(1);
                else if (targetPhone.startsWith("8")) targetPhone = "62" + targetPhone;

                let msg = `🏥 *STRUK PEMBELIAN DIGITAL — ${(data.outletName || "APOTEK DIGITAL").toUpperCase()}*\n`;
                if (data.outletAddress) msg += `📍 ${data.outletAddress}\n`;
                msg += `-------------------------------------------\n`;
                msg += `🧾 *No. Faktur:* ${data.invoiceCode}\n`;
                msg += `📅 *Tanggal:* ${new Date(data.createdAt).toLocaleString("id-ID")}\n`;
                msg += `👤 *Pelanggan:* ${data.customerName || "Pelanggan Umum"}\n`;
                if (data.isPrescription && data.doctorName) {
                  msg += `🩺 *Dokter:* ${data.doctorName} (No. Resep: ${data.prescriptionNumber || "-"})\n`;
                }
                msg += `💳 *Pembayaran:* ${data.paymentMethod}\n`;
                msg += `-------------------------------------------\n*DAFTAR OBAT:*\n`;
                data.items.forEach((it, i) => {
                  msg += `${i + 1}. *${it.productName}*\n`;
                  msg += `   ${it.quantity} ${it.unitName} = *Rp ${Number(it.subtotal).toLocaleString("id-ID")}*\n`;
                  if (it.signa) msg += `   💊 _Signa: ${it.signa}_\n`;
                });
                msg += `-------------------------------------------\n`;
                if (Number(data.discountAmount || 0) > 0) {
                  msg += `Diskon: -Rp ${Number(data.discountAmount).toLocaleString("id-ID")}\n`;
                }
                msg += `*TOTAL BAYAR: Rp ${Number(data.grandTotal).toLocaleString("id-ID")}*\n`;
                msg += `-------------------------------------------\n`;
                msg += `🙏 *Terima kasih telah berbelanja di apotek kami. Semoga lekas sembuh!*\n`;

                const url = targetPhone
                  ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`
                  : `https://wa.me/?text=${encodeURIComponent(msg)}`;
                window.open(url, "_blank");
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              Kirim WA
            </Button>

            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Struk
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
