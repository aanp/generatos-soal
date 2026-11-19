import process from 'node:process';
import { GoogleGenAI } from '@google/genai';

const getEnv = (key) => globalThis.Netlify?.env?.get(key) ?? process.env[key];

const isModelFallbackError = (err) => {
  const status = Number(err?.status || err?.statusCode || 0);
  const msg = String(err?.message || '').toLowerCase();
  return (
    status === 404 ||
    (status === 400 && (msg.includes('model') || msg.includes('not found') || msg.includes('unsupported'))) ||
    msg.includes('model not found') ||
    msg.includes('is not found for api version') ||
    msg.includes('not supported for generatecontent')
  );
};

export default async (req) => {
  const geminiKey = getEnv('GEMINI_API_KEY');
  const googleKey = getEnv('GOOGLE_API_KEY');
  const baseUrl = getEnv('GOOGLE_GEMINI_BASE_URL');
  const hasServerKey = Boolean(geminiKey || googleKey);

  if (req.method === 'GET') {
    return Response.json(
      {
        ok: true,
        configured: hasServerKey,
        gatewayActive: Boolean(baseUrl)
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }

  if (!hasServerKey) {
    return Response.json(
      {
        error:
          'Server Gemini belum aktif. Pastikan situs sudah deploy production di Netlify (untuk AI Gateway) atau atur GEMINI_API_KEY di Environment Variables Netlify, atau masukkan API Key pribadi melalui tombol "API & Model".'
      },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch (err) {
    return Response.json({ error: 'Body permintaan harus berupa JSON yang valid.' }, { status: 400 });
  }

  const {
    model = 'gemini-3-flash-preview',
    contents,
    systemInstruction,
    responseMimeType = 'application/json',
    responseSchema
  } = body || {};

  if (!contents) {
    return Response.json({ error: 'Parameter "contents" wajib diisi.' }, { status: 400 });
  }

  const genConfig = {};
  if (systemInstruction) genConfig.systemInstruction = systemInstruction;
  if (responseMimeType) genConfig.responseMimeType = responseMimeType;
  if (responseSchema) genConfig.responseSchema = responseSchema;

  const ai = new GoogleGenAI({});

  const openStream = async (modelName) => {
    const responseStream = await ai.models.generateContentStream({
      model: modelName,
      contents,
      config: genConfig
    });
    const iterator = responseStream[Symbol.asyncIterator]();
    const firstResult = await iterator.next();
    return { iterator, firstResult };
  };

  const requestedModel = String(model || 'gemini-3-flash-preview').trim();
  const candidates = [
    requestedModel,
    ...['gemini-flash-latest', 'gemini-2.5-flash'].filter((m) => m !== requestedModel)
  ];

  let activeModel = requestedModel;
  let streamSession = null;
  let lastError = null;

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    try {
      activeModel = candidate;
      streamSession = await openStream(candidate);
      lastError = null;
      break;
    } catch (err) {
      lastError = err;
      const hasNext = i < candidates.length - 1;
      if (!hasNext || !isModelFallbackError(err)) {
        break;
      }
    }
  }

  if (!streamSession) {
    const rawStatus = Number(lastError?.status || lastError?.statusCode || 500);
    const status = rawStatus >= 400 && rawStatus < 600 ? rawStatus : 500;
    return Response.json(
      { error: lastError?.message || 'Gagal menghubungi layanan Gemini AI.' },
      { status }
    );
  }

  const encoder = new TextEncoder();
  const { iterator, firstResult } = streamSession;

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        if (!firstResult.done) {
          const firstText = firstResult.value?.text;
          if (firstText) controller.enqueue(encoder.encode(firstText));
        }
        while (true) {
          const { value, done } = await iterator.next();
          if (done) break;
          const chunkText = value?.text;
          if (chunkText) controller.enqueue(encoder.encode(chunkText));
        }
        controller.close();
      } catch (streamErr) {
        controller.error(streamErr);
      }
    }
  });

  return new Response(readableStream, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Gemini-Model': activeModel
    }
  });
};

export const config = {
  path: '/api/gemini',
  method: ['GET', 'POST']
};
