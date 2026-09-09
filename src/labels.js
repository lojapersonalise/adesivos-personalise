export const LABEL_SIZES = Object.freeze([
  { id: 'p', name: 'P', cm: '3 × 1,5 cm', width: 354, height: 177, layout: 'compacta' },
  { id: 'm', name: 'M', cm: '4 × 3 cm', width: 472, height: 354, layout: 'equilibrada' },
  { id: 'g', name: 'G', cm: '7 × 4 cm', width: 827, height: 472, layout: 'expressiva' }
]);

export const STYLES = Object.freeze([
  ['colorido', '🌈', 'Infantil colorido'], ['kawaii', '☁️', 'Fofo / kawaii'],
  ['escolar', '✏️', 'Escolar criativo'], ['minimalista', '◯', 'Minimalista'],
  ['floral', '🌸', 'Floral delicado'], ['gamer', '🎮', 'Gamer'],
  ['espaco', '🚀', 'Espaço sideral'], ['personalizado', '✨', 'Personalizado por texto']
]);

export const MAX_FILE_BYTES = 8 * 1024 * 1024;
export const MAX_TEXT_LENGTH = 32;
export const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export function validateUpload(file) {
  if (!file) return 'Envie uma imagem para continuar.';
  if (!ACCEPTED_TYPES.includes(file.type)) return 'Formato inválido. Use PNG, JPG ou WEBP.';
  if (file.size > MAX_FILE_BYTES) return 'A imagem deve ter no máximo 8 MB.';
  return '';
}

export function validateLabelText(value) {
  const text = String(value ?? '').trim();
  if (!text) return 'Digite o texto da etiqueta.';
  if (text.length > MAX_TEXT_LENGTH) return `Use no máximo ${MAX_TEXT_LENGTH} caracteres.`;
  return '';
}

export function safeText(value, max = MAX_TEXT_LENGTH) {
  return String(value ?? '').replace(/[<>\u0000-\u001F]/g, '').trim().slice(0, max);
}

export function slugify(value) {
  return safeText(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'personalizada';
}

export function filenameFor(text, size) {
  const dimensions = { p: '3x1-5cm', m: '4x3cm', g: '7x4cm' };
  return `etiqueta-${slugify(text)}-${size.id}-${dimensions[size.id]}.png`;
}
