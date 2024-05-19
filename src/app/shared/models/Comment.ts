export interface Comment {
  id: string; // A Firestore által generált azonosító
  userId: string;
  productId: string;
  comment: string;
  date: number;
  rating: number;
}
