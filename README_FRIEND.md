# PROJETO PAPPERTOYS (Versão Limpa) 🎨✂️

Este é o código fonte completo do projeto Pappertoys (Bobbie Goods / LEGO / etc), pronto para rodar.

## O que tem aqui?
1.  **Backend:** O servidor, banco de dados e os arquivos (imagens/PDFs).
2.  **Frontend:** O site visual que as pessoas acessam.

## Como Rodar (Para seu amigo)

### Pré-requisitos
- Ter o **Node.js** instalado.
- Ter o **PostgreSQL** (se for rodar local) ou uma URL de banco (Supabase/Render).

### Passo 1: Configurar Backend
1.  Abra a pasta `backend`.
2.  Crie um arquivo `.env` (copie o `.env.example` se tiver, ou use as chaves do projeto original).
    *   Precisa definir `DATABASE_URL` (Link do banco de dados).
3.  No terminal, dentro da pasta `backend`:
    ```bash
    npm install
    npx prisma generate
    npx prisma db push  # Cria as tabelas no banco
    node prisma/seed.js # Enche o banco com os Pappertoys (MUITO IMPORTANTE)
    npm start
    ```

### Passo 2: Configurar Frontend
1.  Abra a pasta `frontend`.
2.  Crie o arquivo `.env.local`:
    ```env
    NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
    ```
3.  No terminal, dentro da pasta `frontend`:
    ```bash
    npm install
    npm run dev
    ```

### Passo 3: Acessar
- O site abrirá em `http://localhost:3000`.

---
**Observação sobre os Arquivos:**
Todo o conteúdo (imagens dos bonecos) está na pasta `backend/uploads`. Se quiser adicionar mais, coloque lá e rode o seed novamente ou use o painel.
