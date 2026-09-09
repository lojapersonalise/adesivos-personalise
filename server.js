import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { LABEL_SIZES, safeText } from './src/labels.js';

const root = process.cwd();
const mime = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml' };
const provider = process.env.LABEL_AI_PROVIDER || 'demo';

export function generationMode(env = process.env) {
  return env.LABEL_AI_PROVIDER === 'openai' && env.OPENAI_API_KEY ? 'openai' : 'demo';
}

export function buildPrompt({ text, style, instructions }, size) {
  return `Crie somente o fundo visual de uma etiqueta ${size.name} (${size.cm}), composição ${size.layout}. Estilo: ${style}. A imagem fornecida é referência obrigatória; preserve a identidade do elemento principal. Tema adicional: ${instructions || 'nenhum'}. Reserve área limpa, segura e de alto contraste para inserir programaticamente o texto “${text}”. Não desenhe letras, texto inventado, marca-d'água ou logotipos não solicitados. Resultado pronto para etiqueta infantil/escolar quando aplicável, sem cortar elementos importantes.`;
}

async function generateOpenAI(body) {
  const outputs = [];
  for (const size of LABEL_SIZES) {
    const form = new FormData();
    const [header, base64] = body.image.split(',');
    const type = header.match(/data:(.*?);/)?.[1] || 'image/png';
    form.append('image', new Blob([Buffer.from(base64, 'base64')], { type }), 'reference.png');
    form.append('model', process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1');
    form.append('prompt', buildPrompt(body, size));
    form.append('size', '1536x1024');
    const response = await fetch('https://api.openai.com/v1/images/edits', { method:'POST', headers:{ Authorization:`Bearer ${process.env.OPENAI_API_KEY}` }, body:form });
    if (!response.ok) throw new Error(`Provedor de imagem respondeu ${response.status}`);
    const data = await response.json();
    outputs.push({ id:size.id, background:`data:image/png;base64,${data.data[0].b64_json}` });
  }
  return outputs;
}

async function api(req, res) {
  let raw=''; for await (const chunk of req) { raw += chunk; if (raw.length > 12_000_000) break; }
  try {
    const body=JSON.parse(raw); body.text=safeText(body.text); body.instructions=safeText(body.instructions,180); body.style=safeText(body.style,50);
    if (!body.text || !body.image?.startsWith('data:image/')) throw new Error('Dados da criação inválidos.');
    const mode=generationMode();
    const images=mode==='openai' ? await generateOpenAI(body) : [];
    res.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify({ mode, images, sizes:LABEL_SIZES }));
  } catch(error) { res.writeHead(400,{'Content-Type':'application/json'}).end(JSON.stringify({error:error.message})); }
}

export const server=createServer(async(req,res)=>{
  if(req.method==='POST'&&req.url==='/api/labels/generate') return api(req,res);
  const pathname=req.url==='/'?'/index.html':req.url.split('?')[0];
  const file=normalize(join(root,pathname));
  if(!file.startsWith(root)) return res.writeHead(403).end();
  try{const content=await readFile(file);res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'}).end(content)}catch{res.writeHead(404).end('Não encontrado')}
});
if(process.argv[1]===new URL(import.meta.url).pathname) server.listen(Number(process.env.PORT)||3000,()=>console.log(`Criador em http://localhost:${process.env.PORT||3000} · provider configurado: ${provider}`));
