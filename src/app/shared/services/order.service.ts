import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Order } from '../models/Order';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  collectionName = 'orders';

  constructor(private afs: AngularFirestore) { }

  getOrdersByUserId(userId: number) {
    return this.afs.collection<Order>(this.collectionName, ref => ref.where('userId', '==', userId)).valueChanges({ idField: 'id' });
  }

  createOrder(order: Order) {
    return this.afs.collection<Order>(this.collectionName).doc(order.id.toString()).set(order);
  }

  updateOrder(order: Order) {
    return this.afs.collection<Order>(this.collectionName).doc(order.id.toString()).set(order);
  }

  deleteOrder(orderId: number) {
    return this.afs.collection<Order>(this.collectionName).doc(orderId.toString()).delete();
  }

  hasOrderedProduct(userId: number, productId: number): Observable<boolean> {
    return this.getOrdersByUserId(userId).pipe(
      map(orders => orders.some(order => order.products.some(p => p[0] === productId)))
    );
  }
}
