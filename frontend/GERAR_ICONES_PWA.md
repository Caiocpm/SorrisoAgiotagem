# Gerar Ícones PWA

Para completar a configuração PWA, você precisa gerar os ícones nos tamanhos corretos.

## Opção 1: Usar um site online (Mais fácil)

1. Acesse: https://www.pwabuilder.com/imageGenerator
2. Faça upload do arquivo `src/logo.png`
3. Baixe os ícones gerados
4. Copie os arquivos `logo-192.png` e `logo-512.png` para a pasta `public/`

## Opção 2: Usar ImageMagick (Linha de comando)

Se você tiver o ImageMagick instalado, execute estes comandos na pasta `frontend`:

```bash
# Instalar ImageMagick (se necessário)
# Windows: choco install imagemagick
# Mac: brew install imagemagick
# Linux: sudo apt-get install imagemagick

# Gerar ícone 192x192
magick src/logo.png -resize 192x192 public/logo-192.png

# Gerar ícone 512x512
magick src/logo.png -resize 512x512 public/logo-512.png
```

## Opção 3: Usar Paint/Photoshop

1. Abra `src/logo.png` no Paint ou Photoshop
2. Redimensione para 192x192 pixels e salve como `public/logo-192.png`
3. Redimensione para 512x512 pixels e salve como `public/logo-512.png`

## Verificação

Após gerar os ícones, verifique se existem os arquivos:
- `public/logo-192.png`
- `public/logo-512.png`

## Testar PWA

1. Execute o build: `npm run build`
2. Sirva os arquivos: `npm run preview` ou use um servidor HTTP
3. Abra no navegador e verifique:
   - Chrome DevTools > Application > Manifest
   - Chrome DevTools > Application > Service Workers
4. No celular, abra o site e clique em "Adicionar à tela inicial"
