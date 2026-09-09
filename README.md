# Criador de Etiquetas

Aplicação responsiva para compor etiquetas P (3 × 1,5 cm), M (4 × 3 cm) e G (7 × 4 cm), exportadas em PNG a 300 DPI nominal. Cada formato recebe uma composição própria em canvas, com imagem sem distorção, texto programático e área segura.

## Publicar e usar somente pelo GitHub

O projeto está preparado para funcionar como site estático no **GitHub Pages**, sem servidor, instalação ou execução local. Faça push para `work` ou `main` e o workflow `Publicar no GitHub Pages` fará o deploy automaticamente.

No repositório do GitHub, abra **Settings → Pages** e em **Source** selecione **GitHub Actions**. Depois acompanhe a publicação na aba **Actions** e abra a URL exibida pelo job de deploy. Todos os assets usam caminhos relativos, portanto também funcionam em URLs de projeto como `usuario.github.io/nome-do-repositorio/`.

No GitHub Pages a aplicação opera exclusivamente em **Modo de demonstração**: toda a composição é feita no navegador e a imagem não é enviada para qualquer servidor. Upload, três formatos, preview, edição e downloads PNG funcionam normalmente.

## Executar localmente (opcional)

Requer Node.js 20 ou mais recente. Não há dependências de runtime externas.

```bash
cp .env.example .env
# Exporte as variáveis do .env ou configure-as no ambiente da hospedagem.
npm run dev
```

Acesse `http://localhost:3000`. Para validar: `npm test`, `npm run lint`, `npm run typecheck` e `npm run build`.

## IA e variáveis de ambiente (somente hospedagem com backend)

O navegador chama apenas `POST /api/labels/generate`; credenciais permanecem no servidor. O provider é selecionado por ambiente:

- `LABEL_AI_PROVIDER=demo`: fallback local, claramente identificado como **Modo de demonstração**. Ele usa a imagem enviada, o texto e uma paleta determinística; não afirma usar IA.
- `LABEL_AI_PROVIDER=openai` e `OPENAI_API_KEY`: usa a API de edição de imagem para criar o fundo de cada formato. `OPENAI_IMAGE_MODEL` seleciona o modelo (padrão `gpt-image-1`).
- `PORT`: porta HTTP, padrão 3000.

Nunca coloque a chave em variável exposta ao frontend. Em produção, recomenda-se autenticação, rate limiting, limite de custos, moderação e storage temporário conforme a política do negócio.

O GitHub Pages não executa código server-side e não pode guardar uma chave de API com segurança. Por isso, a integração de IA real não é ativada no Pages. **Não coloque `OPENAI_API_KEY` nos Secrets para tentar expô-la ao JavaScript e não coloque chaves no código.** Para IA real será necessário hospedar o backend separadamente e configurar autenticação/CORS; isso é opcional e não é necessário para usar o criador no GitHub.

O prompt exige a imagem como referência, área limpa e ausência de letras inventadas. O nome sempre é renderizado depois no canvas, pois modelos de imagem podem errar texto. A fidelidade da edição, disponibilidade, custo e latência dependem do provider; o endpoint atualmente processa os três fundos em sequência. Falhas do provider são informadas e **não** são silenciosamente apresentadas como IA.

## Testar o fluxo e a exportação

1. Abra a aplicação e envie PNG, JPG ou WEBP de até 8 MB.
2. Informe um nome (até 32 caracteres), selecione estilo e gere.
3. Confirme os três cards e dimensões. Use “Ampliar” e baixe cada PNG.
4. Abra os arquivos em um editor e confirme 354 × 177, 472 × 354 e 827 × 472 px. “Baixar todas” inicia os três downloads (sem biblioteca ZIP).
5. Ative/desative a sangria visual de 2 mm e gere novamente.

As imagens não são persistidas. Elas trafegam como data URL durante a solicitação e permanecem em memória. A resolução em pixels é exata; metadados físicos de DPI não são embutidos no PNG pelo canvas, portanto softwares gráficos devem ser configurados para 300 DPI ao posicionar nas medidas informadas.
