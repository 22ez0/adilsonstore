# 📱 Loja E-commerce de Celulares (iPhones e Samsung)

## 📌 Visão Geral

Aplicação full-stack para venda de celulares com:
- ✅ Catálogo de produtos (iPhones e Samsung)
- ✅ Carrinho de compras funcional
- ✅ Checkout multi-etapas com validações
- ✅ Sistema de pagamento PIX com QR Code
- ✅ Upload de comprovante de pagamento (imagem/PDF até 5MB)
- ✅ Confirmação de pagamento apenas após envio do comprovante
- ✅ Integração com biblioteca `thunderpix` para PIX
- ✅ Modo escuro/claro
- ✅ Design responsivo

## 🏗️ Arquitetura

### Frontend (React + Vite)
- **Framework:** React com TypeScript
- **Roteamento:** Wouter
- **UI Components:** shadcn/ui (Radix UI + Tailwind)
- **State Management:** TanStack React Query (v5)
- **Formulários:** React Hook Form + Zod
- **Estilos:** Tailwind CSS
- **Animações:** Framer Motion

### Backend (Express + Node.js)
- **Framework:** Express
- **Database:** PostgreSQL (opcional) / In-memory storage
- **Validação:** Zod schemas
- **ORM:** Drizzle ORM
- **Autenticação:** Passport.js (local)

### Estrutura de Arquivos
```
├── client/src/
│   ├── pages/
│   │   ├── Checkout.tsx (fluxo de checkout multi-etapas)
│   │   ├── Home.tsx (catálogo de produtos)
│   │   └── ...
│   ├── components/
│   │   ├── ui/ (shadcn components)
│   │   └── ...
│   └── App.tsx
├── server/
│   ├── routes.ts (endpoints da API)
│   ├── storage.ts (interface de armazenamento)
│   └── index.ts (configuração Express)
├── shared/
│   └── schema.ts (schemas Zod dos dados)
└── package.json
```

## 🔧 Configuração e Instalação

### Dependências Principais
- **thunderpix**: PIX payment integration
- **qrcode**: QR code generation
- **@tanstack/react-query**: Data fetching
- **drizzle-orm**: ORM
- **react-hook-form**: Form management
- **tailwindcss**: Styling

### Variáveis de Ambiente
```
PIX_KEY=adilsonstore@2mail.co (padrão)
NODE_ENV=production
PORT=5000
```

## 📊 Fluxo de Pagamento

1. **Seleção de Produto:** Usuário escolhe iPhone ou Samsung
2. **Checkout:** Preenchimento de dados de entrega
3. **Parcelamento:** Escolha entre 1x, 3x ou 12x via PIX
4. **QR Code PIX:** Exibição do código e chave PIX copiável
5. **Upload de Comprovante:** Usuário envia screenshot do pagamento
   - Aceita: Imagens (PNG, JPG, etc) ou PDF
   - Máximo: 5MB
   - Validações: Tipo de arquivo + tamanho
6. **Pré-visualização:** Exibe o comprovante enviado
7. **Confirmação:** Botão só ativa após envio do comprovante
8. **Sucesso:** Pedido confirmado com mensagem WhatsApp

## 🚀 Deploy no Render (Gratuito)

### Pré-requisitos
- Conta GitHub (gratuita)
- Conta Render (gratuita)
- Git instalado

### Passos Rápidos
1. Crie repositório no GitHub
2. Faça commit: `git add . && git commit -m "..."`
3. Push: `git push origin main`
4. No Render: New Web Service → Selecione repo
5. Configure:
   - Build: `npm install`
   - Start: `npm start`
   - Instance: Free
6. Deploy automático!

**Documentação completa:** Ver `RENDER_DEPLOYMENT.md` ou `DEPLOYMENT_QUICK_START.md`

## 🎨 Customizações

### Temas
- Modo claro/escuro automático
- Cores personalizáveis em `client/src/index.css`

### Produtos
- Editar catálogo em `client/src/pages/Home.tsx`
- Adicionar novos modelos: Atualizar `PRODUCTS` array

### Payments
- PIX Key configurável via variável de ambiente `PIX_KEY`
- Valores de parcelamento em `PLANS` array

## 🔒 Segurança

- ✅ Validação server-side com Zod
- ✅ Variáveis sensíveis em env (não no código)
- ✅ HTTPS automático no Render
- ✅ CORS configurado
- ✅ Session management com passport

## 📱 Responsividade

- Testado em: Desktop, Tablet, Mobile
- Componentes adaptáveis
- Layout fluid com Tailwind

## 👤 Preferências do Usuário

- Linguagem: Português (Brasil)
- Deploy: Render gratuito
- Pagamento: PIX com comprovante obrigatório
- Comunicação: WhatsApp para confirmação

## 🔄 Últimas Mudanças (Dec 23, 2025)

1. ✅ Integração thunderpix para PIX
2. ✅ Sistema de upload de comprovante
3. ✅ Validação de arquivo (5MB, imagem/PDF)
4. ✅ Pré-visualização do comprovante
5. ✅ Botão confirmação habilitado só após comprovante
6. ✅ Guias de deploy no Render

## 📞 Suporte

- **Render Docs:** https://render.com/docs
- **GitHub Docs:** https://docs.github.com
- **Drizzle Docs:** https://orm.drizzle.team
- **shadcn/ui:** https://ui.shadcn.com

---

**Status:** ✅ Pronta para production  
**Última atualização:** 23 de dezembro de 2025
