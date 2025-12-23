import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // em centavos
  category: text("category").notNull(), // 'iphone', 'samsung'
  year: integer("year").notNull(),
  images: text("images").array().notNull(),
  specs: jsonb("specs").$type<Record<string, string>>().notNull(),
  featured: boolean("featured").default(false),
  storage: text("storage").notNull(), // '64GB', '128GB', etc
  pixKey: text("pix_key").notNull(), // Chave PIX para receber pagamentos
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerCpf: text("customer_cpf").notNull(),
  customerWhatsapp: text("customer_whatsapp"),
  customerPhone: text("customer_phone"),
  address: text("address").notNull(),
  productId: integer("product_id").notNull(),
  installments: integer("installments").notNull(), // 1, 2, 3... até 12
  totalAmount: integer("total_amount").notNull(), // em centavos
  status: text("status").notNull().default("pending"), // pending, paid, confirmed
  pixConfirmed: boolean("pix_confirmed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const feedbacks = pgTable("feedbacks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  text: text("text").notNull(),
  rating: integer("rating").notNull(),
  date: text("date").notNull(),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, status: true, createdAt: true, pixConfirmed: true }).extend({
  customerWhatsapp: z.string().optional(),
});
export const insertFeedbackSchema = createInsertSchema(feedbacks).omit({ id: true });

export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Feedback = typeof feedbacks.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
