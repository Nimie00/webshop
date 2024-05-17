export interface Order {
  id: number;
  userId: number;
  products: [number, number][]; // Array of [productId, quantity]
  totalPrice: number;
  status: string;
}
