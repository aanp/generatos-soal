import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileText,
  Sparkles,
  Printer,
  Download,
  Save,
  FolderOpen,
  RotateCcw,
  Plus,
  Trash2,
  Pencil,
  Check,
  RefreshCw,
  BookOpen,
  Clock,
  Layers,
  Award,
  CircleAlert,
  CircleCheck,
  ChevronDown,
  ChevronUp,
  FileCheck,
  GraduationCap,
  X,
  Upload,
  Shuffle,
  ArrowUp,
  ArrowDown,
  WandSparkles,
  Image as ImageIcon,
  FileSpreadsheet,
  FileJson,
  Key,
  ClipboardList,
  Table,
  Calculator,
  ShieldCheck,
  Info
} from 'lucide-react';

// ============================================================================
// 1. KONSTANTA REGULASI & STRUKTUR KURIKULUM INDONESIA TERBARU
// ============================================================================
const STORAGE_KEY = 'generator_soal_pro_projects';
const LEGACY_STORAGE_KEY = 'egeo_asesmen_projects';
const API_KEY_STORAGE = 'generator_soal_pro_api_key';
const MODEL_STORAGE = 'generator_soal_pro_model';

const MODEL_OPTIONS = [
  { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash Preview (Rekomendasi Utama)' },
  { id: 'gemini-flash-latest', label: 'Gemini Flash Latest (Auto Terbaru)' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Stabil & Cepat)' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Penalaran Kompleks)' }
];

const REGULASI_INFO = {
  struktur: 'Permendikdasmen No. 13 Tahun 2025 (Lampiran II, Struktur Kurikulum)',
  cpUmum: 'Keputusan Kepala BSKAP No. 046/H/KR/2025',
  cpPai: 'Keputusan Kepala BKPDM No. 020 Tahun 2026 (Khusus Pendidikan Agama Islam)'
};

const JENJANG_CONFIG = {
  SD: {
    label: 'SD / MI',
    menitPerJP: 35,
    opsiPG: 4,
    kelasList: [
      { id: 'I', label: 'Kelas I', fase: 'Fase A' },
      { id: 'II', label: 'Kelas II', fase: 'Fase A' },
      { id: 'III', label: 'Kelas III', fase: 'Fase B' },
      { id: 'IV', label: 'Kelas IV', fase: 'Fase B' },
      { id: 'V', label: 'Kelas V', fase: 'Fase C' },
      { id: 'VI', label: 'Kelas VI', fase: 'Fase C' }
    ]
  },
  SMP: {
    label: 'SMP / MTs',
    menitPerJP: 40,
    opsiPG: 4,
    kelasList: [
      { id: 'VII', label: 'Kelas VII', fase: 'Fase D' },
      { id: 'VIII', label: 'Kelas VIII', fase: 'Fase D' },
      { id: 'IX', label: 'Kelas IX', fase: 'Fase D' }
    ]
  },
  SMA: {
    label: 'SMA / MA',
    menitPerJP: 45,
    opsiPG: 5,
    kelasList: [
      { id: 'X', label: 'Kelas X', fase: 'Fase E' },
      { id: 'XI', label: 'Kelas XI', fase: 'Fase F' },
      { id: 'XII', label: 'Kelas XII', fase: 'Fase F' }
    ]
  }
};

const JENIS_ASESMEN = [
  {
    id: 'Formatif',
    label: 'Formatif',
    fullLabel: 'Asesmen Formatif',
    desc: 'Penilaian proses & umpan balik'
  },
  {
    id: 'Sumatif',
    label: 'Sumatif LM',
    fullLabel: 'Asesmen Sumatif Lingkup Materi',
    desc: 'Ketercapaian tujuan pembelajaran'
  },
  {
    id: 'ASTS',
    label: 'ASTS',
    fullLabel: 'Asesmen Sumatif Tengah Semester',
    desc: 'Evaluasi tengah semester'
  },
  {
    id: 'ASAS',
    label: 'ASAS',
    fullLabel: 'Asesmen Sumatif Akhir Semester',
    desc: 'Evaluasi akhir semester'
  },
  {
    id: 'Diagnostik_AKM',
    label: 'Diagnostik / AKM',
    fullLabel: 'Asesmen Diagnostik / Latihan AKM',
    desc: 'Literasi membaca & numerasi'
  }
];

const getDaftarMapel = (jenjang, kelas) => {
  const agamaList = [
    'Pendidikan Agama Islam dan Budi Pekerti',
    'Pendidikan Agama Kristen dan Budi Pekerti',
    'Pendidikan Agama Katolik dan Budi Pekerti',
    'Pendidikan Agama Hindu dan Budi Pekerti',
    'Pendidikan Agama Buddha dan Budi Pekerti',
    'Pendidikan Agama Khonghucu dan Budi Pekerti'
  ];

  if (jenjang === 'SD') {
    const dasar = [
      ...agamaList,
      'Pendidikan Pancasila',
      'Bahasa Indonesia',
      'Matematika'
    ];
    // Aturan khusus Permendikdasmen No. 13/2025: IPAS dan Bahasa Inggris muncul mulai Kelas III-VI
    const kelasAtas = ['III', 'IV', 'V', 'VI'].includes(kelas)
      ? ['Ilmu Pengetahuan Alam dan Sosial (IPAS)', 'Bahasa Inggris']
      : [];
    const seniMulok = [
      'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
      'Seni Musik',
      'Seni Rupa',
      'Seni Teater',
      'Seni Tari',
      'Muatan Lokal (Bahasa Daerah / Potensi Daerah)'
    ];
    return [...dasar, ...kelasAtas, ...seniMulok];
  }

  if (jenjang === 'SMP') {
    return [
      ...agamaList,
      'Pendidikan Pancasila',
      'Bahasa Indonesia',
      'Matematika',
      'Ilmu Pengetahuan Alam (IPA)',
      'Ilmu Pengetahuan Sosial (IPS)',
      'Bahasa Inggris',
      'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
      'Informatika',
      'Seni Musik',
      'Seni Rupa',
      'Seni Teater',
      'Seni Tari',
      'Prakarya: Budi Daya',
      'Prakarya: Kerajinan',
      'Prakarya: Rekayasa',
      'Prakarya: Pengolahan',
      'Muatan Lokal'
    ];
  }

  if (jenjang === 'SMA') {
    const umum = [
      ...agamaList,
      'Pendidikan Pancasila',
      'Bahasa Indonesia',
      'Matematika (Umum)',
      'Bahasa Inggris',
      'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
      'Sejarah',
      'Seni Musik',
      'Seni Rupa',
      'Seni Teater',
      'Seni Tari',
      'Muatan Lokal'
    ];

    if (kelas === 'X') {
      return [
        ...umum,
        'IPA: Fisika',
        'IPA: Kimia',
        'IPA: Biologi',
        'IPS: Sosiologi',
        'IPS: Ekonomi',
        'IPS: Geografi',
        'Informatika',
        'Prakarya dan Kewirausahaan'
      ];
    }

    return [
      ...umum,
      'Matematika Tingkat Lanjut (Pilihan)',
      'Fisika (Pilihan)',
      'Kimia (Pilihan)',
      'Biologi (Pilihan)',
      'Informatika (Pilihan)',
      'Sosiologi (Pilihan)',
      'Ekonomi (Pilihan)',
      'Geografi (Pilihan)',
      'Antropologi (Pilihan)',
      'Bahasa Indonesia Tingkat Lanjut (Pilihan)',
      'Bahasa Inggris Tingkat Lanjut (Pilihan)',
      'Bahasa Arab (Pilihan)',
      'Bahasa Asing Lainnya: Jepang/Jerman/Prancis/Mandarin/Korea (Pilihan)',
      'Prakarya dan Kewirausahaan: Budi Daya/Kerajinan/Rekayasa/Pengolahan'
    ];
  }

  return [];
};

const TIPE_SOAL_DEFAULT = [
  { id: 'PG', label: 'Pilihan Ganda (PG)', jumlah: 5, bobot: 2 },
  { id: 'PGK', label: 'Pilihan Ganda Kompleks', jumlah: 2, bobot: 3 },
  { id: 'BS', label: 'Benar / Salah', jumlah: 2, bobot: 2 },
  { id: 'JODOH', label: 'Menjodohkan', jumlah: 1, bobot: 4 },
  { id: 'ISIAN', label: 'Isian Singkat', jumlah: 2, bobot: 3 },
  { id: 'URAIAN', label: 'Uraian / Esai', jumlah: 2, bobot: 5 }
];

const QUICK_REGEN_CHIPS = [
  'Buat lebih kontekstual dengan studi kasus aktual',
  'Turunkan tingkat kesulitan agar lebih mudah dipahami',
  'Tingkatkan ke level HOTS (analisis / evaluasi)',
  'Ganti tema stimulus menjadi fenomena Indonesia terkini',
  'Sertakan tabel data atau grafik visual sederhana'
];

const GENERATING_STEPS = [
  'Menganalisis Capaian & Tujuan Pembelajaran sesuai regulasi...',
  'Merancang stimulus kontekstual dan level kognitif LOTS/MOTS/HOTS...',
  'Menyusun butir soal, pengecoh homogen, dan visual data...',
  'Melengkapi kisi-kisi, kartu soal, kunci jawaban, dan rubrik penskoran...'
];

const DEFAULT_CONFIG = {
  namaSekolah: 'SMA NEGERI 1 NUSANTARA',
  subKopSekolah: 'Jl. Pendidikan Raya No. 10 • Telp. (0293) 123456 • Email: info@sman1nusantara.sch.id',
  logoSekolah: '',
  tahunAjaran: '2026/2027',
  semester: 'Ganjil',
  jenisAsesmen: 'ASTS',
  jenjang: 'SMA',
  kelas: 'X',
  mapel: 'IPS: Geografi',
  jumlahJP: 2,
  penyusun: 'Tim MGMP / Guru Mata Pelajaran',
  namaKepalaSekolah: 'Kepala Satuan Pendidikan',
  topik: 'Dinamika Litosfer dan Dampaknya Terhadap Kehidupan',
  cp: 'Peserta didik mampu memahami konsep dasar ilmu geografi, peta, penginderaan jauh, SIG, serta menganalisis fenomena geosfer (litosfer, atmosfer, hidrosfer) dalam konteks mitigasi bencana.',
  tp: '1. Menganalisis dinamika tenaga endogen dan eksogen pada lapisan litosfer.\n2. Mengevaluasi dampak vulkanisme dan tektonisme terhadap kehidupan masyarakat serta upaya mitigasinya.',
  sumberMateri: '',
  proporsiKognitif: { lots: 30, mots: 40, hots: 30 },
  komposisiSoal: TIPE_SOAL_DEFAULT,
  sertakanVisual: true
};

// ============================================================================
// 2. FUNGSI UTILITAS, SANITIZER, GEMINI API & GENERATOR EKSPOR
// ============================================================================
const stripJsonCodeFence = (rawText) => {
  const trimmed = String(rawText || '').trim();
  if (trimmed.startsWith('```')) {
    return trimmed
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
  }
  return trimmed;
};

const callGeminiWithBackoff = async (
  payload,
  { apiKey = '', model = 'gemini-3-flash-preview', retries = 3 } = {}
) => {
  const cleanKey = String(apiKey || '').trim();
  const cleanModel = String(model || 'gemini-3-flash-preview').trim();
  const usePersonalKey = Boolean(cleanKey);

  const endpointUrl = usePersonalKey
    ? `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${encodeURIComponent(cleanKey)}`
    : '/api/gemini';

  const requestBody = usePersonalKey
    ? payload
    : {
        model: cleanModel,
        contents: payload.contents,
        systemInstruction: payload.systemInstruction?.parts?.[0]?.text || '',
        responseMimeType: payload.generationConfig?.responseMimeType || 'application/json',
        responseSchema: payload.generationConfig?.responseSchema
      };

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const rawErrText = await response.text().catch(() => '');
        let errMsg = `HTTP Error ${response.status}`;
        try {
          const parsedErr = JSON.parse(rawErrText);
          errMsg = parsedErr?.error?.message || parsedErr?.error || errMsg;
        } catch (e) {
          if (rawErrText.trim()) errMsg = rawErrText.trim();
        }

        // Fail fast untuk kesalahan otentikasi, konfigurasi server (503), atau parameter tidak valid
        if (
          response.status === 400 ||
          response.status === 401 ||
          response.status === 403 ||
          response.status === 503
        ) {
          throw new Error(
            usePersonalKey
              ? `${errMsg} — Periksa Gemini API Key melalui tombol "API & Model" di bilah atas.`
              : errMsg
          );
        }

        // Retry untuk 429 atau 5xx lainnya
        if ((response.status === 429 || response.status >= 500) && attempt < retries) {
          const jitter = Math.floor(Math.random() * 350);
          const delay = Math.pow(2, attempt) * 1000 + jitter;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw new Error(errMsg);
      }

      if (usePersonalKey) {
        const result = await response.json();
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          throw new Error('Respons AI kosong atau diblokir oleh filter keamanan.');
        }
        return JSON.parse(stripJsonCodeFence(text));
      }

      const streamedText = await response.text();
      if (!streamedText.trim()) {
        throw new Error('Respons AI kosong atau diblokir oleh filter keamanan.');
      }
      return JSON.parse(stripJsonCodeFence(streamedText));
    } catch (error) {
      const isAuthOrSyntax =
        error instanceof SyntaxError ||
        (error.message &&
          (error.message.includes('API & Model') ||
            error.message.includes('Server Gemini belum aktif')));
      if (attempt === retries || isAuthOrSyntax) {
        throw error;
      }
      const jitter = Math.floor(Math.random() * 350);
      const delay = Math.pow(2, attempt) * 1000 + jitter;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('Gagal menghubungi layanan Gemini AI setelah beberapa kali percobaan.');
};

const ALLOWED_VISUAL_TAGS = new Set([
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
  'svg', 'g', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'path',
  'text', 'tspan', 'defs', 'marker', 'lineargradient', 'radialgradient', 'stop',
  'title', 'desc', 'div', 'p', 'span', 'strong', 'em', 'b', 'i', 'u', 'sup', 'sub',
  'br', 'ul', 'ol', 'li'
]);

const ALLOWED_VISUAL_ATTRS = new Set([
  'class', 'style', 'colspan', 'rowspan', 'scope', 'align', 'valign', 'border',
  'cellpadding', 'cellspacing', 'width', 'height', 'viewbox', 'xmlns', 'fill',
  'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin',
  'opacity', 'fill-opacity', 'stroke-opacity', 'x', 'y', 'x1', 'y1', 'x2', 'y2',
  'cx', 'cy', 'r', 'rx', 'ry', 'dx', 'dy', 'd', 'points', 'transform',
  'text-anchor', 'dominant-baseline', 'font-size', 'font-weight', 'font-family',
  'id', 'offset', 'stop-color', 'stop-opacity', 'markerwidth', 'markerheight',
  'refx', 'refy', 'orient', 'marker-end', 'marker-start'
]);

const sanitizeVisualHtml = (rawHtml) => {
  if (!rawHtml || typeof rawHtml !== 'string') return '';
  const trimmed = rawHtml.trim();
  if (!trimmed) return '';

  try {
    if (typeof window !== 'undefined' && typeof window.DOMParser === 'function') {
      const parser = new window.DOMParser();
      const doc = parser.parseFromString(`<div>${trimmed}</div>`, 'text/html');
      const wrapper = doc.body.firstElementChild;
      if (!wrapper) return '';

      const cleanNode = (node) => {
        if (node.nodeType === 3) return; // Text node aman
        if (node.nodeType !== 1) {
          node.remove();
          return;
        }
        const tag = node.tagName.toLowerCase();
        if (
          tag === 'script' ||
          tag === 'iframe' ||
          tag === 'object' ||
          tag === 'embed' ||
          tag === 'foreignobject' ||
          tag === 'style' ||
          tag === 'link'
        ) {
          node.remove();
          return;
        }

        if (!ALLOWED_VISUAL_TAGS.has(tag)) {
          // Ganti tag tak dikenal dengan isinya jika aman, atau hapus
          const parent = node.parentNode;
          if (parent) {
            const frag = doc.createDocumentFragment();
            while (node.firstChild) {
              frag.appendChild(node.firstChild);
            }
            parent.replaceChild(frag, node);
          } else {
            node.remove();
          }
          return;
        }

        const attrs = Array.from(node.attributes);
        for (const attr of attrs) {
          const name = attr.name.toLowerCase();
          const val = String(attr.value || '');
          if (name.startsWith('on')) {
            node.removeAttribute(attr.name);
            continue;
          }
          if (!ALLOWED_VISUAL_ATTRS.has(name)) {
            node.removeAttribute(attr.name);
            continue;
          }
          if (
            /javascript\s*:/i.test(val) ||
            /data\s*:\s*text\/html/i.test(val) ||
            /expression\s*\(/i.test(val)
          ) {
            node.removeAttribute(attr.name);
          }
        }

        Array.from(node.childNodes).forEach(cleanNode);
      };

      Array.from(wrapper.childNodes).forEach(cleanNode);
      return wrapper.innerHTML.trim();
    }
  } catch (e) {
    // Lanjut ke fallback regex di bawah
  }

  // Fallback regex jika DOMParser tidak tersedia
  return trimmed
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/javascript\s*:/gi, '');
};

const escapeHtml = (str) =>
  String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatMultilineHtml = (str) => escapeHtml(str).replace(/\n/g, '<br/>');

const stripHtmlToText = (htmlStr) => {
  if (!htmlStr) return '';
  return String(htmlStr)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|li|h[1-6])>/gi, '\n')
    .replace(/<t[dh][^>]*>/gi, ' | ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const convertSvgToPngDataUrl = (svgString) =>
  new Promise((resolve) => {
    try {
      if (
        typeof window === 'undefined' ||
        typeof document === 'undefined' ||
        typeof window.Image === 'undefined'
      ) {
        resolve(null);
        return;
      }

      let normalizedSvg = svgString.trim();
      if (!/xmlns=/.test(normalizedSvg)) {
        normalizedSvg = normalizedSvg.replace(
          /<svg/i,
          '<svg xmlns="http://www.w3.org/2000/svg"'
        );
      }

      const vbMatch = normalizedSvg.match(/viewBox=["']\s*[\d.-]+\s+[\d.-]+\s+([\d.]+)\s+([\d.]+)\s*["']/i);
      const wMatch = normalizedSvg.match(/\bwidth=["']([\d.]+)(?:px)?["']/i);
      const hMatch = normalizedSvg.match(/\bheight=["']([\d.]+)(?:px)?["']/i);

      const width = Number(wMatch?.[1] || vbMatch?.[1] || 440);
      const height = Number(hMatch?.[1] || vbMatch?.[2] || 240);
      const safeW = Math.min(Math.max(width, 160), 900);
      const safeH = Math.min(Math.max(height, 100), 650);

      const svgBlob = new Blob([normalizedSvg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new window.Image();

      const timer = setTimeout(() => {
        URL.revokeObjectURL(url);
        resolve(null);
      }, 2500);

      img.onload = () => {
        clearTimeout(timer);
        try {
          const scale = 2;
          const canvas = document.createElement('canvas');
          canvas.width = safeW * scale;
          canvas.height = safeH * scale;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const pngUrl = canvas.toDataURL('image/png');
          URL.revokeObjectURL(url);
          resolve({ dataUrl: pngUrl, width: safeW, height: safeH });
        } catch (err) {
          URL.revokeObjectURL(url);
          resolve(null);
        }
      };

      img.onerror = () => {
        clearTimeout(timer);
        URL.revokeObjectURL(url);
        resolve(null);
      };

      img.src = url;
    } catch (err) {
      resolve(null);
    }
  });

const convertVisualSvgsForWord = async (rawVisualHtml) => {
  const clean = sanitizeVisualHtml(rawVisualHtml);
  if (!clean) return '';

  const svgMatches = [...clean.matchAll(/<svg\b[\s\S]*?<\/svg>/gi)];
  if (svgMatches.length === 0) return clean;

  let transformed = clean;
  for (const match of svgMatches) {
    const svgSnippet = match[0];
    const converted = await convertSvgToPngDataUrl(svgSnippet);
    if (converted?.dataUrl) {
      const imgTag = `<div style="margin:6pt 0;text-align:center;"><img src="${converted.dataUrl}" width="${Math.round(converted.width)}" style="max-width:100%;height:auto;border:1px solid #d1d5db;" alt="Visual Stimulus" /></div>`;
      transformed = transformed.replace(svgSnippet, imgTag);
    }
  }
  return transformed;
};

const resizeLogoToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('File logo tidak ditemukan.'));
      return;
    }
    if (!file.type.startsWith('image/')) {
      reject(new Error('Format file harus berupa gambar (PNG, JPG, WEBP, atau SVG).'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('Ukuran file logo maksimal 5 MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar logo.'));
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof window.Image === 'undefined') {
        resolve(dataUrl);
        return;
      }

      const img = new window.Image();
      img.onload = () => {
        const maxDim = 220;
        let targetW = img.width || maxDim;
        let targetH = img.height || maxDim;
        if (targetW > maxDim || targetH > maxDim) {
          const ratio = Math.min(maxDim / targetW, maxDim / targetH);
          targetW = Math.round(targetW * ratio);
          targetH = Math.round(targetH * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, targetW, targetH);
        ctx.drawImage(img, 0, 0, targetW, targetH);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });

const fisherYatesShuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const parseOption = (optStr) => {
  const raw = String(optStr || '').trim();
  const match = raw.match(/^([A-Ea-e])\s*[.)\]:\-]+\s*(.*)$/);
  if (match) {
    return {
      letter: match[1].toUpperCase(),
      body: match[2].trim()
    };
  }
  return { letter: '', body: raw };
};

const buildShuffledPaket = (baseDaftarSoal) => {
  const cloned = (baseDaftarSoal || []).map((s) => ({
    ...s,
    opsi: Array.isArray(s.opsi) ? [...s.opsi] : [],
    premis: Array.isArray(s.premis) ? [...s.premis] : [],
    respon: Array.isArray(s.respon) ? [...s.respon] : []
  }));

  // Kelompokkan berdasarkan tipe agar struktur bagian soal tetap rapi
  const orderedTypes = [];
  const groups = new Map();
  cloned.forEach((soal) => {
    const key = soal.tipe || 'LAIN';
    if (!groups.has(key)) {
      groups.set(key, []);
      orderedTypes.push(key);
    }
    groups.get(key).push(soal);
  });

  const hasMultiItemGroup = orderedTypes.some((t) => groups.get(t).length > 1);
  let reordered = [];
  if (hasMultiItemGroup) {
    orderedTypes.forEach((t) => {
      reordered = reordered.concat(fisherYatesShuffle(groups.get(t)));
    });
  } else {
    reordered = fisherYatesShuffle(cloned);
  }

  const letters = ['A', 'B', 'C', 'D', 'E'];

  return reordered.map((soal, idx) => {
    const updated = { ...soal, nomor: idx + 1 };

    if ((updated.tipe === 'PG' || updated.tipe === 'PGK') && updated.opsi.length >= 2) {
      const parsedOptions = updated.opsi.map((o, oIdx) => {
        const parsed = parseOption(o);
        return {
          origLetter: parsed.letter || letters[oIdx] || '',
          body: parsed.body
        };
      });

      const kunciRaw = String(updated.kunciJawaban || '').trim();
      let correctIndices = [];

      if (updated.tipe === 'PG') {
        const leadMatch = kunciRaw.match(/^([A-Ea-e])(?:\b|[.)\]:\s])/);
        if (leadMatch) {
          const target = leadMatch[1].toUpperCase();
          const foundIdx = parsedOptions.findIndex((p) => p.origLetter === target);
          if (foundIdx !== -1) correctIndices = [foundIdx];
        }
        if (correctIndices.length === 0) {
          const normKey = kunciRaw.toLowerCase();
          const foundIdx = parsedOptions.findIndex(
            (p) => p.body.toLowerCase() === normKey || normKey.includes(p.body.toLowerCase())
          );
          if (foundIdx !== -1) correctIndices = [foundIdx];
        }
      } else {
        // PGK: bisa lebih dari satu huruf benar
        const letterMatches = [...kunciRaw.matchAll(/\b([A-Ea-e])\b/g)].map((m) =>
          m[1].toUpperCase()
        );
        const uniqueLetters = [...new Set(letterMatches)];
        parsedOptions.forEach((p, pIdx) => {
          if (uniqueLetters.includes(p.origLetter)) {
            correctIndices.push(pIdx);
          }
        });
        if (correctIndices.length === 0) {
          const normKey = kunciRaw.toLowerCase();
          parsedOptions.forEach((p, pIdx) => {
            if (p.body && normKey.includes(p.body.toLowerCase())) {
              correctIndices.push(pIdx);
            }
          });
        }
      }

      // Tandai opsi yang benar sebelum diacak
      const taggedOptions = parsedOptions.map((p, pIdx) => ({
        ...p,
        isCorrect: correctIndices.includes(pIdx)
      }));

      // Acak opsi, pastikan urutan berubah bila >= 2 opsi
      let shuffled = fisherYatesShuffle(taggedOptions);
      if (taggedOptions.length >= 2) {
        const sameOrder = shuffled.every((item, i) => item.body === taggedOptions[i].body);
        if (sameOrder) {
          shuffled = [...shuffled.slice(1), shuffled[0]];
        }
      }

      updated.opsi = shuffled.map((item, oIdx) => {
        const newLtr = letters[oIdx] || String(oIdx + 1);
        return `${newLtr}. ${item.body}`;
      });

      const newCorrectItems = shuffled
        .map((item, oIdx) => ({
          newLtr: letters[oIdx] || String(oIdx + 1),
          body: item.body,
          isCorrect: item.isCorrect
        }))
        .filter((x) => x.isCorrect);

      if (newCorrectItems.length > 0) {
        if (updated.tipe === 'PG') {
          updated.kunciJawaban = `${newCorrectItems[0].newLtr}. ${newCorrectItems[0].body}`;
        } else {
          updated.kunciJawaban = newCorrectItems
            .map((x) => `${x.newLtr}. ${x.body}`)
            .join('; ');
        }
      }
    }

    return updated;
  });
};

const getLevelBadgeStyle = (level) => {
  const upper = String(level || '').toUpperCase();
  if (upper.includes('HOTS')) {
    return 'bg-rose-50 text-rose-700 border-rose-200';
  }
  if (upper.includes('MOTS')) {
    return 'bg-amber-50 text-amber-800 border-amber-200';
  }
  return 'bg-emerald-50 text-emerald-700 border-emerald-200';
};

const csvEscapeField = (value) => {
  const str = String(value ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const exportPGToCsv = (daftarSoal, filename) => {
  const pgList = (daftarSoal || []).filter((s) => s.tipe === 'PG');
  if (pgList.length === 0) return false;

  const header = [
    'Question Text',
    'Question Type',
    'Option 1',
    'Option 2',
    'Option 3',
    'Option 4',
    'Option 5',
    'Correct Answer',
    'Time in seconds',
    'Explanation'
  ];

  const letters = ['A', 'B', 'C', 'D', 'E'];

  const rows = pgList.map((soal) => {
    const cleanStimulus = stripHtmlToText(soal.stimulus);
    const cleanVisual = stripHtmlToText(soal.visualHtml);
    const parts = [cleanStimulus, cleanVisual, soal.pertanyaan].filter(Boolean);
    const qText = parts.join('\n\n');

    const parsedOpts = (soal.opsi || []).slice(0, 5).map(parseOption);
    const optCols = [0, 1, 2, 3, 4].map((i) => parsedOpts[i]?.body || '');

    const kunciRaw = String(soal.kunciJawaban || '').trim();
    const leadMatch = kunciRaw.match(/^([A-Ea-e])(?:\b|[.)\]:\s])/);
    let correctNum = 1;
    if (leadMatch) {
      const idx = letters.indexOf(leadMatch[1].toUpperCase());
      if (idx !== -1 && idx < parsedOpts.length) {
        correctNum = idx + 1;
      }
    } else {
      const normKey = kunciRaw.toLowerCase();
      const idx = parsedOpts.findIndex(
        (p) => p.body.toLowerCase() === normKey || normKey.includes(p.body.toLowerCase())
      );
      if (idx !== -1) correctNum = idx + 1;
    }

    const levelUpper = String(soal.levelKognitif || '').toUpperCase();
    const timeSec = levelUpper.includes('HOTS') ? 90 : levelUpper.includes('MOTS') ? 60 : 30;

    return [
      qText,
      'Multiple Choice',
      optCols[0],
      optCols[1],
      optCols[2],
      optCols[3],
      optCols[4],
      correctNum,
      timeSec,
      soal.pembahasan || ''
    ]
      .map(csvEscapeField)
      .join(',');
  });

  const csvContent = [header.map(csvEscapeField).join(','), ...rows].join('\r\n');
  const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
};

const renderJodohWordHtml = (soal) => {
  const premis = Array.isArray(soal.premis) ? soal.premis : [];
  const respon = Array.isArray(soal.respon) ? soal.respon : [];
  if (premis.length === 0 && respon.length === 0) return '';
  const maxLen = Math.max(premis.length, respon.length);
  let rows = '';
  for (let i = 0; i < maxLen; i++) {
    rows += `
      <tr>
        <td width="50%">${premis[i] ? escapeHtml(premis[i]) : '&nbsp;'}</td>
        <td width="50%">${respon[i] ? escapeHtml(respon[i]) : '&nbsp;'}</td>
      </tr>
    `;
  }
  return `
    <table style="margin-top:6pt;margin-bottom:8pt;">
      <thead>
        <tr>
          <th width="50%">Premis / Pernyataan</th>
          <th width="50%">Pilihan Respon / Pasangan</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
};

const generateWordDocument = async (
  mode,
  { config, hasilAsesmen, currentJenjang, currentKelasObj, totalMenit, actualTotalSkorMaks }
) => {
  if (!hasilAsesmen) return;

  const isLengkap = mode === 'lengkap';
  const paketLabel =
    hasilAsesmen.paketAktif && hasilAsesmen.paketAktif !== 'UTAMA'
      ? `PAKET ${hasilAsesmen.paketAktif}`
      : '';

  // Konversi SVG visual menjadi PNG agar tampil rapi di MS Word
  const renderedVisuals = await Promise.all(
    hasilAsesmen.daftarSoal.map((s) => convertVisualSvgsForWord(s.visualHtml))
  );

  const kopHtml = `
    <table class="kop-table" style="width:100%;border-collapse:collapse;border-bottom:3pt double #000000;margin-bottom:10pt;">
      <tr>
        ${
          config.logoSekolah
            ? `<td style="width:76pt;border:none;text-align:center;vertical-align:middle;padding:4pt 6pt 8pt 0;">
                 <img src="${config.logoSekolah}" width="64" style="max-height:64pt;width:auto;" alt="Logo" />
               </td>`
            : ''
        }
        <td style="border:none;text-align:center;vertical-align:middle;padding:2pt 4pt 8pt 4pt;">
          <div style="font-size:14pt;font-weight:bold;text-transform:uppercase;">${escapeHtml(config.namaSekolah)}</div>
          ${
            config.subKopSekolah
              ? `<div style="font-size:10pt;margin-top:2pt;">${escapeHtml(config.subKopSekolah)}</div>`
              : ''
          }
          <div style="font-size:12pt;font-weight:bold;text-transform:uppercase;margin-top:4pt;">
            ${escapeHtml(hasilAsesmen.judulAsesmen)} ${paketLabel ? `(${escapeHtml(paketLabel)})` : ''}
          </div>
          <div style="font-size:10.5pt;margin-top:2pt;">
            Tahun Ajaran ${escapeHtml(config.tahunAjaran)} &bull; Semester ${escapeHtml(config.semester)}
          </div>
        </td>
      </tr>
    </table>
  `;

  const identitasHtml = `
    <table class="std-table">
      <tr>
        <td width="20%"><strong>Mata Pelajaran</strong></td>
        <td width="30%">: ${escapeHtml(config.mapel)}</td>
        <td width="20%"><strong>Jenjang / Kelas</strong></td>
        <td width="30%">: ${escapeHtml(currentJenjang.label)} / ${escapeHtml(currentKelasObj.label)} (${escapeHtml(currentKelasObj.fase)})</td>
      </tr>
      <tr>
        <td><strong>Jenis Asesmen</strong></td>
        <td>: ${escapeHtml(config.jenisAsesmen)}</td>
        <td><strong>Alokasi Waktu</strong></td>
        <td>: ${config.jumlahJP} JP (${totalMenit} Menit)</td>
      </tr>
      <tr>
        <td><strong>Materi Pokok</strong></td>
        <td colspan="3">: ${escapeHtml(config.topik)}</td>
      </tr>
      ${
        !isLengkap
          ? `<tr>
               <td><strong>Nama Siswa</strong></td>
               <td>: ........................................</td>
               <td><strong>Kelas / No. Absen</strong></td>
               <td>: ................ / ........</td>
             </tr>`
          : ''
      }
    </table>
  `;

  const naskahSoalHtml = `
    <p style="margin-bottom:4pt;"><strong>Petunjuk Pengerjaan:</strong></p>
    <ol style="margin-top:0;margin-bottom:12pt;padding-left:18pt;">
      ${(hasilAsesmen.petunjukUmum || []).map((p) => `<li>${escapeHtml(p)}</li>`).join('')}
    </ol>

    <h3>A. NASKAH SOAL ASESMEN</h3>
    ${hasilAsesmen.daftarSoal
      .map((s, idx) => {
        const visualMarkup = renderedVisuals[idx]
          ? `<div style="margin:6pt 0;">${renderedVisuals[idx]}</div>`
          : '';
        const jodohMarkup = s.tipe === 'JODOH' ? renderJodohWordHtml(s) : '';
        const opsiMarkup =
          s.opsi && s.opsi.length > 0
            ? `<div style="padding-left:14pt;margin-top:4pt;">
                 ${s.opsi.map((o) => `<div style="margin-bottom:2pt;">${escapeHtml(o)}</div>`).join('')}
               </div>`
            : '';

        return `
          <div style="margin-bottom:12pt;">
            <p style="margin-bottom:4pt;">
              <strong>${s.nomor}. [${escapeHtml(s.tipeLabel)}]</strong>
              ${isLengkap ? ` <span style="font-size:10pt;color:#334155;">(${escapeHtml(s.levelKognitif)} • Skor: ${s.skorMaksimal})</span>` : ''}
            </p>
            ${
              s.stimulus
                ? `<div class="stimulus">${formatMultilineHtml(s.stimulus)}</div>`
                : ''
            }
            ${visualMarkup}
            <p style="margin:4pt 0;">${formatMultilineHtml(s.pertanyaan)}</p>
            ${jodohMarkup}
            ${opsiMarkup}
          </div>
        `;
      })
      .join('')}
  `;

  const pageBreak = '<br clear="all" style="page-break-before:always" />';

  const kisiKisiHtml = isLengkap
    ? `
      ${pageBreak}
      <h3>B. KISI-KISI PENULISAN SOAL</h3>
      <p style="font-size:10pt;margin-top:0;margin-bottom:8pt;">
        Acuan Regulasi: ${escapeHtml(REGULASI_INFO.struktur)} &bull; ${escapeHtml(hasilAsesmen.regulasiCP)}
      </p>
      <table class="std-table">
        <thead>
          <tr>
            <th width="6%">No</th>
            <th width="20%">Materi</th>
            <th width="34%">Indikator Soal</th>
            <th width="12%">Level Kognitif</th>
            <th width="14%">Bentuk Soal</th>
            <th width="7%">No. Soal</th>
            <th width="7%">Skor</th>
          </tr>
        </thead>
        <tbody>
          ${hasilAsesmen.daftarSoal
            .map(
              (s, idx) => `
              <tr>
                <td style="text-align:center;">${idx + 1}</td>
                <td>${escapeHtml(s.materi)}</td>
                <td>${escapeHtml(s.indikatorSoal)}</td>
                <td style="text-align:center;">${escapeHtml(s.levelKognitif)}</td>
                <td style="text-align:center;">${escapeHtml(s.tipeLabel)}</td>
                <td style="text-align:center;">${s.nomor}</td>
                <td style="text-align:center;">${s.skorMaksimal}</td>
              </tr>
            `
            )
            .join('')}
          <tr>
            <td colspan="6" style="text-align:right;"><strong>TOTAL SKOR MAKSIMAL</strong></td>
            <td style="text-align:center;"><strong>${actualTotalSkorMaks}</strong></td>
          </tr>
        </tbody>
      </table>
    `
    : '';

  const kartuSoalHtml = isLengkap
    ? `
      ${pageBreak}
      <h3>C. KARTU SOAL (ADMINISTRASI SUPERVISI GURU)</h3>
      ${hasilAsesmen.daftarSoal
        .map(
          (s, idx) => `
          <table class="std-table" style="margin-bottom:14pt;page-break-inside:avoid;">
            <thead>
              <tr>
                <th colspan="4" style="text-align:left;background-color:#e2e8f0;">
                  KARTU SOAL NOMOR ${s.nomor} &mdash; ${escapeHtml(config.namaSekolah)} (${escapeHtml(config.mapel)})
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td width="24%"><strong>Jenis Asesmen / Paket</strong></td>
                <td width="26%">${escapeHtml(config.jenisAsesmen)} ${paketLabel ? `(${escapeHtml(paketLabel)})` : ''}</td>
                <td width="22%"><strong>Bentuk &amp; Level</strong></td>
                <td width="28%">${escapeHtml(s.tipeLabel)} / ${escapeHtml(s.levelKognitif)} (Skor: ${s.skorMaksimal})</td>
              </tr>
              <tr>
                <td><strong>Capaian Pembelajaran</strong></td>
                <td colspan="3">${formatMultilineHtml(config.cp || '-')}</td>
              </tr>
              <tr>
                <td><strong>Tujuan Pembelajaran</strong></td>
                <td colspan="3">${formatMultilineHtml(config.tp || '-')}</td>
              </tr>
              <tr>
                <td><strong>Materi Pokok</strong></td>
                <td colspan="3">${escapeHtml(s.materi)}</td>
              </tr>
              <tr>
                <td><strong>Indikator Soal</strong></td>
                <td colspan="3">${escapeHtml(s.indikatorSoal)}</td>
              </tr>
              <tr>
                <td colspan="4">
                  <strong>Rumusan Butir Soal:</strong><br/>
                  ${s.stimulus ? `<div class="stimulus">${formatMultilineHtml(s.stimulus)}</div>` : ''}
                  ${renderedVisuals[idx] ? `<div style="margin:6pt 0;">${renderedVisuals[idx]}</div>` : ''}
                  <div style="margin:4pt 0;">${formatMultilineHtml(s.pertanyaan)}</div>
                  ${s.tipe === 'JODOH' ? renderJodohWordHtml(s) : ''}
                  ${
                    s.opsi && s.opsi.length > 0
                      ? `<div style="padding-left:12pt;">${s.opsi.map((o) => `<div>${escapeHtml(o)}</div>`).join('')}</div>`
                      : ''
                  }
                </td>
              </tr>
              <tr>
                <td><strong>Kunci Jawaban</strong></td>
                <td colspan="3"><strong>${escapeHtml(s.kunciJawaban)}</strong></td>
              </tr>
              <tr>
                <td><strong>Pembahasan</strong></td>
                <td colspan="3">${formatMultilineHtml(s.pembahasan)}</td>
              </tr>
              <tr>
                <td><strong>Pedoman Penskoran</strong></td>
                <td colspan="3">${formatMultilineHtml(s.pedomanPenskoran)} (Skor Maksimal: ${s.skorMaksimal})</td>
              </tr>
            </tbody>
          </table>
        `
        )
        .join('')}
    `
    : '';

  const kunciRubrikHtml = isLengkap
    ? `
      ${pageBreak}
      <h3>D. KUNCI JAWABAN, PEMBAHASAN &amp; PEDOMAN PENSKORAN</h3>
      <table class="std-table">
        <thead>
          <tr>
            <th width="6%">No</th>
            <th width="24%">Kunci Jawaban</th>
            <th width="42%">Pembahasan / Rubrik</th>
            <th width="28%">Pedoman Penskoran</th>
          </tr>
        </thead>
        <tbody>
          ${hasilAsesmen.daftarSoal
            .map(
              (s) => `
              <tr>
                <td style="text-align:center;"><strong>${s.nomor}</strong></td>
                <td><strong>${escapeHtml(s.kunciJawaban)}</strong></td>
                <td>${formatMultilineHtml(s.pembahasan)}</td>
                <td>${formatMultilineHtml(s.pedomanPenskoran)}<br/><strong>(Skor Maks: ${s.skorMaksimal})</strong></td>
              </tr>
            `
            )
            .join('')}
        </tbody>
      </table>
      <p><strong>Rumus Nilai Akhir:</strong> Nilai Akhir = (Total Skor Perolehan &divide; ${actualTotalSkorMaks}) &times; 100</p>
      <table style="width:100%;border:none;margin-top:24pt;">
        <tr>
          <td width="50%" style="border:none;text-align:center;">
            Mengetahui,<br/>Kepala Satuan Pendidikan<br/><br/><br/><br/>
            <strong>${escapeHtml(config.namaKepalaSekolah || '........................................')}</strong>
          </td>
          <td width="50%" style="border:none;text-align:center;">
            Penyusun Perangkat Asesmen<br/>Guru Mata Pelajaran<br/><br/><br/><br/>
            <strong>${escapeHtml(config.penyusun)}</strong>
          </td>
        </tr>
      </table>
    `
    : '';

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${escapeHtml(hasilAsesmen.judulAsesmen)}</title>
      <style>
        @page { size: A4; margin: 2cm; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.45; color: #000000; }
        h3 { font-size: 12pt; text-transform: uppercase; margin: 10pt 0 6pt 0; border-bottom: 1pt solid #000; padding-bottom: 2pt; }
        table.std-table { border-collapse: collapse; width: 100%; margin-bottom: 12pt; font-size: 11pt; }
        table.std-table th, table.std-table td { border: 1pt solid #000000; padding: 5pt 6pt; text-align: left; vertical-align: top; }
        table.std-table th { background-color: #f1f5f9; font-weight: bold; text-align: center; }
        .stimulus { background-color: #f8fafc; border: 1pt solid #cbd5e1; border-left: 3pt solid #334155; padding: 6pt 8pt; margin: 5pt 0; }
      </style>
    </head>
    <body>
      ${kopHtml}
      ${identitasHtml}
      ${naskahSoalHtml}
      ${kisiKisiHtml}
      ${kartuSoalHtml}
      ${kunciRubrikHtml}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const suffixMode = isLengkap ? 'Lengkap' : 'Naskah_Siswa';
  const suffixPaket =
    hasilAsesmen.paketAktif && hasilAsesmen.paketAktif !== 'UTAMA'
      ? `_Paket_${hasilAsesmen.paketAktif}`
      : '';
  link.href = url;
  link.download = `Asesmen_${config.jenisAsesmen}_${config.mapel.replace(/[^a-zA-Z0-9]/g, '_')}_${currentKelasObj.id}${suffixPaket}_${suffixMode}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ============================================================================
// 3. KOMPONEN KECIL UNTUK RENDER VISUAL & SOAL
// ============================================================================
function VisualStimulusBox({ visualHtml }) {
  const safeHtml = useMemo(() => sanitizeVisualHtml(visualHtml), [visualHtml]);
  if (!safeHtml) return null;

  return (
    <div
      className="my-3 p-3 bg-white border border-slate-200 rounded-xl overflow-x-auto text-xs text-slate-800 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-slate-300 [&_th]:bg-slate-100 [&_th]:px-2.5 [&_th]:py-1.5 [&_th]:font-semibold [&_td]:border [&_td]:border-slate-300 [&_td]:px-2.5 [&_td]:py-1.5 [&_svg]:max-w-full [&_svg]:h-auto [&_svg]:mx-auto"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}

function JodohTableBox({ premis = [], respon = [] }) {
  const maxLen = Math.max(premis.length, respon.length);
  if (maxLen === 0) return null;

  return (
    <div className="my-2.5 overflow-x-auto">
      <table className="w-full text-xs border-collapse border border-slate-300 rounded-lg">
        <thead>
          <tr className="bg-slate-100 text-slate-700">
            <th className="border border-slate-300 px-3 py-1.5 text-left w-1/2">
              Premis / Pernyataan
            </th>
            <th className="border border-slate-300 px-3 py-1.5 text-left w-1/2">
              Pilihan Respon / Pasangan
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: maxLen }).map((_, i) => (
            <tr key={i} className="hover:bg-slate-50">
              <td className="border border-slate-300 px-3 py-1.5 align-top">
                {premis[i] || ''}
              </td>
              <td className="border border-slate-300 px-3 py-1.5 align-top">
                {respon[i] || ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// 4. KOMPONEN UTAMA APLIKASI
// ============================================================================
export default function App() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [hasilAsesmen, setHasilAsesmen] = useState(null);
  const [activeTab, setActiveTab] = useState('naskah'); // 'naskah' | 'kisikisi' | 'kartu' | 'kunci'
  const [openSection, setOpenSection] = useState(1); // 1 | 2 | 3 (Accordion Panel Kiri)

  // State Edit & Regenerasi Soal
  const [editingIndex, setEditingIndex] = useState(null);
  const [regeneratingIndex, setRegeneratingIndex] = useState(null);
  const [regenModalIndex, setRegenModalIndex] = useState(null);
  const [regenInstruction, setRegenInstruction] = useState('');
  const [newSoalTipe, setNewSoalTipe] = useState('PG');

  // State Status AI & Pengaturan API
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStage, setGeneratingStage] = useState(0);
  const [isGeneratingCPTP, setIsGeneratingCPTP] = useState(false);
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3-flash-preview');

  // State Modals & Print Options
  const [notification, setNotification] = useState(null);
  const [savedProjects, setSavedProjects] = useState([]);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [showRegulasiModal, setShowRegulasiModal] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showWordModal, setShowWordModal] = useState(false);
  const [printMode, setPrintMode] = useState('lengkap'); // 'lengkap' | 'siswa'
  const [hideLevelOnStudentPrint, setHideLevelOnStudentPrint] = useState(true);
  const [skorSimulasi, setSkorSimulasi] = useState(0);

  const toastTimerRef = useRef(null);
  const logoInputRef = useRef(null);
  const materiFileInputRef = useRef(null);
  const jsonImportInputRef = useRef(null);

  // Load proyek, API Key, dan model pilihan dari localStorage saat awal
  useEffect(() => {
    try {
      const storedProjects =
        localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (storedProjects) {
        const parsed = JSON.parse(storedProjects);
        if (Array.isArray(parsed)) setSavedProjects(parsed);
      }
      const storedKey = localStorage.getItem(API_KEY_STORAGE);
      if (storedKey) setApiKey(storedKey);
      const storedModel = localStorage.getItem(MODEL_STORAGE);
      if (storedModel) setSelectedModel(storedModel);
    } catch (e) {
      // Abaikan jika akses localStorage dibatasi
    }
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Animasi pesan informatif selama proses generasi AI
  useEffect(() => {
    if (!isGenerating) {
      setGeneratingStage(0);
      return;
    }
    const interval = setInterval(() => {
      setGeneratingStage((prev) => (prev + 1) % GENERATING_STEPS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const showToast = (type, message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setNotification({ type, message });
    toastTimerRef.current = setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Hitung nilai turunan kurikulum & komposisi
  const currentJenjang = JENJANG_CONFIG[config.jenjang] || JENJANG_CONFIG.SMA;
  const currentKelasObj = useMemo(
    () =>
      currentJenjang.kelasList.find((k) => k.id === config.kelas) ||
      currentJenjang.kelasList[0],
    [config.kelas, currentJenjang]
  );

  const daftarMapel = useMemo(
    () => getDaftarMapel(config.jenjang, config.kelas),
    [config.jenjang, config.kelas]
  );

  const isPAI = config.mapel.toLowerCase().includes('agama islam');
  const acuanCPAktif = isPAI ? REGULASI_INFO.cpPai : REGULASI_INFO.cpUmum;
  const totalMenit = (Number(config.jumlahJP) || 1) * currentJenjang.menitPerJP;
  const jumlahOpsiPG = currentJenjang.opsiPG;

  const totalProporsi =
    (Number(config.proporsiKognitif.lots) || 0) +
    (Number(config.proporsiKognitif.mots) || 0) +
    (Number(config.proporsiKognitif.hots) || 0);
  const isProporsiValid = totalProporsi === 100;

  const totalSoalConfig = config.komposisiSoal.reduce(
    (acc, item) => acc + (Number(item.jumlah) || 0),
    0
  );
  const totalSkorConfig = config.komposisiSoal.reduce(
    (acc, item) => acc + (Number(item.jumlah) || 0) * (Number(item.bobot) || 1),
    0
  );

  const actualTotalSkorMaks = useMemo(() => {
    if (!hasilAsesmen?.daftarSoal?.length) return totalSkorConfig || 100;
    const sum = hasilAsesmen.daftarSoal.reduce(
      (acc, s) => acc + (Number(s.skorMaksimal) || 0),
      0
    );
    return sum > 0 ? sum : 1;
  }, [hasilAsesmen, totalSkorConfig]);

  const kognitifCounts = useMemo(() => {
    const counts = { LOTS: 0, MOTS: 0, HOTS: 0 };
    if (!hasilAsesmen?.daftarSoal) return counts;
    hasilAsesmen.daftarSoal.forEach((s) => {
      const upper = String(s.levelKognitif || '').toUpperCase();
      if (upper.includes('HOTS')) counts.HOTS += 1;
      else if (upper.includes('MOTS')) counts.MOTS += 1;
      else counts.LOTS += 1;
    });
    return counts;
  }, [hasilAsesmen]);

  useEffect(() => {
    setSkorSimulasi(Math.round(actualTotalSkorMaks * 0.8));
  }, [actualTotalSkorMaks]);

  // ==========================================================================
  // HANDLER KONFIGURASI & FILE UPLOAD
  // ==========================================================================
  const handleJenjangChange = (newJenjang) => {
    const defaultKelas = JENJANG_CONFIG[newJenjang].kelasList[0].id;
    const newMapels = getDaftarMapel(newJenjang, defaultKelas);
    setConfig((prev) => ({
      ...prev,
      jenjang: newJenjang,
      kelas: defaultKelas,
      mapel: newMapels.includes(prev.mapel) ? prev.mapel : newMapels[0] || ''
    }));
  };

  const handleKelasChange = (newKelas) => {
    const newMapels = getDaftarMapel(config.jenjang, newKelas);
    setConfig((prev) => ({
      ...prev,
      kelas: newKelas,
      mapel: newMapels.includes(prev.mapel) ? prev.mapel : newMapels[0] || ''
    }));
  };

  const handleNormalizeProporsi = () => {
    const { lots, mots, hots } = config.proporsiKognitif;
    const sum = lots + mots + hots;
    if (sum <= 0) {
      setConfig((prev) => ({
        ...prev,
        proporsiKognitif: { lots: 30, mots: 40, hots: 30 }
      }));
      return;
    }
    const newLots = Math.round((lots / sum) * 100);
    const newMots = Math.round((mots / sum) * 100);
    const newHots = Math.max(0, 100 - newLots - newMots);
    setConfig((prev) => ({
      ...prev,
      proporsiKognitif: { lots: newLots, mots: newMots, hots: newHots }
    }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const resized = await resizeLogoToDataUrl(file);
      setConfig((prev) => ({ ...prev, logoSekolah: resized }));
      showToast('success', 'Logo sekolah berhasil diunggah ke Kop Naskah.');
    } catch (error) {
      showToast('error', error.message || 'Gagal memproses logo sekolah.');
    }
  };

  const handleMateriFileUpload = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const rawText = String(reader.result || '').trim();
      const maxChars = 30000;
      const sliced = rawText.slice(0, maxChars);
      setConfig((prev) => ({
        ...prev,
        sumberMateri: sliced
      }));
      if (rawText.length > maxChars) {
        showToast(
          'success',
          `File "${file.name}" dimuat (dipotong ke 30.000 karakter pertama agar optimal).`
        );
      } else {
        showToast('success', `Sumber materi "${file.name}" berhasil dimuat.`);
      }
    };
    reader.onerror = () => {
      showToast('error', 'Gagal membaca file teks sumber materi.');
    };
    reader.readAsText(file, 'utf-8');
  };

  // ==========================================================================
  // AUTO RUMUSKAN CP & TP DENGAN GEMINI API
  // ==========================================================================
  const handleGenerateCPTP = async () => {
    if (!config.topik.trim()) {
      showToast('error', 'Isi Topik / Materi Pokok terlebih dahulu sebelum merumuskan CP & TP.');
      return;
    }
    setIsGeneratingCPTP(true);

    const systemPrompt = `Anda adalah pakar kurikulum pendidikan dasar dan menengah Indonesia.
Tugas Anda merumuskan Capaian Pembelajaran (CP) dan Tujuan Pembelajaran (TP) yang akurat sesuai regulasi resmi:
1. Struktur Kurikulum: ${REGULASI_INFO.struktur}
2. Acuan CP Resmi: ${acuanCPAktif}
Gunakan Bahasa Indonesia baku sesuai EYD V dan kata kerja operasional (KKO) Taksonomi Bloom yang sesuai jenjang dan fase.`;

    const userPrompt = `Rumuskan Capaian Pembelajaran (CP) dan 3–4 Tujuan Pembelajaran (TP) yang relevan untuk spesifikasi berikut:
- Jenjang / Kelas / Fase: ${currentJenjang.label} / ${currentKelasObj.label} (${currentKelasObj.fase})
- Mata Pelajaran: ${config.mapel}
- Topik / Materi Pokok: ${config.topik}
${config.sumberMateri.trim() ? `\nRingkasan Sumber Materi Guru:\n${config.sumberMateri.trim().slice(0, 6000)}` : ''}`;

    const schema = {
      type: 'OBJECT',
      properties: {
        cp: {
          type: 'STRING',
          description: 'Rumusan Capaian Pembelajaran (CP) fase terkait yang selaras regulasi'
        },
        tp: {
          type: 'ARRAY',
          items: { type: 'STRING' },
          description: '3 sampai 4 butir Tujuan Pembelajaran (TP) spesifik tanpa nomor urut di awal'
        }
      },
      required: ['cp', 'tp']
    };

    try {
      const data = await callGeminiWithBackoff(
        {
          contents: [{ parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: schema
          }
        },
        { apiKey, model: selectedModel }
      );

      const formattedTP = Array.isArray(data.tp)
        ? data.tp.map((item, idx) => `${idx + 1}. ${String(item).replace(/^\d+\.\s*/, '')}`).join('\n')
        : '';

      setConfig((prev) => ({
        ...prev,
        cp: data.cp || prev.cp,
        tp: formattedTP || prev.tp
      }));
      showToast('success', 'Rumusan CP dan TP berhasil disusun otomatis oleh AI!');
    } catch (error) {
      showToast('error', `Gagal merumuskan CP & TP: ${error.message}`);
    } finally {
      setIsGeneratingCPTP(false);
    }
  };

  // ==========================================================================
  // GENERATE PERANGKAT ASESMEN LENGKAP DENGAN GEMINI API
  // ==========================================================================
  const handleGenerateAsesmen = async () => {
    if (!config.topik.trim()) {
      showToast('error', 'Harap isi Topik / Materi Pokok terlebih dahulu.');
      setOpenSection(2);
      return;
    }
    if (!isProporsiValid) {
      showToast('error', `Total proporsi kognitif LOTS + MOTS + HOTS harus 100% (saat ini ${totalProporsi}%).`);
      setOpenSection(3);
      return;
    }
    if (totalSoalConfig <= 0) {
      showToast('error', 'Jumlah butir soal total minimal 1 butir.');
      setOpenSection(3);
      return;
    }

    setIsGenerating(true);
    setEditingIndex(null);

    const komposisiText = config.komposisiSoal
      .filter((s) => Number(s.jumlah) > 0)
      .map((s) => `- ${s.label} (kode tipe: ${s.id}): ${s.jumlah} soal, skorMaksimal = ${s.bobot}`)
      .join('\n');

    const jenisObj = JENIS_ASESMEN.find((j) => j.id === config.jenisAsesmen);
    const isDiagnostikAKM = config.jenisAsesmen === 'Diagnostik_AKM';

    const systemPrompt = `Anda adalah Senior Pakar Evaluasi & Asesmen Pendidikan Nasional Indonesia sekaligus penyusun soal profesional.
Acuan Resmi Kurikulum:
1. Struktur Kurikulum & Mapel: ${REGULASI_INFO.struktur}.
2. Capaian Pembelajaran: ${acuanCPAktif}.

Kaidah Penulisan Soal Wajib:
- Gunakan Bahasa Indonesia baku sesuai EYD V (ejaan, tanda baca, kalimat efektif).
- Sertakan stimulus kontekstual (studi kasus, kutipan teks berita/literasi, data tabel sederhana, atau fenomena aktual) terutama pada soal MOTS dan HOTS${isDiagnostikAKM ? ' serta tekankan literasi membaca dan numerasi model AKM' : ''}.
- Buat pengecoh (distractor) pada soal pilihan ganda yang homogen secara panjang dan struktur, masuk akal, dan tidak memberi petunjuk jawaban.
- Untuk rumus matematika atau simbol sains (jika mapel eksakta/IPA), tuliskan memakai karakter Unicode yang jelas terbaca di HTML dan Microsoft Word (misal: ×, ÷, ±, ≤, ≥, ≠, √, π, °, Δ, ², ³, H₂O, CO₂, →).
${
  config.sumberMateri.trim()
    ? '- PENTING: Guru melampirkan Sumber Materi/Ringkasan Modul Ajar. Pastikan 100% butir soal mengacu langsung pada konsep dan fakta dari sumber materi tersebut tanpa menyimpang.'
    : ''
}
${
  config.sertakanVisual
    ? '- Opsi Visual Aktif: Untuk beberapa butir soal yang membutuhkan penyajian data atau ilustrasi konsep, isi field "visualHtml" dengan tabel HTML berstruktur rapi (<table><thead><tr><th>...</th></tr></thead><tbody>...</tbody></table>) ATAU diagram SVG sederhana (viewBox="0 0 420 220", tanpa script atau event handler). Kosongkan "visualHtml" jika soal tidak memerlukannya.'
    : '- Kosongkan field "visualHtml" (string kosong "") untuk semua soal.'
}`;

    const userPrompt = `Susun perangkat asesmen lengkap dengan spesifikasi tepat berikut:
- Jenis Asesmen: ${jenisObj ? jenisObj.fullLabel : config.jenisAsesmen}
- Jenjang / Kelas / Fase: ${currentJenjang.label} / ${currentKelasObj.label} (${currentKelasObj.fase})
- Mata Pelajaran: ${config.mapel}
- Alokasi Waktu: ${config.jumlahJP} JP (${totalMenit} Menit)
- Topik / Materi Pokok: ${config.topik}
- Capaian Pembelajaran (CP): ${config.cp || 'Sesuaikan dengan regulasi CP terbaru'}
- Tujuan Pembelajaran (TP): ${config.tp || 'Sesuaikan dengan topik'}
- Proporsi Level Kognitif: LOTS ${config.proporsiKognitif.lots}%, MOTS ${config.proporsiKognitif.mots}%, HOTS ${config.proporsiKognitif.hots}%
- Komposisi Butir Soal (Harus tepat ${totalSoalConfig} butir):
${komposisiText}
${config.sumberMateri.trim() ? `\nSumber Materi Guru (Wajib Jadi Acuan Utama):\n"""\n${config.sumberMateri.trim().slice(0, 14000)}\n"""` : ''}

Aturan Khusus per Tipe Soal:
1. PG (Pilihan Ganda): WAJIB memberikan tepat ${jumlahOpsiPG} opsi (${jumlahOpsiPG === 4 ? 'A. sampai D.' : 'A. sampai E.'}) dengan 1 jawaban benar.
2. PGK (Pilihan Ganda Kompleks): Berikan 4-5 pernyataan berawalan huruf A., B., C., D. (dan E.), dengan lebih dari 1 jawaban benar (tulis semua huruf & jawaban benar pada kunciJawaban).
3. BS (Benar / Salah): Berikan stimulus kontekstual dan pernyataan yang dinilai Benar atau Salah pada pertanyaan, kosongkan array opsi, dan cantumkan Benar/Salah beserta alasan singkat di kunciJawaban.
4. JODOH (Menjodohkan): Isi array "premis" (misal 3-4 item bernomor 1, 2, 3...) dan array "respon" (pilihan berhuruf A, B, C, D... termasuk 1 pengecoh bila perlu) secara terstruktur, dan tulis pasangan yang benar di kunciJawaban (misal "1-C, 2-A, 3-D").
5. ISIAN (Isian Singkat): Pertanyaan menuntut jawaban singkat dan pasti. Kosongkan array opsi.
6. URAIAN (Uraian / Esai): Pertanyaan analitis/pemecahan masalah disertai langkah penyelesaian dan rubrik penskoran rinci. Kosongkan array opsi.`;

    const responseSchema = {
      type: 'OBJECT',
      properties: {
        judulAsesmen: { type: 'STRING' },
        petunjukUmum: { type: 'ARRAY', items: { type: 'STRING' } },
        daftarSoal: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              nomor: { type: 'INTEGER' },
              tipe: {
                type: 'STRING',
                description: 'Salah satu dari: PG, PGK, BS, JODOH, ISIAN, URAIAN'
              },
              tipeLabel: { type: 'STRING' },
              levelKognitif: {
                type: 'STRING',
                description: 'LOTS (C1-C2), MOTS (C3), atau HOTS (C4-C6)'
              },
              indikatorSoal: {
                type: 'STRING',
                description: 'Indikator soal operasional untuk tabel kisi-kisi'
              },
              materi: { type: 'STRING' },
              stimulus: {
                type: 'STRING',
                description: 'Teks pengantar/studi kasus/fenomena kontekstual (kosongkan jika tidak perlu)'
              },
              visualHtml: {
                type: 'STRING',
                description: 'Tabel HTML atau SVG sederhana untuk grafik/data stimulus (kosongkan "" jika tidak diperlukan)'
              },
              pertanyaan: { type: 'STRING' },
              opsi: {
                type: 'ARRAY',
                items: { type: 'STRING' },
                description: 'Opsi PG/PGK berawalan A., B., C., ... Kosongkan [] untuk tipe selain PG/PGK.'
              },
              premis: {
                type: 'ARRAY',
                items: { type: 'STRING' },
                description: 'Daftar premis bernomor khusus untuk tipe JODOH. Kosongkan [] untuk tipe lain.'
              },
              respon: {
                type: 'ARRAY',
                items: { type: 'STRING' },
                description: 'Daftar pilihan respon berhuruf khusus untuk tipe JODOH. Kosongkan [] untuk tipe lain.'
              },
              kunciJawaban: { type: 'STRING' },
              pembahasan: { type: 'STRING' },
              pedomanPenskoran: { type: 'STRING' },
              skorMaksimal: { type: 'INTEGER' }
            },
            required: [
              'nomor',
              'tipe',
              'tipeLabel',
              'levelKognitif',
              'indikatorSoal',
              'materi',
              'pertanyaan',
              'kunciJawaban',
              'pembahasan',
              'pedomanPenskoran',
              'skorMaksimal'
            ]
          }
        }
      },
      required: ['judulAsesmen', 'petunjukUmum', 'daftarSoal']
    };

    try {
      const data = await callGeminiWithBackoff(
        {
          contents: [{ parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema
          }
        },
        { apiKey, model: selectedModel }
      );

      const normalizedSoal = (data.daftarSoal || []).map((s, idx) => ({
        ...s,
        nomor: idx + 1,
        stimulus: s.stimulus || '',
        visualHtml: config.sertakanVisual ? sanitizeVisualHtml(s.visualHtml || '') : '',
        opsi: Array.isArray(s.opsi) ? s.opsi : [],
        premis: Array.isArray(s.premis) ? s.premis : [],
        respon: Array.isArray(s.respon) ? s.respon : []
      }));

      setHasilAsesmen({
        judulAsesmen: data.judulAsesmen || `${config.jenisAsesmen} ${config.mapel}`,
        petunjukUmum: Array.isArray(data.petunjukUmum) ? data.petunjukUmum : [],
        daftarSoal: normalizedSoal,
        paketAktif: 'UTAMA',
        paketStorage: {
          UTAMA: normalizedSoal,
          A: null,
          B: null
        },
        generatedAt: new Date().toLocaleString('id-ID'),
        regulasiCP: acuanCPAktif
      });
      setActiveTab('naskah');
      showToast(
        'success',
        `Berhasil menyusun ${normalizedSoal.length} butir soal lengkap dengan Kisi-Kisi, Kartu Soal, dan Rubrik!`
      );
    } catch (error) {
      showToast('error', `Gagal menghasilkan perangkat asesmen: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // ==========================================================================
  // REGENERASI 1 BUTIR SOAL DENGAN INSTRUKSI KHUSUS
  // ==========================================================================
  const handleConfirmRegenerateSingleSoal = async () => {
    if (regenModalIndex === null || !hasilAsesmen) return;
    const index = regenModalIndex;
    const targetSoal = hasilAsesmen.daftarSoal[index];
    if (!targetSoal) return;

    const customInstr = regenInstruction.trim();
    setRegenModalIndex(null);
    setRegeneratingIndex(index);

    const systemPrompt = `Anda adalah pakar asesmen pendidikan nasional Indonesia.
Gunakan Bahasa Indonesia baku sesuai EYD V, stimulus kontekstual, serta simbol/rumus Unicode yang rapi.
${
  config.sumberMateri.trim()
    ? 'Pastikan soal baru tetap mengacu pada sumber materi yang disediakan guru.'
    : ''
}`;

    const prompt = `Buatkan 1 butir soal pengganti yang baru dan berbeda untuk menggantikan soal nomor ${targetSoal.nomor}:
- Jenjang / Kelas: ${currentJenjang.label} / ${currentKelasObj.label} (${currentKelasObj.fase})
- Mata Pelajaran: ${config.mapel}
- Topik: ${config.topik}
- Tipe Soal: ${targetSoal.tipeLabel} (${targetSoal.tipe})
${targetSoal.tipe === 'PG' ? `- Jumlah Opsi PG: Wajib tepat ${jumlahOpsiPG} opsi (${jumlahOpsiPG === 4 ? 'A-D' : 'A-E'})` : ''}
- Level Kognitif Awal: ${targetSoal.levelKognitif}
- Skor Maksimal: ${targetSoal.skorMaksimal}
- Instruksi Khusus Guru: ${customInstr || 'Buat variasi baru yang setara, kontekstual, dan segar'}
- Soal lama (jangan diulang): "${targetSoal.pertanyaan}"
${config.sertakanVisual ? '- Anda boleh menyertakan tabel HTML atau SVG sederhana di field visualHtml bila sesuai.' : '- Kosongkan field visualHtml ("").'}
${config.sumberMateri.trim() ? `\nSumber Materi:\n${config.sumberMateri.trim().slice(0, 6000)}` : ''}`;

    const singleSchema = {
      type: 'OBJECT',
      properties: {
        tipe: { type: 'STRING' },
        tipeLabel: { type: 'STRING' },
        levelKognitif: { type: 'STRING' },
        indikatorSoal: { type: 'STRING' },
        materi: { type: 'STRING' },
        stimulus: { type: 'STRING' },
        visualHtml: { type: 'STRING' },
        pertanyaan: { type: 'STRING' },
        opsi: { type: 'ARRAY', items: { type: 'STRING' } },
        premis: { type: 'ARRAY', items: { type: 'STRING' } },
        respon: { type: 'ARRAY', items: { type: 'STRING' } },
        kunciJawaban: { type: 'STRING' },
        pembahasan: { type: 'STRING' },
        pedomanPenskoran: { type: 'STRING' },
        skorMaksimal: { type: 'INTEGER' }
      },
      required: [
        'tipe',
        'tipeLabel',
        'levelKognitif',
        'indikatorSoal',
        'materi',
        'pertanyaan',
        'kunciJawaban',
        'pembahasan',
        'pedomanPenskoran',
        'skorMaksimal'
      ]
    };

    try {
      const newSoal = await callGeminiWithBackoff(
        {
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: singleSchema
          }
        },
        { apiKey, model: selectedModel }
      );

      updateActiveDaftarSoal((prevList) => {
        const updated = [...prevList];
        updated[index] = {
          ...newSoal,
          nomor: targetSoal.nomor,
          stimulus: newSoal.stimulus || '',
          visualHtml: config.sertakanVisual ? sanitizeVisualHtml(newSoal.visualHtml || '') : '',
          opsi: Array.isArray(newSoal.opsi) ? newSoal.opsi : [],
          premis: Array.isArray(newSoal.premis) ? newSoal.premis : [],
          respon: Array.isArray(newSoal.respon) ? newSoal.respon : []
        };
        return updated;
      });
      showToast('success', `Soal nomor ${targetSoal.nomor} berhasil diganti dengan variasi baru.`);
    } catch (error) {
      showToast('error', `Gagal mengganti soal: ${error.message}`);
    } finally {
      setRegeneratingIndex(null);
      setRegenInstruction('');
    }
  };

  // ==========================================================================
  // MANIPULASI BUTIR SOAL (EDIT IMMUTABLE, GESER, HAPUS, TAMBAH, PAKET A/B)
  // ==========================================================================
  const updateActiveDaftarSoal = (updaterFn) => {
    setHasilAsesmen((prev) => {
      if (!prev) return prev;
      const nextList = updaterFn(prev.daftarSoal).map((s, idx) => ({
        ...s,
        nomor: idx + 1
      }));
      const activeKey = prev.paketAktif || 'UTAMA';
      return {
        ...prev,
        daftarSoal: nextList,
        paketStorage: {
          ...(prev.paketStorage || { UTAMA: nextList, A: null, B: null }),
          [activeKey]: nextList
        }
      };
    });
  };

  const handleUpdateSoalField = (idx, field, value) => {
    updateActiveDaftarSoal((list) =>
      list.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const handleMoveSoal = (idx, direction) => {
    const targetIdx = idx + direction;
    if (!hasilAsesmen || targetIdx < 0 || targetIdx >= hasilAsesmen.daftarSoal.length) {
      return;
    }
    setEditingIndex(null);
    updateActiveDaftarSoal((list) => {
      const next = [...list];
      [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
      return next;
    });
  };

  const handleDeleteSoal = (idx) => {
    if (!hasilAsesmen) return;
    if (hasilAsesmen.daftarSoal.length <= 1) {
      showToast('error', 'Minimal harus terdapat 1 butir soal dalam perangkat asesmen.');
      return;
    }
    setEditingIndex(null);
    updateActiveDaftarSoal((list) => list.filter((_, i) => i !== idx));
    showToast('success', 'Butir soal berhasil dihapus dan penomoran diperbarui.');
  };

  const handleAddManualSoal = () => {
    if (!hasilAsesmen) return;
    const tipeConfig =
      config.komposisiSoal.find((k) => k.id === newSoalTipe) || config.komposisiSoal[0];
    const letters = jumlahOpsiPG === 4 ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C', 'D', 'E'];

    const templateSoal = {
      nomor: hasilAsesmen.daftarSoal.length + 1,
      tipe: newSoalTipe,
      tipeLabel: tipeConfig ? tipeConfig.label : newSoalTipe,
      levelKognitif: 'MOTS (C3)',
      indikatorSoal: 'Peserta didik mampu menganalisis konsep sesuai topik pembelajaran.',
      materi: config.topik || 'Materi Pokok',
      stimulus: '',
      visualHtml: '',
      pertanyaan: 'Tuliskan rumusan pertanyaan baru di sini...',
      opsi:
        newSoalTipe === 'PG' || newSoalTipe === 'PGK'
          ? letters.map((l) => `${l}. Pilihan jawaban ${l}`)
          : [],
      premis: newSoalTipe === 'JODOH' ? ['1. Premis pertama', '2. Premis kedua'] : [],
      respon:
        newSoalTipe === 'JODOH'
          ? ['A. Pilihan respon A', 'B. Pilihan respon B', 'C. Pengecoh C']
          : [],
      kunciJawaban: newSoalTipe === 'PG' ? 'A. Pilihan jawaban A' : 'Tuliskan kunci jawaban',
      pembahasan: 'Tuliskan pembahasan ringkas dan jelas.',
      pedomanPenskoran: 'Skor penuh apabila jawaban tepat dan sesuai kriteria.',
      skorMaksimal: Number(tipeConfig?.bobot || 2)
    };

    const newIndex = hasilAsesmen.daftarSoal.length;
    updateActiveDaftarSoal((list) => [...list, templateSoal]);
    setEditingIndex(newIndex);
    setActiveTab('naskah');
    showToast('success', `Soal manual baru (${templateSoal.tipeLabel}) ditambahkan ke nomor ${newIndex + 1}.`);
  };

  const handleGeneratePaketAB = () => {
    if (!hasilAsesmen) return;
    const baseList = hasilAsesmen.paketStorage?.UTAMA || hasilAsesmen.daftarSoal;
    const paketA = buildShuffledPaket(baseList);
    let paketB = buildShuffledPaket(baseList);

    const sig = (arr) =>
      arr.map((s) => `${s.pertanyaan}|${(s.opsi || []).join(',')}`).join('||');
    const sigA = sig(paketA);
    let guard = 0;
    while (sig(paketB) === sigA && guard < 5 && baseList.length > 1) {
      paketB = buildShuffledPaket(baseList);
      guard += 1;
    }

    setEditingIndex(null);
    setHasilAsesmen((prev) => ({
      ...prev,
      paketAktif: 'A',
      daftarSoal: paketA,
      paketStorage: {
        UTAMA: baseList,
        A: paketA,
        B: paketB
      }
    }));
    showToast(
      'success',
      'Paket A dan Paket B berhasil dibuat dengan urutan soal & opsi PG/PGK teracak otomatis!'
    );
  };

  const handleSwitchPaket = (paketKey) => {
    if (!hasilAsesmen?.paketStorage?.[paketKey]) return;
    setEditingIndex(null);
    setHasilAsesmen((prev) => ({
      ...prev,
      paketAktif: paketKey,
      daftarSoal: prev.paketStorage[paketKey]
    }));
  };

  // ==========================================================================
  // MANAJEMEN PROYEK (LOCALSTORAGE + EKSPOR/IMPOR JSON)
  // ==========================================================================
  const persistProjects = (projects) => {
    setSavedProjects(projects);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      showToast('error', 'Penyimpanan browser penuh atau dibatasi.');
    }
  };

  const handleSaveProject = () => {
    const cleanTopik = config.topik.trim() || 'Tanpa Topik';
    const projectName = `${config.jenisAsesmen} ${config.mapel} (${currentKelasObj.label}) - ${cleanTopik.slice(0, 32)}`;
    const newProject = {
      id: Date.now().toString(),
      name: projectName,
      savedAt: new Date().toLocaleString('id-ID'),
      config,
      hasilAsesmen
    };
    persistProjects([newProject, ...savedProjects]);
    showToast('success', 'Proyek asesmen berhasil disimpan ke penyimpanan browser.');
  };

  const handleLoadProject = (proj) => {
    const rawCfg = proj.config || {};
    const validJenjang = JENJANG_CONFIG[rawCfg.jenjang] ? rawCfg.jenjang : DEFAULT_CONFIG.jenjang;
    const validKelasList = JENJANG_CONFIG[validJenjang].kelasList;
    const validKelas = validKelasList.some((k) => k.id === rawCfg.kelas)
      ? rawCfg.kelas
      : validKelasList[0].id;
    const validMapels = getDaftarMapel(validJenjang, validKelas);
    const validMapel = validMapels.includes(rawCfg.mapel)
      ? rawCfg.mapel
      : validMapels[0] || '';

    setConfig({
      ...DEFAULT_CONFIG,
      ...rawCfg,
      jenjang: validJenjang,
      kelas: validKelas,
      mapel: validMapel,
      proporsiKognitif: {
        ...DEFAULT_CONFIG.proporsiKognitif,
        ...(rawCfg.proporsiKognitif || {})
      },
      komposisiSoal:
        Array.isArray(rawCfg.komposisiSoal) && rawCfg.komposisiSoal.length > 0
          ? rawCfg.komposisiSoal
          : TIPE_SOAL_DEFAULT
    });

    if (proj.hasilAsesmen) {
      const loadedSoal = proj.hasilAsesmen.daftarSoal || [];
      setHasilAsesmen({
        ...proj.hasilAsesmen,
        paketAktif: proj.hasilAsesmen.paketAktif || 'UTAMA',
        paketStorage: proj.hasilAsesmen.paketStorage || {
          UTAMA: loadedSoal,
          A: null,
          B: null
        }
      });
    } else {
      setHasilAsesmen(null);
    }

    setShowProjectsModal(false);
    setEditingIndex(null);
    showToast('success', `Proyek "${proj.name}" berhasil dimuat.`);
  };

  const handleDeleteProject = (id) => {
    const updated = savedProjects.filter((p) => p.id !== id);
    persistProjects(updated);
    showToast('success', 'Proyek dihapus dari daftar tersimpan.');
  };

  const handleResetProject = () => {
    setHasilAsesmen(null);
    setEditingIndex(null);
    setConfig((prev) => ({
      ...prev,
      topik: '',
      cp: '',
      tp: '',
      sumberMateri: ''
    }));
    setOpenSection(2);
    showToast('success', 'Lembar kerja baru siap digunakan.');
  };

  const handleExportProjectJson = () => {
    const payload = {
      app: 'GENERATOR SOAL ASESMEN PRO',
      version: 2,
      exportedAt: new Date().toISOString(),
      config,
      hasilAsesmen
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Proyek_Asesmen_${config.jenisAsesmen}_${config.mapel.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('success', 'File proyek (.json) berhasil diekspor.');
  };

  const handleImportProjectJson = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        if (!parsed || typeof parsed !== 'object' || !parsed.config) {
          throw new Error('Struktur file JSON proyek tidak valid.');
        }
        handleLoadProject(parsed);
        showToast('success', `Berhasil mengimpor proyek dari "${file.name}".`);
      } catch (err) {
        showToast('error', `Gagal mengimpor file JSON: ${err.message}`);
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  // ==========================================================================
  // CETAK PDF, WORD (.DOC), CSV KUIS & PENGATURAN API
  // ==========================================================================
  const handleTriggerPrint = (mode) => {
    setPrintMode(mode);
    setShowPrintModal(false);
    setEditingIndex(null);
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        setTimeout(() => {
          window.print();
        }, 120);
      });
    }
  };

  const handleTriggerWord = async (mode) => {
    setShowWordModal(false);
    setIsExportingWord(true);
    try {
      await generateWordDocument(mode, {
        config,
        hasilAsesmen,
        currentJenjang,
        currentKelasObj,
        totalMenit,
        actualTotalSkorMaks
      });
      showToast(
        'success',
        mode === 'lengkap'
          ? 'Perangkat lengkap Microsoft Word (.doc) berhasil diunduh.'
          : 'Naskah Soal Siswa Microsoft Word (.doc) berhasil diunduh.'
      );
    } catch (error) {
      showToast('error', `Gagal mengekspor dokumen Word: ${error.message}`);
    } finally {
      setIsExportingWord(false);
    }
  };

  const handleExportCsv = () => {
    if (!hasilAsesmen) return;
    const suffixPaket =
      hasilAsesmen.paketAktif && hasilAsesmen.paketAktif !== 'UTAMA'
        ? `_Paket_${hasilAsesmen.paketAktif}`
        : '';
    const ok = exportPGToCsv(
      hasilAsesmen.daftarSoal,
      `Kuis_PG_${config.mapel.replace(/[^a-zA-Z0-9]/g, '_')}_${currentKelasObj.id}${suffixPaket}.csv`
    );
    if (ok) {
      showToast('success', 'File CSV kuis (PG) siap impor Quizizz/Kahoot/Google Forms berhasil diunduh.');
    } else {
      showToast('error', 'Tidak ditemukan soal bertipe Pilihan Ganda (PG) untuk diekspor ke CSV.');
    }
  };

  const handleSaveApiSettings = () => {
    try {
      localStorage.setItem(API_KEY_STORAGE, apiKey.trim());
      localStorage.setItem(MODEL_STORAGE, selectedModel);
      setShowApiModal(false);
      showToast('success', 'Pengaturan Gemini API & model berhasil disimpan.');
    } catch (e) {
      setShowApiModal(false);
      showToast('success', 'Pengaturan model diterapkan untuk sesi ini.');
    }
  };

  const isPrintLengkap = printMode === 'lengkap';
  const nilaiSimulasi = Math.min(
    100,
    Math.round(((Number(skorSimulasi) || 0) / actualTotalSkorMaks) * 100)
  );
  const predikatSimulasi =
    nilaiSimulasi >= 90
      ? 'Sangat Baik (A)'
      : nilaiSimulasi >= 78
        ? 'Baik (B)'
        : nilaiSimulasi >= 65
          ? 'Cukup (C)'
          : 'Perlu Bimbingan (D)';

  // ==========================================================================
  // RENDER ANTARMUKA PENGGUNA
  // ==========================================================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* CSS Khusus Cetak (@media print) */}
      <style>{`
        @media print {
          @page { size: A4; margin: 1.5cm; }
          body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-hide { display: none !important; }
          .print-section { display: block !important; }
          .print-only-block { display: block !important; }
          .print-container {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .page-break-print { page-break-before: always; break-before: page; }
          .avoid-break { page-break-inside: avoid; break-inside: avoid; }
          table { border-collapse: collapse !important; width: 100% !important; }
          th, td { border: 1px solid #1e293b !important; padding: 6px !important; }
        }
      `}</style>

      {/* HEADER UTAMA */}
      <header className="no-print bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg border-b border-indigo-800/50 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/20 border border-indigo-400/30 p-2.5 rounded-xl">
              <GraduationCap className="w-7 h-7 text-indigo-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                  GENERATOR SOAL ASESMEN PRO
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  by E-Geo
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300">
                Naskah, Kisi-Kisi, Kartu Soal &amp; Rubrik (SD/SMP/SMA) • Kurikulum Nasional 2025/2026
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowRegulasiModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Informasi Acuan Regulasi Kurikulum"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Regulasi</span>
            </button>
            <button
              type="button"
              onClick={() => setShowApiModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Pengaturan Gemini API Key & Model"
            >
              <Key className="w-4 h-4 text-indigo-300" />
              <span className="hidden md:inline">API &amp; Model</span>
            </button>
            <button
              type="button"
              onClick={handleResetProject}
              className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <RotateCcw className="w-4 h-4 text-rose-400" />
              <span>Baru</span>
            </button>
            <button
              type="button"
              onClick={handleSaveProject}
              className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Save className="w-4 h-4 text-emerald-400" />
              <span>Simpan</span>
            </button>
            <button
              type="button"
              onClick={() => setShowProjectsModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Proyek ({savedProjects.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* NOTIFIKASI TOAST */}
      {notification && (
        <div className="no-print fixed bottom-5 right-5 z-50 max-w-md transition-all">
          <div
            className={`flex items-start gap-3 p-4 rounded-xl shadow-2xl border ${
              notification.type === 'success'
                ? 'bg-emerald-950 text-emerald-50 border-emerald-700'
                : 'bg-rose-950 text-rose-50 border-rose-700'
            }`}
          >
            {notification.type === 'success' ? (
              <CircleCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <CircleAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs sm:text-sm font-medium leading-snug">
              {notification.message}
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-white shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* KONTEN UTAMA: 2 KOLOM RESPONSIF */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================================================================ */}
        {/* PANEL KIRI: KONFIGURASI BERTAHAP (ACCORDION 3 LANGKAH)           */}
        {/* ================================================================ */}
        <section className="no-print lg:col-span-5 space-y-4">
          {/* ACCORDION 1: IDENTITAS, KOP SURAT & KURIKULUM */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenSection(openSection === 1 ? 0 : 1)}
              className="w-full px-5 py-3.5 flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/70 border-b border-slate-100 transition text-left"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <div>
                  <h2 className="font-bold text-slate-800 text-sm">
                    Identitas, Kop Surat &amp; Kurikulum
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    {currentJenjang.label} • {currentKelasObj.label} ({currentKelasObj.fase}) • {totalMenit} Menit
                  </p>
                </div>
              </div>
              {openSection === 1 ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {openSection === 1 && (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Nama Satuan Pendidikan
                    </label>
                    <input
                      type="text"
                      value={config.namaSekolah}
                      onChange={(e) => setConfig({ ...config, namaSekolah: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Sub-Kop / Alamat Sekolah (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Jl. Pendidikan No. 1 • Telp / Email / Website"
                      value={config.subKopSekolah}
                      onChange={(e) => setConfig({ ...config, subKopSekolah: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Tahun Ajaran
                    </label>
                    <input
                      type="text"
                      value={config.tahunAjaran}
                      onChange={(e) => setConfig({ ...config, tahunAjaran: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Semester
                    </label>
                    <select
                      value={config.semester}
                      onChange={(e) => setConfig({ ...config, semester: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="Ganjil">Ganjil</option>
                      <option value="Genap">Genap</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Nama Penyusun / Guru
                    </label>
                    <input
                      type="text"
                      value={config.penyusun}
                      onChange={(e) => setConfig({ ...config, penyusun: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Kepala Sekolah (Tanda Tangan)
                    </label>
                    <input
                      type="text"
                      value={config.namaKepalaSekolah}
                      onChange={(e) =>
                        setConfig({ ...config, namaKepalaSekolah: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                {/* Upload Logo Sekolah */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {config.logoSekolah ? (
                      <img
                        src={config.logoSekolah}
                        alt="Logo Sekolah"
                        className="w-11 h-11 object-contain rounded-lg bg-white border border-slate-200 p-1"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-lg bg-slate-200/70 text-slate-400 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        Logo Satuan Pendidikan (Opsional)
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Tampil pada Kop Naskah Cetak &amp; Word (.doc)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{config.logoSekolah ? 'Ganti' : 'Unggah'}</span>
                    </button>
                    {config.logoSekolah && (
                      <button
                        type="button"
                        onClick={() => setConfig({ ...config, logoSekolah: '' })}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition"
                        title="Hapus Logo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Jenis Asesmen (5 Jenis) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Jenis Asesmen
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {JENIS_ASESMEN.map((item, idx) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setConfig({ ...config, jenisAsesmen: item.id })}
                        className={`p-2.5 text-left rounded-xl border text-xs transition ${
                          idx === 4 ? 'col-span-2' : ''
                        } ${
                          config.jenisAsesmen === item.id
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-900 font-semibold shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-bold">{item.label}</div>
                        <div className="text-[10px] opacity-80 truncate">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Jenjang, Kelas & JP */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Jenjang
                    </label>
                    <select
                      value={config.jenjang}
                      onChange={(e) => handleJenjangChange(e.target.value)}
                      className="w-full px-2.5 py-2 text-sm rounded-lg border border-slate-300 bg-white font-medium"
                    >
                      {Object.entries(JENJANG_CONFIG).map(([key, val]) => (
                        <option key={key} value={key}>
                          {val.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Kelas
                    </label>
                    <select
                      value={config.kelas}
                      onChange={(e) => handleKelasChange(e.target.value)}
                      className="w-full px-2.5 py-2 text-sm rounded-lg border border-slate-300 bg-white font-medium"
                    >
                      {currentJenjang.kelasList.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Jumlah JP
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={config.jumlahJP}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          jumlahJP: Math.max(1, parseInt(e.target.value, 10) || 1)
                        })
                      }
                      className="w-full px-2.5 py-2 text-sm rounded-lg border border-slate-300 font-medium"
                    />
                  </div>
                </div>

                {/* Banner Fase, Total Menit & Opsi PG */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-indigo-50/80 border border-indigo-100 rounded-xl px-3.5 py-2.5 text-xs">
                  <div className="flex items-center gap-1.5 text-indigo-900 font-semibold">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>{currentKelasObj.fase}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-indigo-700 border border-indigo-200">
                      PG: {jumlahOpsiPG} Opsi
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-indigo-800 font-medium">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>
                      {config.jumlahJP} JP × {currentJenjang.menitPerJP} mnt ={' '}
                      <strong>{totalMenit} Menit</strong>
                    </span>
                  </div>
                </div>

                {/* Daftar Mata Pelajaran Dinamis */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Mata Pelajaran ({daftarMapel.length} Mapel Sesuai Regulasi)
                  </label>
                  <select
                    value={config.mapel}
                    onChange={(e) => setConfig({ ...config, mapel: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {daftarMapel.map((m, idx) => (
                      <option key={idx} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>

                  <div
                    className={`mt-2 px-3 py-2 rounded-lg border text-[11px] flex items-start gap-2 ${
                      isPAI
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <ShieldCheck
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        isPAI ? 'text-emerald-600' : 'text-indigo-500'
                      }`}
                    />
                    <div>
                      <span className="font-semibold">Acuan CP Otomatis: </span>
                      <span>{acuanCPAktif}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ACCORDION 2: MATERI, AUTO-CP/TP & SUMBER AJAR */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenSection(openSection === 2 ? 0 : 2)}
              className="w-full px-5 py-3.5 flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/70 border-b border-slate-100 transition text-left"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <div>
                  <h2 className="font-bold text-slate-800 text-sm">
                    Materi, Auto-CP/TP &amp; Sumber Ajar
                  </h2>
                  <p className="text-[11px] text-slate-500 truncate max-w-[260px]">
                    {config.topik || 'Belum ada topik materi'}
                  </p>
                </div>
              </div>
              {openSection === 2 ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {openSection === 2 && (
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Topik / Materi Pokok <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Dinamika Litosfer / Pecahan Senilai / Teks Eksposisi"
                    value={config.topik}
                    onChange={(e) => setConfig({ ...config, topik: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* Tombol Bantu Rumuskan CP & TP */}
                <button
                  type="button"
                  onClick={handleGenerateCPTP}
                  disabled={isGeneratingCPTP}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold text-xs flex items-center justify-center gap-2 transition disabled:opacity-60"
                >
                  {isGeneratingCPTP ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-700" />
                      <span>Merumuskan CP &amp; TP dari Regulasi...</span>
                    </>
                  ) : (
                    <>
                      <WandSparkles className="w-4 h-4 text-amber-600" />
                      <span>Bantu Rumuskan CP &amp; TP Otomatis (AI)</span>
                    </>
                  )}
                </button>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Capaian Pembelajaran (CP)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Salin CP atau klik tombol Bantu Rumuskan CP & TP di atas..."
                    value={config.cp}
                    onChange={(e) => setConfig({ ...config, cp: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Tujuan Pembelajaran (TP)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tuliskan indikator/tujuan pembelajaran yang diujikan..."
                    value={config.tp}
                    onChange={(e) => setConfig({ ...config, tp: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* Context Box Sumber Materi */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-700">
                      Sumber Materi / Ringkasan Modul Ajar (Opsional)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        ref={materiFileInputRef}
                        type="file"
                        accept=".txt,.md,.csv,text/plain"
                        onChange={handleMateriFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => materiFileInputRef.current?.click()}
                        className="px-2 py-1 rounded-md bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Muat .txt/.md</span>
                      </button>
                      {config.sumberMateri && (
                        <button
                          type="button"
                          onClick={() => setConfig({ ...config, sumberMateri: '' })}
                          className="px-2 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-semibold"
                        >
                          Bersihkan
                        </button>
                      )}
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Tempelkan ringkasan materi buku ajar, catatan guru, atau modul ajar di sini agar seluruh soal yang disusun AI 100% mengacu pada materi tersebut..."
                    value={config.sumberMateri}
                    onChange={(e) => setConfig({ ...config, sumberMateri: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>
                      {config.sumberMateri.trim()
                        ? 'Mode Terkunci Materi Aktif: AI mengacu langsung pada teks ini.'
                        : 'Kosongkan jika ingin AI menyusun berdasarkan kurikulum nasional.'}
                    </span>
                    <span>{config.sumberMateri.length.toLocaleString('id-ID')} karakter</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ACCORDION 3: DISTRIBUSI KOGNITIF, KOMPOSISI & EKSEKUSI AI */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenSection(openSection === 3 ? 0 : 3)}
              className="w-full px-5 py-3.5 flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/70 border-b border-slate-100 transition text-left"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <div>
                  <h2 className="font-bold text-slate-800 text-sm">
                    Level Kognitif, Komposisi &amp; Generate
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    {totalSoalConfig} Butir Soal • Maks {totalSkorConfig} Poin
                  </p>
                </div>
              </div>
              {openSection === 3 ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {openSection === 3 && (
              <div className="p-5 space-y-4">
                {/* Proporsi Kognitif + Indikator Validasi 100% */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <label className="text-xs font-semibold text-slate-600">
                      Distribusi Level Kognitif (%)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                          isProporsiValid
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        Total: {totalProporsi}% {isProporsiValid ? '(Valid)' : '(Harus 100%)'}
                      </span>
                      {!isProporsiValid && (
                        <button
                          type="button"
                          onClick={handleNormalizeProporsi}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                        >
                          Sesuaikan 100%
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'lots', label: 'LOTS (C1-C2)', color: 'text-emerald-700' },
                      { key: 'mots', label: 'MOTS (C3)', color: 'text-amber-700' },
                      { key: 'hots', label: 'HOTS (C4-C6)', color: 'text-rose-700' }
                    ].map((lvl) => (
                      <div
                        key={lvl.key}
                        className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-center"
                      >
                        <span className="block text-[10px] font-bold text-slate-500">
                          {lvl.label}
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={config.proporsiKognitif[lvl.key]}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              proporsiKognitif: {
                                ...config.proporsiKognitif,
                                [lvl.key]: Math.max(0, parseInt(e.target.value, 10) || 0)
                              }
                            })
                          }
                          className={`w-full text-center font-bold text-sm bg-transparent mt-0.5 outline-none ${lvl.color}`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Bar Visual Proporsi & Preset */}
                  <div className="mt-2 h-2 w-full rounded-full overflow-hidden bg-slate-200 flex">
                    <div
                      className="bg-emerald-500 transition-all"
                      style={{
                        width: `${totalProporsi > 0 ? (config.proporsiKognitif.lots / Math.max(totalProporsi, 100)) * 100 : 0}%`
                      }}
                    />
                    <div
                      className="bg-amber-500 transition-all"
                      style={{
                        width: `${totalProporsi > 0 ? (config.proporsiKognitif.mots / Math.max(totalProporsi, 100)) * 100 : 0}%`
                      }}
                    />
                    <div
                      className="bg-rose-500 transition-all"
                      style={{
                        width: `${totalProporsi > 0 ? (config.proporsiKognitif.hots / Math.max(totalProporsi, 100)) * 100 : 0}%`
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-slate-500">Preset cepat:</span>
                    {[
                      { label: '30/40/30', lots: 30, mots: 40, hots: 30 },
                      { label: '20/30/50 (HOTS)', lots: 20, mots: 30, hots: 50 },
                      { label: '50/30/20 (Dasar)', lots: 50, mots: 30, hots: 20 }
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() =>
                          setConfig({
                            ...config,
                            proporsiKognitif: {
                              lots: preset.lots,
                              mots: preset.mots,
                              hots: preset.hots
                            }
                          })
                        }
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-800 font-medium"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tabel Pengaturan 6 Bentuk Soal */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-600">
                      Komposisi &amp; Bobot 6 Bentuk Soal
                    </label>
                    <span className="text-xs font-bold text-indigo-600">
                      Total: {totalSoalConfig} Butir ({totalSkorConfig} Poin)
                    </span>
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-100 text-slate-600 font-semibold">
                        <tr>
                          <th className="py-2 px-2.5 text-left">Bentuk Soal</th>
                          <th className="py-2 px-1.5 text-center w-16">Jumlah</th>
                          <th className="py-2 px-1.5 text-center w-16">Bobot</th>
                          <th className="py-2 px-2 text-center w-16">Skor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {config.komposisiSoal.map((item, idx) => {
                          const subtotal = (Number(item.jumlah) || 0) * (Number(item.bobot) || 1);
                          return (
                            <tr key={item.id} className="hover:bg-slate-50">
                              <td className="py-2 px-2.5 font-medium text-slate-700">
                                <div>{item.label}</div>
                                {item.id === 'PG' && (
                                  <span className="text-[10px] text-indigo-600 font-semibold">
                                    Otomatis {jumlahOpsiPG} opsi ({jumlahOpsiPG === 4 ? 'A–D' : 'A–E'})
                                  </span>
                                )}
                              </td>
                              <td className="py-1.5 px-1.5 text-center">
                                <input
                                  type="number"
                                  min={0}
                                  max={50}
                                  value={item.jumlah}
                                  onChange={(e) => {
                                    const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                                    const newComp = config.komposisiSoal.map((row, rIdx) =>
                                      rIdx === idx ? { ...row, jumlah: val } : row
                                    );
                                    setConfig({ ...config, komposisiSoal: newComp });
                                  }}
                                  className="w-12 text-center py-1 rounded border border-slate-300 font-semibold"
                                />
                              </td>
                              <td className="py-1.5 px-1.5 text-center">
                                <input
                                  type="number"
                                  min={1}
                                  max={25}
                                  value={item.bobot}
                                  onChange={(e) => {
                                    const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                                    const newComp = config.komposisiSoal.map((row, rIdx) =>
                                      rIdx === idx ? { ...row, bobot: val } : row
                                    );
                                    setConfig({ ...config, komposisiSoal: newComp });
                                  }}
                                  className="w-12 text-center py-1 rounded border border-slate-300 text-slate-600"
                                />
                              </td>
                              <td className="py-1.5 px-2 text-center font-bold text-slate-700">
                                {subtotal}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Toggle Fitur Visual / Tabel Data Sederhana */}
                <label className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50/60 border border-indigo-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.sertakanVisual}
                    onChange={(e) =>
                      setConfig({ ...config, sertakanVisual: e.target.checked })
                    }
                    className="mt-0.5 w-4 h-4 accent-indigo-600 rounded"
                  />
                  <div className="text-xs">
                    <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                      <Table className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Sertakan Visual / Tabel Data Sederhana (SVG / HTML Table)</span>
                    </div>
                    <p className="text-[11px] text-indigo-800/80 mt-0.5">
                      AI otomatis menyisipkan tabel angka atau grafik SVG sederhana pada stimulus soal yang memerlukannya.
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* CTA UTAMA GENERATE (Selalu terlihat di bawah panel kiri) */}
          <button
            type="button"
            onClick={handleGenerateAsesmen}
            disabled={isGenerating}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-60 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition transform active:scale-[0.99]"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Menyusun Perangkat Asesmen...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Perangkat Asesmen Lengkap</span>
              </>
            )}
          </button>
        </section>

        {/* ================================================================ */}
        {/* PANEL KANAN: PRATINJAU 4 TAB, EDITOR & EKSPOR MULTI-FORMAT       */}
        {/* ================================================================ */}
        <section className="lg:col-span-7 flex flex-col">
          {/* Action Bar: 4 Tabs + Paket A/B + Cetak/Word/CSV */}
          <div className="no-print bg-white rounded-2xl shadow-sm border border-slate-200/90 p-3 mb-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* 4 Tab Utama */}
              <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-xl gap-1">
                {[
                  { id: 'naskah', label: 'Naskah Soal', icon: FileText },
                  { id: 'kisikisi', label: 'Kisi-Kisi', icon: Layers },
                  { id: 'kartu', label: 'Kartu Soal', icon: ClipboardList },
                  { id: 'kunci', label: 'Kunci & Rubrik', icon: FileCheck }
                ].map((tab) => {
                  const IconComp = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                        activeTab === tab.id
                          ? 'bg-white text-indigo-700 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tombol Ekspor Multi-Format */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(true)}
                  disabled={!hasilAsesmen}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowWordModal(true)}
                  disabled={!hasilAsesmen || isExportingWord}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExportingWord ? 'Memproses...' : 'Word (.doc)'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  disabled={!hasilAsesmen}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white transition"
                  title="Ekspor soal Pilihan Ganda ke CSV untuk Quizizz / Kahoot / Google Forms"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>CSV Kuis</span>
                </button>
              </div>
            </div>

            {/* Bar Generator Paket A & Paket B */}
            {hasilAsesmen && (
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-500">Varian Naskah:</span>
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
                    {[
                      { id: 'UTAMA', label: 'Utama' },
                      { id: 'A', label: 'Paket A' },
                      { id: 'B', label: 'Paket B' }
                    ].map((pk) => {
                      const available = Boolean(hasilAsesmen.paketStorage?.[pk.id]);
                      return (
                        <button
                          key={pk.id}
                          type="button"
                          disabled={!available}
                          onClick={() => handleSwitchPaket(pk.id)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                            hasilAsesmen.paketAktif === pk.id
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : available
                                ? 'text-slate-700 hover:bg-white'
                                : 'text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {pk.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGeneratePaketAB}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-semibold transition"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Acak Paket A &amp; Paket B</span>
                </button>
              </div>
            )}
          </div>

          {/* KERTAS DOKUMEN PRATINJAU */}
          <div className="print-container flex-1 bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 sm:p-8">
            {!hasilAsesmen && !isGenerating && (
              <div className="min-h-[520px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-xl">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  Siap Menyusun Perangkat Asesmen Pro
                </h3>
                <p className="text-sm text-slate-500 max-w-md mb-4">
                  Lengkapi 3 langkah konfigurasi di panel sebelah kiri (Identitas, Materi/CP/TP, dan Komposisi Soal), lalu klik{' '}
                  <strong>Generate Perangkat Asesmen Lengkap</strong>.
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-[11px] text-slate-600">
                  <span className="px-2.5 py-1 rounded-full bg-slate-100">6 Bentuk Soal</span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100">Kisi-Kisi &amp; Kartu Soal</span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100">Paket A &amp; B Acak</span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100">Ekspor Word / PDF / CSV</span>
                </div>
              </div>
            )}

            {isGenerating && (
              <div className="min-h-[520px] flex flex-col items-center justify-center text-center p-6">
                <div className="relative mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  AI Sedang Menyusun Perangkat Asesmen...
                </h3>
                <p className="text-xs sm:text-sm text-indigo-700 font-medium mt-2 max-w-md">
                  {GENERATING_STEPS[generatingStage]}
                </p>
                <div className="mt-4 flex items-center gap-1.5">
                  {GENERATING_STEPS.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === generatingStage ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-4">
                  Acuan: {REGULASI_INFO.struktur} • {acuanCPAktif}
                </p>
              </div>
            )}

            {hasilAsesmen && !isGenerating && (
              <div className="space-y-6 text-slate-900">
                {/* KOP SURAT RESMI (DENGAN LOGO OPSIONAL) */}
                <div className="border-b-4 border-double border-slate-800 pb-4 flex items-center gap-4">
                  {config.logoSekolah && (
                    <img
                      src={config.logoSekolah}
                      alt="Logo Satuan Pendidikan"
                      className="w-16 h-16 object-contain shrink-0"
                    />
                  )}
                  <div className="flex-1 text-center">
                    <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wide">
                      {config.namaSekolah}
                    </h2>
                    {config.subKopSekolah && (
                      <p className="text-[11px] text-slate-600">{config.subKopSekolah}</p>
                    )}
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
                      <h3 className="text-sm sm:text-base font-bold uppercase text-indigo-950">
                        {hasilAsesmen.judulAsesmen}
                      </h3>
                      {hasilAsesmen.paketAktif && hasilAsesmen.paketAktif !== 'UTAMA' && (
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[11px] font-bold">
                          PAKET {hasilAsesmen.paketAktif}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Tahun Ajaran {config.tahunAjaran} • Semester {config.semester}
                    </p>
                  </div>
                </div>

                {/* TABEL IDENTITAS NASKAH */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between border-b border-slate-200/80 pb-1">
                    <span className="font-semibold text-slate-600">Mata Pelajaran:</span>
                    <span className="font-bold text-right">{config.mapel}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/80 pb-1">
                    <span className="font-semibold text-slate-600">Jenjang / Kelas:</span>
                    <span className="font-bold text-right">
                      {currentJenjang.label} / {currentKelasObj.label} ({currentKelasObj.fase})
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/80 pb-1">
                    <span className="font-semibold text-slate-600">Jenis Asesmen:</span>
                    <span className="font-bold">{config.jenisAsesmen}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/80 pb-1">
                    <span className="font-semibold text-slate-600">Alokasi Waktu:</span>
                    <span className="font-bold">
                      {config.jumlahJP} JP ({totalMenit} Menit)
                    </span>
                  </div>
                  <div className="sm:col-span-2 flex justify-between pt-0.5">
                    <span className="font-semibold text-slate-600">Materi Pokok:</span>
                    <span className="font-bold text-right">{config.topik}</span>
                  </div>
                  {printMode === 'siswa' && (
                    <div className="hidden print-only-block sm:col-span-2 pt-2 mt-1 border-t border-slate-300">
                      <div className="grid grid-cols-2 gap-4 font-semibold">
                        <div>Nama Siswa: ...........................................</div>
                        <div>Kelas / No. Absen: .................. / ........</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ========================================================== */}
                {/* TAB 1: NASKAH SOAL                                         */}
                {/* ========================================================== */}
                <div className={`${activeTab === 'naskah' ? 'block' : 'hidden'} print-section`}>
                  <div className="mb-5 text-xs bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-xl">
                    <p className="font-bold text-slate-800 mb-1">Petunjuk Pengerjaan:</p>
                    <ol className="list-decimal list-inside space-y-0.5 text-slate-700">
                      {(hasilAsesmen.petunjukUmum || []).map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ol>
                  </div>

                  <h4 className="font-bold text-sm uppercase tracking-wider border-b border-slate-300 pb-1.5 mb-4">
                    A. Butir Soal Asesmen ({hasilAsesmen.daftarSoal.length} Butir)
                  </h4>

                  <div className="space-y-5">
                    {hasilAsesmen.daftarSoal.map((soal, idx) => {
                      const isEditing = editingIndex === idx;
                      const isRegen = regeneratingIndex === idx;

                      return (
                        <div
                          key={`${soal.nomor}-${idx}`}
                          className="avoid-break group relative p-4 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white transition"
                        >
                          {/* Header Butir Soal & Kontrol Aksi */}
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                                {soal.nomor}
                              </span>
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {soal.tipeLabel}
                              </span>
                              <span
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                                  !isPrintLengkap && hideLevelOnStudentPrint ? 'no-print' : ''
                                } ${getLevelBadgeStyle(soal.levelKognitif)}`}
                              >
                                {soal.levelKognitif}
                              </span>
                              <span
                                className={`text-[11px] font-medium text-slate-500 ${
                                  !isPrintLengkap && hideLevelOnStudentPrint ? 'no-print' : ''
                                }`}
                              >
                                • Skor: {soal.skorMaksimal}
                              </span>
                            </div>

                            <div className="no-print flex flex-wrap items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveSoal(idx, -1)}
                                disabled={idx === 0}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 transition"
                                title="Naikkan Urutan"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveSoal(idx, 1)}
                                disabled={idx === hasilAsesmen.daftarSoal.length - 1}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 transition"
                                title="Turunkan Urutan"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingIndex(isEditing ? null : idx)}
                                className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-700 transition"
                              >
                                {isEditing ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Pencil className="w-3.5 h-3.5" />
                                )}
                                <span>{isEditing ? 'Selesai' : 'Edit'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRegenInstruction('');
                                  setRegenModalIndex(idx);
                                }}
                                disabled={isRegen}
                                className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 transition"
                                title="Ganti butir soal ini dengan instruksi khusus"
                              >
                                <RefreshCw
                                  className={`w-3.5 h-3.5 ${isRegen ? 'animate-spin text-amber-600' : ''}`}
                                />
                                <span>Ganti Soal</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSoal(idx)}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                                title="Hapus Butir Soal"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* MODE EDIT INLINE LENGKAP */}
                          {isEditing ? (
                            <div className="space-y-3 mt-3 bg-indigo-50/40 p-3.5 rounded-xl border border-indigo-200 text-xs">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <div>
                                  <label className="font-semibold block mb-1">Level Kognitif:</label>
                                  <select
                                    value={soal.levelKognitif}
                                    onChange={(e) =>
                                      handleUpdateSoalField(idx, 'levelKognitif', e.target.value)
                                    }
                                    className="w-full p-1.5 rounded border border-slate-300 bg-white"
                                  >
                                    <option value="LOTS (C1-C2)">LOTS (C1-C2)</option>
                                    <option value="MOTS (C3)">MOTS (C3)</option>
                                    <option value="HOTS (C4-C6)">HOTS (C4-C6)</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="font-semibold block mb-1">Skor Maksimal:</label>
                                  <input
                                    type="number"
                                    min={1}
                                    max={50}
                                    value={soal.skorMaksimal}
                                    onChange={(e) =>
                                      handleUpdateSoalField(
                                        idx,
                                        'skorMaksimal',
                                        Math.max(1, parseInt(e.target.value, 10) || 1)
                                      )
                                    }
                                    className="w-full p-1.5 rounded border border-slate-300 bg-white font-semibold"
                                  />
                                </div>
                                <div>
                                  <label className="font-semibold block mb-1">Materi:</label>
                                  <input
                                    type="text"
                                    value={soal.materi || ''}
                                    onChange={(e) =>
                                      handleUpdateSoalField(idx, 'materi', e.target.value)
                                    }
                                    className="w-full p-1.5 rounded border border-slate-300 bg-white"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="font-semibold block mb-1">
                                  Indikator Soal (untuk Kisi-Kisi &amp; Kartu Soal):
                                </label>
                                <input
                                  type="text"
                                  value={soal.indikatorSoal || ''}
                                  onChange={(e) =>
                                    handleUpdateSoalField(idx, 'indikatorSoal', e.target.value)
                                  }
                                  className="w-full p-1.5 rounded border border-slate-300 bg-white"
                                />
                              </div>

                              <div>
                                <label className="font-semibold block mb-1">
                                  Stimulus / Teks Pengantar (Opsional):
                                </label>
                                <textarea
                                  rows={2}
                                  value={soal.stimulus || ''}
                                  onChange={(e) =>
                                    handleUpdateSoalField(idx, 'stimulus', e.target.value)
                                  }
                                  className="w-full p-2 rounded border border-slate-300 bg-white"
                                />
                              </div>

                              <div>
                                <label className="font-semibold block mb-1">
                                  Visual / Tabel HTML atau SVG Sederhana (Opsional):
                                </label>
                                <textarea
                                  rows={3}
                                  placeholder="Tempel kode <table>...</table> atau <svg>...</svg> di sini..."
                                  value={soal.visualHtml || ''}
                                  onChange={(e) =>
                                    handleUpdateSoalField(idx, 'visualHtml', e.target.value)
                                  }
                                  className="w-full p-2 rounded border border-slate-300 bg-white font-mono text-[11px]"
                                />
                                {soal.visualHtml && <VisualStimulusBox visualHtml={soal.visualHtml} />}
                              </div>

                              <div>
                                <label className="font-semibold block mb-1">Pertanyaan:</label>
                                <textarea
                                  rows={3}
                                  value={soal.pertanyaan}
                                  onChange={(e) =>
                                    handleUpdateSoalField(idx, 'pertanyaan', e.target.value)
                                  }
                                  className="w-full p-2 rounded border border-slate-300 bg-white"
                                />
                              </div>

                              {soal.tipe === 'JODOH' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <div>
                                    <label className="font-semibold block mb-1">
                                      Premis (1 baris per item):
                                    </label>
                                    <textarea
                                      rows={4}
                                      value={(soal.premis || []).join('\n')}
                                      onChange={(e) =>
                                        handleUpdateSoalField(
                                          idx,
                                          'premis',
                                          e.target.value.split('\n')
                                        )
                                      }
                                      className="w-full p-2 rounded border border-slate-300 bg-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="font-semibold block mb-1">
                                      Respon (1 baris per item):
                                    </label>
                                    <textarea
                                      rows={4}
                                      value={(soal.respon || []).join('\n')}
                                      onChange={(e) =>
                                        handleUpdateSoalField(
                                          idx,
                                          'respon',
                                          e.target.value.split('\n')
                                        )
                                      }
                                      className="w-full p-2 rounded border border-slate-300 bg-white"
                                    />
                                  </div>
                                </div>
                              )}

                              {(soal.tipe === 'PG' || soal.tipe === 'PGK' || (soal.opsi && soal.opsi.length > 0)) && (
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <label className="font-semibold">Pilihan Jawaban:</label>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextLtr = String.fromCharCode(
                                          65 + (soal.opsi?.length || 0)
                                        );
                                        handleUpdateSoalField(idx, 'opsi', [
                                          ...(soal.opsi || []),
                                          `${nextLtr}. Opsi baru`
                                        ]);
                                      }}
                                      className="text-[11px] font-semibold text-indigo-700 hover:underline"
                                    >
                                      + Tambah Opsi
                                    </button>
                                  </div>
                                  <div className="space-y-1.5">
                                    {(soal.opsi || []).map((op, opIdx) => (
                                      <div key={opIdx} className="flex items-center gap-1.5">
                                        <input
                                          type="text"
                                          value={op}
                                          onChange={(e) => {
                                            const nextOpsi = [...(soal.opsi || [])];
                                            nextOpsi[opIdx] = e.target.value;
                                            handleUpdateSoalField(idx, 'opsi', nextOpsi);
                                          }}
                                          className="flex-1 p-1.5 rounded border border-slate-300 bg-white"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const nextOpsi = (soal.opsi || []).filter(
                                              (_, i) => i !== opIdx
                                            );
                                            handleUpdateSoalField(idx, 'opsi', nextOpsi);
                                          }}
                                          className="p-1.5 rounded bg-rose-50 text-rose-600 hover:bg-rose-100"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div>
                                <label className="font-semibold block mb-1">Kunci Jawaban:</label>
                                <input
                                  type="text"
                                  value={soal.kunciJawaban}
                                  onChange={(e) =>
                                    handleUpdateSoalField(idx, 'kunciJawaban', e.target.value)
                                  }
                                  className="w-full p-1.5 rounded border border-slate-300 bg-white font-semibold"
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <label className="font-semibold block mb-1">Pembahasan:</label>
                                  <textarea
                                    rows={2}
                                    value={soal.pembahasan}
                                    onChange={(e) =>
                                      handleUpdateSoalField(idx, 'pembahasan', e.target.value)
                                    }
                                    className="w-full p-2 rounded border border-slate-300 bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="font-semibold block mb-1">
                                    Pedoman Penskoran:
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={soal.pedomanPenskoran}
                                    onChange={(e) =>
                                      handleUpdateSoalField(
                                        idx,
                                        'pedomanPenskoran',
                                        e.target.value
                                      )
                                    }
                                    className="w-full p-2 rounded border border-slate-300 bg-white"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* MODE TAMPILAN BACA */
                            <div className="text-sm space-y-2.5">
                              {soal.stimulus && (
                                <div className="p-3 bg-slate-50 border-l-4 border-indigo-400 rounded-r-lg text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                                  {soal.stimulus}
                                </div>
                              )}
                              {soal.visualHtml && (
                                <VisualStimulusBox visualHtml={soal.visualHtml} />
                              )}
                              <p className="font-medium text-slate-900 whitespace-pre-line leading-relaxed">
                                {soal.pertanyaan}
                              </p>
                              {soal.tipe === 'JODOH' && (
                                <JodohTableBox premis={soal.premis} respon={soal.respon} />
                              )}
                              {soal.opsi && soal.opsi.length > 0 && (
                                <ul className="space-y-1.5 pl-2 pt-0.5 text-slate-800">
                                  {soal.opsi.map((opsiItem, oIdx) => (
                                    <li key={oIdx} className="text-xs sm:text-sm leading-relaxed">
                                      {opsiItem}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Kontrol Tambah Soal Manual */}
                  <div className="no-print mt-5 p-3.5 rounded-xl bg-slate-50 border border-dashed border-slate-300 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Plus className="w-4 h-4 text-indigo-600" />
                      <span className="font-semibold">Tambah Butir Soal Manual:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={newSoalTipe}
                        onChange={(e) => setNewSoalTipe(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium"
                      >
                        {config.komposisiSoal.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddManualSoal}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Soal</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* ========================================================== */}
                {/* TAB 2: KISI-KISI SOAL                                      */}
                {/* ========================================================== */}
                <div
                  className={`${
                    activeTab === 'kisikisi' ? 'block' : 'hidden'
                  } ${isPrintLengkap ? 'print-section page-break-print' : 'print-hide'}`}
                >
                  <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm uppercase tracking-wider border-b border-slate-300 pb-1.5">
                        B. Kisi-Kisi Penulisan Soal
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Referensi: {REGULASI_INFO.struktur} • {hasilAsesmen.regulasiCP}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                        LOTS: {kognitifCounts.LOTS}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                        MOTS: {kognitifCounts.MOTS}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                        HOTS: {kognitifCounts.HOTS}
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse border border-slate-300">
                      <thead className="bg-slate-100 text-slate-800">
                        <tr>
                          <th className="border border-slate-300 p-2 text-center w-10">No</th>
                          <th className="border border-slate-300 p-2 text-left">Materi</th>
                          <th className="border border-slate-300 p-2 text-left">Indikator Soal</th>
                          <th className="border border-slate-300 p-2 text-center w-24">
                            Level Kognitif
                          </th>
                          <th className="border border-slate-300 p-2 text-center w-28">
                            Bentuk Soal
                          </th>
                          <th className="border border-slate-300 p-2 text-center w-14">
                            Nomor Soal
                          </th>
                          <th className="border border-slate-300 p-2 text-center w-14">Skor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hasilAsesmen.daftarSoal.map((s, idx) => (
                          <tr key={s.nomor} className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-center font-semibold">
                              {idx + 1}
                            </td>
                            <td className="border border-slate-300 p-2">{s.materi}</td>
                            <td className="border border-slate-300 p-2">{s.indikatorSoal}</td>
                            <td className="border border-slate-300 p-2 text-center font-semibold">
                              {s.levelKognitif}
                            </td>
                            <td className="border border-slate-300 p-2 text-center">
                              {s.tipeLabel}
                            </td>
                            <td className="border border-slate-300 p-2 text-center font-bold">
                              {s.nomor}
                            </td>
                            <td className="border border-slate-300 p-2 text-center font-bold">
                              {s.skorMaksimal}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-slate-100 font-bold">
                          <td colSpan={6} className="border border-slate-300 p-2 text-right">
                            TOTAL SKOR MAKSIMAL
                          </td>
                          <td className="border border-slate-300 p-2 text-center text-indigo-800">
                            {actualTotalSkorMaks}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ========================================================== */}
                {/* TAB 3: KARTU SOAL (SUPERVISI ADMINISTRASI GURU)            */}
                {/* ========================================================== */}
                <div
                  className={`${
                    activeTab === 'kartu' ? 'block' : 'hidden'
                  } ${isPrintLengkap ? 'print-section page-break-print' : 'print-hide'}`}
                >
                  <div className="mb-3">
                    <h4 className="font-bold text-sm uppercase tracking-wider border-b border-slate-300 pb-1.5">
                      C. Kartu Soal (Administrasi Supervisi Guru)
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Menampilkan rincian lengkap per butir soal beserta CP/TP, materi, indikator, rumusan, kunci, dan penskoran.
                    </p>
                  </div>

                  <div className="space-y-5">
                    {hasilAsesmen.daftarSoal.map((s) => (
                      <div
                        key={`kartu-${s.nomor}`}
                        className="avoid-break border border-slate-400 rounded-xl overflow-hidden text-xs"
                      >
                        <div className="bg-slate-800 text-white px-4 py-2 flex flex-wrap items-center justify-between gap-2 font-bold">
                          <span>
                            KARTU SOAL NOMOR {s.nomor} • {config.namaSekolah}
                          </span>
                          <span className="text-indigo-200">
                            {s.tipeLabel} • {s.levelKognitif} • Skor Maks: {s.skorMaksimal}
                          </span>
                        </div>
                        <table className="w-full border-collapse">
                          <tbody>
                            <tr>
                              <td className="border border-slate-300 bg-slate-50 p-2 font-semibold w-1/4">
                                Mata Pelajaran / Kelas
                              </td>
                              <td className="border border-slate-300 p-2 w-1/4">
                                {config.mapel} / {currentKelasObj.label}
                              </td>
                              <td className="border border-slate-300 bg-slate-50 p-2 font-semibold w-1/4">
                                Jenis Asesmen
                              </td>
                              <td className="border border-slate-300 p-2 w-1/4">
                                {config.jenisAsesmen}{' '}
                                {hasilAsesmen.paketAktif !== 'UTAMA'
                                  ? `(Paket ${hasilAsesmen.paketAktif})`
                                  : ''}
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-slate-300 bg-slate-50 p-2 font-semibold align-top">
                                Capaian Pembelajaran (CP)
                              </td>
                              <td colSpan={3} className="border border-slate-300 p-2 whitespace-pre-line">
                                {config.cp || '-'}
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-slate-300 bg-slate-50 p-2 font-semibold align-top">
                                Tujuan Pembelajaran (TP)
                              </td>
                              <td colSpan={3} className="border border-slate-300 p-2 whitespace-pre-line">
                                {config.tp || '-'}
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-slate-300 bg-slate-50 p-2 font-semibold">
                                Materi Pokok
                              </td>
                              <td colSpan={3} className="border border-slate-300 p-2">
                                {s.materi}
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-slate-300 bg-slate-50 p-2 font-semibold">
                                Indikator Soal
                              </td>
                              <td colSpan={3} className="border border-slate-300 p-2">
                                {s.indikatorSoal}
                              </td>
                            </tr>
                            <tr>
                              <td colSpan={4} className="border border-slate-300 p-3 bg-white">
                                <p className="font-bold text-slate-700 mb-1.5">Rumusan Butir Soal:</p>
                                {s.stimulus && (
                                  <div className="p-2.5 bg-slate-50 border-l-4 border-indigo-400 rounded-r mb-2 whitespace-pre-line">
                                    {s.stimulus}
                                  </div>
                                )}
                                {s.visualHtml && (
                                  <VisualStimulusBox visualHtml={s.visualHtml} />
                                )}
                                <p className="font-medium text-slate-900 whitespace-pre-line">
                                  {s.pertanyaan}
                                </p>
                                {s.tipe === 'JODOH' && (
                                  <JodohTableBox premis={s.premis} respon={s.respon} />
                                )}
                                {s.opsi && s.opsi.length > 0 && (
                                  <ul className="mt-1.5 pl-3 space-y-0.5 text-slate-800">
                                    {s.opsi.map((o, oIdx) => (
                                      <li key={oIdx}>{o}</li>
                                    ))}
                                  </ul>
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-slate-300 bg-emerald-50/70 p-2 font-semibold">
                                Kunci Jawaban
                              </td>
                              <td colSpan={3} className="border border-slate-300 p-2 font-bold text-emerald-800">
                                {s.kunciJawaban}
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-slate-300 bg-slate-50 p-2 font-semibold align-top">
                                Pembahasan
                              </td>
                              <td colSpan={3} className="border border-slate-300 p-2 whitespace-pre-line">
                                {s.pembahasan}
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-slate-300 bg-slate-50 p-2 font-semibold align-top">
                                Pedoman Penskoran
                              </td>
                              <td colSpan={3} className="border border-slate-300 p-2 whitespace-pre-line">
                                {s.pedomanPenskoran} (Skor Maksimal: {s.skorMaksimal})
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ========================================================== */}
                {/* TAB 4: KUNCI JAWABAN, PEMBAHASAN & RUBRIK PENSKORAN        */}
                {/* ========================================================== */}
                <div
                  className={`${
                    activeTab === 'kunci' ? 'block' : 'hidden'
                  } ${isPrintLengkap ? 'print-section page-break-print' : 'print-hide'}`}
                >
                  <div className="mb-3">
                    <h4 className="font-bold text-sm uppercase tracking-wider border-b border-slate-300 pb-1.5">
                      D. Kunci Jawaban, Pembahasan &amp; Pedoman Penskoran
                    </h4>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse border border-slate-300">
                      <thead className="bg-slate-100 text-slate-800">
                        <tr>
                          <th className="border border-slate-300 p-2 text-center w-10">No</th>
                          <th className="border border-slate-300 p-2 text-left w-1/4">
                            Kunci Jawaban
                          </th>
                          <th className="border border-slate-300 p-2 text-left">Pembahasan</th>
                          <th className="border border-slate-300 p-2 text-left w-1/4">
                            Pedoman Penskoran
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {hasilAsesmen.daftarSoal.map((s) => (
                          <tr key={s.nomor} className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2 text-center font-bold">
                              {s.nomor}
                            </td>
                            <td className="border border-slate-300 p-2 font-bold text-emerald-800">
                              {s.kunciJawaban}
                            </td>
                            <td className="border border-slate-300 p-2 text-slate-700 whitespace-pre-line">
                              {s.pembahasan}
                            </td>
                            <td className="border border-slate-300 p-2">
                              <div className="whitespace-pre-line">{s.pedomanPenskoran}</div>
                              <div className="font-bold text-indigo-700 mt-1">
                                Skor Maks: {s.skorMaksimal}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Rumus Konversi Nilai Akhir Otomatis & Kalkulator Simulasi */}
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-indigo-600" />
                          <span>Rumus Konversi Nilai Akhir Otomatis:</span>
                        </p>
                        <p className="text-slate-700 mt-1 font-medium">
                          Nilai Akhir = (Jumlah Skor Perolehan ÷{' '}
                          <strong>{actualTotalSkorMaks}</strong>) × 100
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-500">Total Skor Maksimal Aktual:</p>
                        <p className="text-base font-extrabold text-indigo-700">
                          {actualTotalSkorMaks} Poin
                        </p>
                      </div>
                    </div>

                    <div className="no-print pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold text-slate-700">
                          Simulasi Konversi Skor Siswa:
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={actualTotalSkorMaks}
                          value={skorSimulasi}
                          onChange={(e) =>
                            setSkorSimulasi(
                              Math.min(
                                actualTotalSkorMaks,
                                Math.max(0, parseInt(e.target.value, 10) || 0)
                              )
                            )
                          }
                          className="w-20 px-2 py-1 rounded border border-slate-300 bg-white text-center font-bold"
                        />
                        <span className="text-slate-500">/ {actualTotalSkorMaks}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-900 font-bold">
                          Nilai: {nilaiSimulasi}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-semibold">
                          {predikatSimulasi}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Blok Tanda Tangan Resmi */}
                  <div className="avoid-break mt-6 grid grid-cols-2 gap-8 text-xs text-center pt-4">
                    <div>
                      <p>Mengetahui,</p>
                      <p>Kepala Satuan Pendidikan</p>
                      <div className="h-16" />
                      <p className="font-bold underline">
                        {config.namaKepalaSekolah || 'Kepala Satuan Pendidikan'}
                      </p>
                    </div>
                    <div>
                      <p>Penyusun Perangkat Asesmen,</p>
                      <p>Guru Mata Pelajaran</p>
                      <div className="h-16" />
                      <p className="font-bold underline">{config.penyusun}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="no-print bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        <p>
          <strong>GENERATOR SOAL ASESMEN PRO</strong>{' '}
          <span className="text-indigo-600 font-semibold">by E-Geo</span> • Selaras dengan{' '}
          {REGULASI_INFO.struktur}, BSKAP No. 046/H/KR/2025 &amp; BKPDM No. 020 Tahun 2026.
        </p>
      </footer>

      {/* ================================================================== */}
      {/* MODAL 1: INFORMASI REGULASI KURIKULUM                              */}
      {/* ================================================================== */}
      {showRegulasiModal && (
        <div className="no-print fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-indigo-950 text-white flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2 text-sm sm:text-base">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>Acuan Regulasi Kurikulum Nasional</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowRegulasiModal(false)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs sm:text-sm text-slate-700 max-h-[75vh] overflow-y-auto">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-bold text-indigo-900">
                  1. Struktur Kurikulum &amp; Daftar Mata Pelajaran
                </p>
                <p className="mt-1">
                  {REGULASI_INFO.struktur}. Mengatur mata pelajaran wajib, aturan IPAS &amp; Bahasa Inggris mulai Kelas III SD, Informatika &amp; Prakarya SMP, serumpun Fase E (Kelas X), dan mapel pilihan Fase F (Kelas XI–XII).
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-bold text-indigo-900">
                  2. Capaian Pembelajaran (CP) Umum
                </p>
                <p className="mt-1">
                  {REGULASI_INFO.cpUmum} sebagai acuan perumusan CP, TP, dan indikator soal seluruh mata pelajaran umum.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <p className="font-bold text-emerald-900">
                  3. Capaian Pembelajaran (CP) Pendidikan Agama Islam
                </p>
                <p className="mt-1 text-emerald-800">
                  {REGULASI_INFO.cpPai} otomatis aktif dan terdeteksi ketika guru memilih mata pelajaran Pendidikan Agama Islam dan Budi Pekerti.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100">
                <p className="font-bold text-indigo-950 mb-1.5">
                  4. Pemetaan Fase, Alokasi JP &amp; Jumlah Opsi PG:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>
                    <strong>SD / MI (35 menit/JP, PG 4 opsi A–D):</strong> Kelas I–II (Fase A), Kelas III–IV (Fase B), Kelas V–VI (Fase C).
                  </li>
                  <li>
                    <strong>SMP / MTs (40 menit/JP, PG 4 opsi A–D):</strong> Kelas VII–IX (Fase D).
                  </li>
                  <li>
                    <strong>SMA / MA (45 menit/JP, PG 5 opsi A–E):</strong> Kelas X (Fase E), Kelas XI–XII (Fase F).
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MODAL 2: PENGATURAN GEMINI API KEY & MODEL                         */}
      {/* ================================================================== */}
      {showApiModal && (
        <div className="no-print fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2 text-sm">
                <Key className="w-4 h-4 text-amber-400" />
                <span>Pengaturan Gemini API &amp; Model</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowApiModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-900 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600" />
                <p>
                  Secara default aplikasi otomatis memanggil Gemini melalui <strong>Server Netlify</strong> (<code>/api/gemini</code> — mendukung <strong>Netlify AI Gateway</strong> atau <code>GEMINI_API_KEY</code> di Environment Variables Netlify), sehingga guru dapat langsung membuat soal tanpa mengisi API Key. Kolom di bawah hanya opsional jika Anda ingin memakai Gemini API Key pribadi.
                </p>
              </div>
              <div
                className={`px-3 py-2 rounded-lg border font-semibold flex items-center gap-2 ${
                  apiKey.trim()
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <ShieldCheck
                  className={`w-4 h-4 shrink-0 ${
                    apiKey.trim() ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                />
                <span>
                  {apiKey.trim()
                    ? 'Mode Aktif: Gemini API Key Pribadi (Langsung ke Google)'
                    : 'Mode Aktif: Server Netlify (/api/gemini)'}
                </span>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Gemini API Key Pribadi (Opsional, tersimpan di browser)
                </label>
                <input
                  type="password"
                  placeholder="Kosongkan untuk pakai Server Netlify, atau isi AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Model Gemini
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
                >
                  {MODEL_OPTIONS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApiModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveApiSettings}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Simpan Pengaturan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MODAL 3: MANAJEMEN PROYEK (LOCALSTORAGE + EKSPOR/IMPOR JSON)       */}
      {/* ================================================================== */}
      {showProjectsModal && (
        <div className="no-print fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm sm:text-base">
                <FolderOpen className="w-5 h-5 text-indigo-600" />
                <span>Manajemen Proyek &amp; Cadangan (.json)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowProjectsModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-3 bg-indigo-50/70 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-indigo-950">
                Bagikan / Cadangkan Draf Asesmen:
              </span>
              <div className="flex items-center gap-2">
                <input
                  ref={jsonImportInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportProjectJson}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => jsonImportInputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-indigo-200 text-indigo-700 text-xs font-semibold flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Impor .json</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportProjectJson}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
                >
                  <FileJson className="w-3.5 h-3.5" />
                  <span>Ekspor .json</span>
                </button>
              </div>
            </div>

            <div className="p-5 max-h-[55vh] overflow-y-auto space-y-2.5">
              {savedProjects.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  Belum ada proyek yang disimpan di penyimpanan browser ini.
                </p>
              ) : (
                savedProjects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-800 truncate">
                        {proj.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Disimpan: {proj.savedAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleLoadProject(proj)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                      >
                        Buka
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(proj.id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                        title="Hapus Proyek"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MODAL 4: PILIHAN CETAK / SIMPAN PDF                                */}
      {/* ================================================================== */}
      {showPrintModal && (
        <div className="no-print fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2 text-sm">
                <Printer className="w-4 h-4 text-indigo-300" />
                <span>Pilih Mode Cetak / Simpan PDF</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideLevelOnStudentPrint}
                  onChange={(e) => setHideLevelOnStudentPrint(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600"
                />
                <span className="font-medium text-slate-700">
                  Sembunyikan label level kognitif &amp; skor pada mode Naskah Siswa
                </span>
              </label>

              <button
                type="button"
                onClick={() => handleTriggerPrint('siswa')}
                className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-left transition"
              >
                <div className="font-bold text-sm text-slate-800">
                  1. Cetak Naskah Siswa Saja
                </div>
                <p className="text-slate-500 mt-0.5">
                  Hanya Kop Surat, Identitas Siswa, Petunjuk, dan Naskah Soal (tanpa Kisi-Kisi, Kartu Soal, &amp; Kunci Jawaban).
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleTriggerPrint('lengkap')}
                className="w-full p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/40 hover:border-indigo-600 hover:bg-indigo-50 text-left transition"
              >
                <div className="font-bold text-sm text-indigo-950">
                  2. Cetak Perangkat Lengkap Guru
                </div>
                <p className="text-indigo-800/80 mt-0.5">
                  Naskah Soal + Kisi-Kisi + Kartu Soal + Kunci Jawaban &amp; Rubrik (dipisah otomatis per halaman).
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MODAL 5: PILIHAN EKSPOR MICROSOFT WORD (.DOC)                      */}
      {/* ================================================================== */}
      {showWordModal && (
        <div className="no-print fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-emerald-900 text-white flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2 text-sm">
                <Download className="w-4 h-4 text-emerald-300" />
                <span>Ekspor Microsoft Word (.doc)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowWordModal(false)}
                className="text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <p className="text-slate-600">
                Format dokumen menggunakan huruf <strong>Times New Roman 12pt</strong>, Kop Surat resmi beserta logo, tabel berbatas tegas, dan pemisah halaman otomatis.
              </p>

              <button
                type="button"
                onClick={() => handleTriggerWord('siswa')}
                className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition"
              >
                <div className="font-bold text-sm text-slate-800">
                  1. Unduh Naskah Siswa (.doc)
                </div>
                <p className="text-slate-500 mt-0.5">
                  Khusus naskah ujian siap bagikan untuk peserta didik beserta kolom identitas siswa.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleTriggerWord('lengkap')}
                className="w-full p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/50 hover:border-emerald-600 hover:bg-emerald-50 text-left transition"
              >
                <div className="font-bold text-sm text-emerald-950">
                  2. Unduh Perangkat Lengkap Guru (.doc)
                </div>
                <p className="text-emerald-800/80 mt-0.5">
                  Berisi Naskah Soal, Kisi-Kisi, Kartu Soal Supervisi, Kunci Jawaban, Rubrik, &amp; Blok Tanda Tangan.
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MODAL 6: REGENERASI 1 BUTIR SOAL DENGAN INSTRUKSI KHUSUS           */}
      {/* ================================================================== */}
      {regenModalIndex !== null && hasilAsesmen?.daftarSoal?.[regenModalIndex] && (
        <div className="no-print fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-amber-950 text-white flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2 text-sm">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span>
                  Ganti Soal Nomor {hasilAsesmen.daftarSoal[regenModalIndex].nomor} (Instruksi Khusus)
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setRegenModalIndex(null)}
                className="text-amber-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-500">Soal Saat Ini:</span>
                <p className="text-slate-800 font-medium mt-1 line-clamp-3">
                  {hasilAsesmen.daftarSoal[regenModalIndex].pertanyaan}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Pilih Instruksi Cepat:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_REGEN_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setRegenInstruction(chip)}
                      className={`px-2.5 py-1 rounded-full border text-[11px] font-medium transition ${
                        regenInstruction === chip
                          ? 'bg-amber-100 border-amber-500 text-amber-900'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Instruksi Tambahan untuk AI (Opsional):
                </label>
                <textarea
                  rows={3}
                  placeholder="Misal: Buat lebih kontekstual dengan studi kasus bencana Merapi, atau turunkan tingkat kesulitannya..."
                  value={regenInstruction}
                  onChange={(e) => setRegenInstruction(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRegenModalIndex(null)}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRegenerateSingleSoal}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Buat Soal Pengganti</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
