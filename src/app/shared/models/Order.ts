import {Product} from "./Product";
import {User} from "./User";

export interface Order {
  id: number;
  products: Product[]; // Array of products in the order
  user: User; // User who placed the order
  totalPrice: number;
  status: string; // Status of the order (e.g., "pending", "shipped", "delivered")
}
