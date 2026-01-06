# Deploy PWA no GitHub Pages

Sim! O PWA **funciona perfeitamente** no GitHub Pages porque:
- ✅ GitHub Pages usa HTTPS (obrigatório para PWA)
- ✅ É gratuito
- ✅ Rápido e confiável
- ✅ Suporta Service Workers

## 📋 Passo a passo completo

### 1. Configurar o Vite para GitHub Pages

Edite o arquivo `vite.config.js` (se não existir, crie na raiz do frontend):

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/SorrisoAgiotagem/', // ⚠️ Mude para o nome do seu repositório
})
```

**IMPORTANTE:** Mude `/SorrisoAgiotagem/` para o nome exato do seu repositório GitHub!

### 2. Criar script de deploy

Adicione este script no `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

### 3. Instalar gh-pages

```bash
npm install --save-dev gh-pages
```

### 4. Build do projeto

```bash
npm run build
```

Isso cria a pasta `dist/` com todos os arquivos otimizados.

### 5. Deploy para GitHub Pages

#### Opção A: Usando gh-pages (Recomendado)

```bash
npm run deploy
```

Pronto! Seu site estará em: `https://SEU_USUARIO.github.io/SorrisoAgiotagem/`

#### Opção B: Manual

1. Crie um repositório no GitHub
2. Faça commit da pasta `dist/`:
   ```bash
   cd dist
   git init
   git add .
   git commit -m "Deploy PWA"
   git branch -M gh-pages
   git remote add origin https://github.com/SEU_USUARIO/SorrisoAgiotagem.git
   git push -u origin gh-pages
   ```

3. No GitHub:
   - Vá em **Settings** > **Pages**
   - Em **Source**, selecione branch `gh-pages`
   - Salve

### 6. Verificar se funcionou

1. Acesse: `https://SEU_USUARIO.github.io/SorrisoAgiotagem/`
2. Abra DevTools (F12) > Application > Manifest
3. Deve aparecer o manifest do PWA!
4. No celular, abra no Chrome e clique em "Instalar"

## ⚠️ Problemas comuns e soluções

### Problema 1: Página em branco

**Causa:** Base URL incorreta no `vite.config.js`

**Solução:**
```javascript
// Se o repositório se chama "meu-app"
base: '/meu-app/'

// Se usar domínio customizado
base: '/'
```

### Problema 2: Service Worker não registra

**Causa:** Caminho incorreto do `sw.js`

**Solução:** Edite `src/main.jsx`:
```javascript
navigator.serviceWorker.register(
  import.meta.env.BASE_URL + 'sw.js'
)
```

### Problema 3: Manifest não carrega

**Causa:** Caminho incorreto no `index.html`

**Solução:** Use caminho relativo:
```html
<link rel="manifest" href="./manifest.json" />
```

### Problema 4: Ícones não aparecem

**Causa:** Caminhos absolutos dos ícones

**Solução:** No `manifest.json`, use caminhos relativos:
```json
{
  "icons": [
    {
      "src": "./logo-192.png",
      "sizes": "192x192"
    },
    {
      "src": "./logo-512.png",
      "sizes": "512x512"
    }
  ]
}
```

## 🔧 Configuração completa para GitHub Pages

### vite.config.js
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/SorrisoAgiotagem/', // Nome do repositório
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
})
```

### package.json (adicione scripts)
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist"
  },
  "devDependencies": {
    "gh-pages": "^6.1.0"
  }
}
```

### .github/workflows/deploy.yml (CI/CD automático - OPCIONAL)
```yaml
name: Deploy PWA

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install dependencies
      run: |
        cd frontend
        npm ci

    - name: Build
      run: |
        cd frontend
        npm run build

    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./frontend/dist
```

Com esse workflow, **cada push na branch main faz deploy automático!**

## 🌐 Domínio customizado (OPCIONAL)

Se quiser usar um domínio próprio (ex: `sorrisoagiotagem.com`):

1. No GitHub Pages settings, adicione seu domínio custom
2. Configure DNS:
   ```
   A    185.199.108.153
   A    185.199.109.153
   A    185.199.110.153
   A    185.199.111.153
   ```
3. Crie arquivo `CNAME` na pasta `public/`:
   ```
   sorrisoagiotagem.com
   ```
4. No `vite.config.js`:
   ```javascript
   base: '/'
   ```

## 📱 Testar no celular

Depois do deploy:

1. **No Android/Chrome:**
   - Abra: `https://SEU_USUARIO.github.io/SorrisoAgiotagem/`
   - Clique em "Instalar" no banner
   - OU menu (⋮) > "Adicionar à tela inicial"

2. **No iPhone/Safari:**
   - Abra a URL
   - Compartilhar (□↑) > "Adicionar à Tela de Início"

3. **Testar offline:**
   - Abra o app uma vez online
   - Ative modo avião
   - Abra o app instalado - funcionará offline!

## ✅ Checklist final

Antes de fazer deploy, verifique:

- [ ] `vite.config.js` tem o `base` correto
- [ ] `manifest.json` está em `public/`
- [ ] `sw.js` está em `public/`
- [ ] `logo-192.png` e `logo-512.png` estão em `public/`
- [ ] Testou `npm run build` localmente
- [ ] Testou `npm run preview` localmente
- [ ] Service Worker funciona no preview
- [ ] Git repositório configurado
- [ ] `gh-pages` instalado

## 🚀 Comandos rápidos

```bash
# 1. Configurar
npm install --save-dev gh-pages

# 2. Build
npm run build

# 3. Deploy
npm run deploy

# 4. Verificar
# Abra: https://SEU_USUARIO.github.io/SorrisoAgiotagem/
```

## 📊 Monitorar performance

Depois do deploy, teste a qualidade do PWA:

1. Abra o site no Chrome
2. F12 > Lighthouse
3. Marque apenas "Progressive Web App"
4. "Generate report"
5. Deve ter score 100/100!

## 🔄 Atualizar o site

Para atualizar:

```bash
# Faça suas alterações no código
git add .
git commit -m "Atualização"
git push

# Faça novo deploy
npm run deploy
```

Ou se tiver CI/CD configurado, só precisa:
```bash
git push
```

O deploy acontece automaticamente!

## 💡 Dicas importantes

1. **Cache do navegador:** Depois de atualizar, usuários podem ver versão antiga. Aumente a versão do cache no `sw.js`:
   ```javascript
   const CACHE_NAME = 'sorriso-agiotagem-v2'; // v1 -> v2 -> v3...
   ```

2. **IndexedDB persiste:** Os dados do usuário ficam no navegador local, mesmo após atualizar o app

3. **HTTPS automático:** GitHub Pages usa HTTPS por padrão, perfeito para PWA

4. **Grátis e ilimitado:** Sem custo nenhum, uso ilimitado

5. **CDN global:** GitHub usa CDN, o site carrega rápido no mundo todo

## 🎯 Resultado final

Seu PWA estará:
- ✅ Online em HTTPS
- ✅ Instalável no celular e desktop
- ✅ Funcionando offline
- ✅ Com ícones bonitos
- ✅ Completamente gratuito
- ✅ Atualizável com um comando

**URL final:** `https://SEU_USUARIO.github.io/SorrisoAgiotagem/`

Compartilhe essa URL e qualquer um pode instalar seu app! 🎉
