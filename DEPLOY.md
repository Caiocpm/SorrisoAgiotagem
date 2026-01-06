# Guia de Deploy no GitHub Pages

## Passos para Deploy

### 1. Inicializar Git (se ainda não fez)

```bash
git init
git add .
git commit -m "Initial commit - Sistema de carteira de clientes"
```

### 2. Criar Repositório no GitHub

1. Acesse https://github.com/new
2. Nome do repositório: `Agiotagem-Co` (ou outro nome de sua preferência)
3. Deixe como público
4. NÃO inicialize com README
5. Clique em "Create repository"

### 3. Conectar e Fazer Push

```bash
git remote add origin https://github.com/SEU_USUARIO/Agiotagem-Co.git
git branch -M main
git push -u origin main
```

### 4. Configurar GitHub Pages

1. Vá ao seu repositório no GitHub
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Pages**
4. Em "Source", selecione **GitHub Actions**

### 5. Aguardar o Deploy

1. Vá na aba **Actions** do seu repositório
2. Você verá o workflow "Deploy to GitHub Pages" rodando
3. Aguarde alguns minutos até completar
4. Quando terminar, seu site estará disponível em:
   ```
   https://SEU_USUARIO.github.io/Agiotagem-Co/
   ```

## Se usar nome de repositório diferente

Se você escolheu um nome diferente de `Agiotagem-Co`, edite o arquivo `frontend/vite.config.js`:

```js
export default defineConfig({
  plugins: [react()],
  base: '/NOME-DO-SEU-REPOSITORIO/',  // <-- Altere aqui
  // ...
})
```

Depois faça commit e push novamente:

```bash
git add frontend/vite.config.js
git commit -m "Update base path"
git push
```

## Atualizações Futuras

Toda vez que você fizer alterações e der push para a branch `main`, o site será atualizado automaticamente:

```bash
git add .
git commit -m "Descrição das alterações"
git push
```

## Testando Localmente Antes do Deploy

Sempre teste localmente antes de fazer o deploy:

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:3000` para testar.
