# Guia PWA - Sorriso Agiotagem

O sistema agora é um **Progressive Web App (PWA)** completo! Isso significa que pode ser instalado como um app nativo no celular e funcionar offline.

## ✅ O que foi implementado

### 1. **Manifest.json** (`public/manifest.json`)
- Nome do app: "Sorriso - Agiotagem & Cobrança"
- Ícones PWA (192x192 e 512x512)
- Tema e cores personalizadas
- Modo standalone (abre sem barra do navegador)

### 2. **Service Worker** (`public/sw.js`)
- Cache inteligente dos arquivos do app
- Funcionalidade offline (Network First com fallback para Cache)
- Atualização automática de cache
- Preparado para sincronização em background
- Preparado para notificações push

### 3. **Meta Tags PWA** (`index.html`)
- Suporte para iOS (Apple)
- Suporte para Android
- Tema color personalizado
- Configurações de viewport otimizadas

### 4. **Componente de Instalação** (`InstalarPWA.jsx`)
- Banner bonito convidando para instalar
- Aparece apenas quando o PWA pode ser instalado
- Fechável se o usuário não quiser instalar

### 5. **Registro do Service Worker** (`main.jsx`)
- Registra automaticamente ao carregar o app
- Console logs para debugging

## 📱 Como testar no celular

### Android (Chrome):

1. **Build e serve o app:**
   ```bash
   npm run build
   npm run preview
   ```

2. **Acesse no celular:**
   - Abra o Chrome no Android
   - Digite o IP da sua máquina + porta (ex: `http://192.168.1.100:4173`)
   - Ou publique em um servidor HTTPS

3. **Instalar:**
   - Clique no botão "Instalar" que aparece no banner
   - OU vá no menu do Chrome (⋮) > "Adicionar à tela inicial"
   - O app será instalado e aparecerá na gaveta de apps

4. **Usar offline:**
   - Depois de abrir o app uma vez, feche tudo
   - Ative o modo avião
   - Abra o app instalado - ele funcionará offline!

### iOS (Safari):

1. **Acesse no iPhone:**
   - Abra o Safari
   - Digite o endereço do app

2. **Adicionar à tela inicial:**
   - Toque no botão de compartilhar (□↑)
   - Role e toque em "Adicionar à Tela de Início"
   - Confirme o nome e toque em "Adicionar"

3. **Nota:** iOS não suporta Service Workers tão bem quanto Android, mas o app ainda funcionará como atalho.

## 🖥️ Como testar no Desktop

### Chrome/Edge:

1. **Build e serve:**
   ```bash
   npm run build
   npm run preview
   ```

2. **Abra no Chrome:** `http://localhost:4173`

3. **Verificar PWA:**
   - Abra DevTools (F12)
   - Vá em **Application** > **Manifest**
   - Verifique se o manifest está carregado
   - Vá em **Service Workers**
   - Verifique se está registrado e ativo

4. **Instalar:**
   - Clique no ícone de instalação na barra de endereços (➕)
   - OU clique no banner "Instalar App"

5. **Testar Offline:**
   - DevTools > Application > Service Workers
   - Marque "Offline"
   - Recarregue a página - deve funcionar!

## 🚀 Deploy para produção

Para o PWA funcionar corretamente em produção:

### Requisitos obrigatórios:

1. **HTTPS:** PWAs só funcionam com HTTPS (ou localhost)
   - Use Vercel, Netlify, ou qualquer host com SSL

2. **Build de produção:**
   ```bash
   npm run build
   ```

3. **Arquivos que devem estar na pasta `dist`:**
   - `manifest.json`
   - `sw.js`
   - `logo-192.png`
   - `logo-512.png`

### Opções de deploy gratuito:

#### Vercel (Recomendado):
```bash
npm install -g vercel
vercel
```

#### Netlify:
1. Arraste a pasta `dist` para https://app.netlify.com/drop
2. Ou use: `npm install -g netlify-cli && netlify deploy`

#### GitHub Pages:
```bash
npm run build
# Suba a pasta dist para o GitHub Pages
```

## 🔧 Configurações avançadas

### Atualizar cache do Service Worker:

Quando fizer alterações no app, aumente a versão do cache em `public/sw.js`:

```javascript
const CACHE_NAME = 'sorriso-agiotagem-v2'; // Mude v1 para v2, v3, etc.
```

### Adicionar mais arquivos ao cache:

Edite `public/sw.js` e adicione URLs em `urlsToCache`:

```javascript
const urlsToCache = [
  '/',
  '/index.html',
  '/logo.png',
  // Adicione mais aqui
];
```

### Testar instalabilidade:

Use o Lighthouse no Chrome DevTools:
1. F12 > Lighthouse
2. Marque "Progressive Web App"
3. Clique em "Generate report"
4. Deve passar todos os testes de PWA!

## 📋 Checklist de funcionalidades PWA

- ✅ Manifest.json configurado
- ✅ Service Worker registrado
- ✅ Ícones 192x192 e 512x512
- ✅ Meta tags para iOS e Android
- ✅ Funciona offline
- ✅ Instalável no celular
- ✅ Instalável no desktop
- ✅ Banner de instalação customizado
- ✅ Tema color personalizado
- ✅ Modo standalone (sem barra do navegador)
- ⚠️ Precisa HTTPS para produção

## 🎯 Próximos passos (opcionais)

1. **Notificações Push:** Avisar sobre vencimentos
2. **Background Sync:** Sincronizar dados quando voltar online
3. **Update prompt:** Avisar quando houver nova versão
4. **Share API:** Compartilhar cobranças via WhatsApp
5. **Ícones adaptativos:** Melhor aparência em Android

## 🐛 Troubleshooting

### "Service Worker não registra"
- Verifique se está usando HTTPS ou localhost
- Verifique console do navegador por erros
- Limpe cache: DevTools > Application > Clear storage

### "Não aparece opção de instalar"
- Precisa HTTPS em produção
- Verifique Manifest no DevTools
- iOS: use "Adicionar à Tela de Início" manual
- Já instalado? Desinstale primeiro

### "Offline não funciona"
- Abra o app online primeiro (para cachear)
- Verifique Service Worker no DevTools
- Limpe cache e tente novamente

### "Ícones não aparecem"
- Verifique se `logo-192.png` e `logo-512.png` existem em `public/`
- Siga as instruções em `GERAR_ICONES_PWA.md`

## 📞 Suporte

Para problemas com PWA, verifique:
1. Console do navegador (F12)
2. DevTools > Application > Manifest
3. DevTools > Application > Service Workers
