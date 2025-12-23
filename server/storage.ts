import { products, orders, feedbacks, type Product, type Order, type Feedback, type InsertOrder } from "@shared/schema";

export interface IStorage {
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getFeedbacks(): Promise<Feedback[]>;
  seedProducts(products: any[]): Promise<void>;
  seedFeedbacks(feedbacks: any[]): Promise<void>;
}

export class MemStorage implements IStorage {
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private feedbacks: Map<number, Feedback>;
  private currentOrderId: number;
  private currentProductId: number;
  private currentFeedbackId: number;

  constructor() {
    this.products = new Map();
    this.orders = new Map();
    this.feedbacks = new Map();
    this.currentOrderId = 1;
    this.currentProductId = 1;
    this.currentFeedbackId = 1;
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const order: Order = { 
      ...insertOrder, 
      id, 
      status: "pending", 
      createdAt: new Date() 
    };
    this.orders.set(id, order);
    return order;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getFeedbacks(): Promise<Feedback[]> {
    return Array.from(this.feedbacks.values());
  }

  async seedProducts(productsList: any[]): Promise<void> {
    if (this.products.size > 0) return;
    productsList.forEach(p => {
      const id = this.currentProductId++;
      this.products.set(id, { ...p, id });
    });
  }

  async seedFeedbacks(feedbacksList: any[]): Promise<void> {
    if (this.feedbacks.size > 0) return;
    feedbacksList.forEach(f => {
      const id = this.currentFeedbackId++;
      this.feedbacks.set(id, { ...f, id });
    });
  }
}

export const storage = new MemStorage();
