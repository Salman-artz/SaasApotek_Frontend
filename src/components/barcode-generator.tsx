'use client';

import React, { useMemo } from 'react';

// Code 128 B Character Patterns (107 patterns, each 11 modules: bars and spaces)
const CODE128_PATTERNS: string[] = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213', // 0-9
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132', // 10-19
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211', // 20-29
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313', // 30-39
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331', // 40-49
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111', // 50-59
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214', // 60-69
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111', // 70-79
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141', // 80-89
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141', // 90-99
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112' // 100-106 (106 = STOP)
];

const START_CODE_B = 104;
const STOP_CODE = 106;

function encodeCode128B(text: string): string {
  if (!text) return '';
  const cleanText = text.slice(0, 40); // safety length
  const codes: number[] = [START_CODE_B];
  let checksum = START_CODE_B;

  for (let i = 0; i < cleanText.length; i++) {
    const charCode = cleanText.charCodeAt(i);
    const value = charCode - 32; // Code 128 B ASCII offset
    if (value >= 0 && value <= 95) {
      codes.push(value);
      checksum += value * (i + 1);
    }
  }

  const checkValue = checksum % 103;
  codes.push(checkValue);
  codes.push(STOP_CODE);

  // Convert code pattern indices to binary modules (1=bar, 0=space)
  let binaryString = '';
  for (const code of codes) {
    const pattern = CODE128_PATTERNS[code];
    if (!pattern) continue;
    let isBar = true;
    for (const char of pattern) {
      const width = parseInt(char, 10);
      binaryString += (isBar ? '1' : '0').repeat(width);
      isBar = !isBar;
    }
  }

  return binaryString;
}

interface BarcodeProps {
  value: string;
  width?: number;
  height?: number;
  showText?: boolean;
  className?: string;
}

export function BarcodeSVG({
  value,
  height = 50,
  showText = true,
  className = '',
}: BarcodeProps) {
  const binary = useMemo(() => encodeCode128B(value || '00000000'), [value]);

  if (!value) {
    return <span className="text-xs text-slate-400 italic">No Barcode</span>;
  }

  const moduleWidth = 2; // px per module
  const svgWidth = binary.length * moduleWidth;

  // Build SVG path for crisp rendering
  let pathD = '';
  for (let i = 0; i < binary.length; i++) {
    if (binary[i] === '1') {
      pathD += `M${i * moduleWidth},0 h${moduleWidth} v${height} h-${moduleWidth} Z `;
    }
  }

  return (
    <div className={`inline-flex flex-col items-center select-none bg-white p-2 rounded ${className}`}>
      <svg
        viewBox={`0 0 ${svgWidth} ${height}`}
        width="100%"
        height={height}
        className="max-w-[240px] w-full"
        style={{ shapeRendering: 'crispEdges' }}
      >
        <path d={pathD} fill="#0f172a" />
      </svg>
      {showText && (
        <span className="font-mono text-[11px] font-bold tracking-widest text-slate-700 mt-1">
          {value}
        </span>
      )}
    </div>
  );
}

// Helper to generate realistic pharma barcode / SKU
export function generateRandomBarcode(prefix = 'APT'): string {
  const datePart = new Date().getFullYear().toString().slice(-2);
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${datePart}${randomNum}`;
}
