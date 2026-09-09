import test from 'node:test';import assert from 'node:assert/strict';
import { LABEL_SIZES,validateUpload,validateLabelText,filenameFor } from '../src/labels.js';
import { generationMode,buildPrompt } from '../server.js';
test('valida upload por presença, tipo e limite',()=>{assert.match(validateUpload(null),/Envie/);assert.match(validateUpload({type:'application/pdf',size:2}),/Formato/);assert.match(validateUpload({type:'image/png',size:9*1024*1024}),/8 MB/);assert.equal(validateUpload({type:'image/webp',size:100}),'')});
test('valida texto obrigatório e limite de legibilidade',()=>{assert.match(validateLabelText('  '),/Digite/);assert.match(validateLabelText('a'.repeat(33)),/32/);assert.equal(validateLabelText('Maria Eduarda'),'')});
test('gera exatamente P, M e G nas resoluções e proporções corretas',()=>{assert.deepEqual(LABEL_SIZES.map(x=>[x.id,x.width,x.height]),[['p',354,177],['m',472,354],['g',827,472]]);assert.equal(354/177,2);assert.ok(Math.abs(472/354-4/3)<.001);assert.ok(Math.abs(827/472-7/4)<.003)});
test('fallback é demonstração sem credenciais',()=>{assert.equal(generationMode({LABEL_AI_PROVIDER:'openai'}),'demo');assert.equal(generationMode({LABEL_AI_PROVIDER:'openai',OPENAI_API_KEY:'secret'}),'openai');assert.equal(generationMode({}),'demo')});
test('prompt protege texto e referência',()=>{const p=buildPrompt({text:'Maria',style:'Floral',instructions:''},LABEL_SIZES[0]);assert.match(p,/referência obrigatória/);assert.match(p,/Não desenhe letras/);assert.match(p,/Maria/)});
test('nome amigável é sanitizado',()=>assert.equal(filenameFor('Maria Eduarda',LABEL_SIZES[0]),'etiqueta-maria-eduarda-p-3x1-5cm.png'));
