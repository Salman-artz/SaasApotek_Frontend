'use client';

import React, { useState } from 'react';
import { BarcodeSVG } from './barcode-generator';
import { Button } from './ui/button';
import { Printer, X, Copy, Check, Sparkles } from 'lucide-react';

interface BarcodePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    genericName?: string | null;
    barcode?: string | null;
    sku?: string | null;
    category?: string;
    baseUnit?: string;
    units?: { unitName: string; sellPrice: string | number; isBaseUnit: boolean }[];
  } | null;
}

export function BarcodePrintModal({ isOpen, onClose, product }: BarcodePrintModalProps) {
  const [printCount, setPrintCount] = useState<number>(1);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !product) return null;

  const codeValue = product.barcode || product.sku || '000000';
  const baseUnit = product.units?.find((u) => u.isBaseUnit) || product.units?.[0];
  const price = baseUnit ? Number(baseUnit.sellPrice) || 0 : 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      {/* Printable area style injection */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-barcode-section,
          #printable-barcode-section * {
            visibility: visible;
          }
          #printable-barcode-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden my-6 border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Label Barcode & Stiker Rak
            </h3>
            <p className="text-xs text-slate-500">Preview dan cetak label barcode rak obat</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Controls */}
          <div className="flex items-center justify-between gap-4 p-3.5 bg-blue-50/60 rounded-xl border border-blue-100">
            <div>
              <span className="text-xs font-semibold text-blue-900 block">Jumlah Stiker Dicetak:</span>
              <span className="text-[11px] text-blue-700">Pilih jumlah label per lembar cetak</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[1, 4, 8, 16].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPrintCount(num)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    printCount === num
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {num}x
                </button>
              ))}
            </div>
          </div>

          {/* Sticker Preview Container */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Preview Stiker Rak ({printCount} Label):
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Tersalin!' : 'Salin Kode Barcode'}
              </button>
            </div>

            <div
              id="printable-barcode-section"
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto p-3 bg-slate-100/70 rounded-xl border border-dashed border-slate-300"
            >
              {Array.from({ length: printCount }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white p-3 rounded-lg border border-slate-300 shadow-2xs flex flex-col justify-between text-slate-900 break-inside-avoid"
                  style={{ minHeight: '140px' }}
                >
                  <div className="border-b border-dashed border-slate-200 pb-1.5 mb-1.5 flex items-start justify-between gap-1">
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                        APOTEK DIGITAL
                      </p>
                      <h4 className="text-xs font-black text-slate-900 leading-snug line-clamp-1">
                        {product.name}
                      </h4>
                      {product.genericName && (
                        <p className="text-[10px] text-slate-500 italic line-clamp-1">{product.genericName}</p>
                      )}
                    </div>
                    {product.category && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                        {product.category}
                      </span>
                    )}
                  </div>

                  {/* Barcode SVG rendering */}
                  <div className="my-1 flex justify-center">
                    <BarcodeSVG value={codeValue} height={40} showText={true} />
                  </div>

                  {/* Price Tag */}
                  <div className="mt-1 pt-1 border-t border-dashed border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-500 font-medium">HET / Harga:</span>
                    <span className="font-extrabold text-blue-700">
                      Rp {price.toLocaleString('id-ID')}
                      <span className="text-[10px] text-slate-500 font-normal">
                        {' '}
                        / {baseUnit?.unitName || product.baseUnit || 'Pcs'}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Batal
          </Button>
          <Button
            size="sm"
            onClick={handlePrint}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Cetak Stiker ({printCount}x)
          </Button>
        </div>
      </div>
    </div>
  );
}
