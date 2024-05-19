import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private collectionName = 'orders';

  constructor(private afs: AngularFirestore) {}

  createOrder(userId: string, productId: string): Promise<void> {
    const orderId = this.afs.createId();
    return this.afs.collection(this.collectionName).doc(orderId).set({
      userId,
      productId
    });
  }

  cancelOrder(userId: string, productId: string): Promise<void> {
    return this.afs.collection(this.collectionName, ref => ref.where('userId', '==', userId).where('productId', '==', productId)).get().toPromise().then(snapshot => {
      if (snapshot) {
        const batch = this.afs.firestore.batch();
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        return batch.commit();
      } else {
        return Promise.resolve(); // Ha nincs snapshot, nincs mit törölni
      }
    });
  }

  checkIfOrdered(userId: string, productId: string): Observable<boolean> {
    return this.afs.collection(this.collectionName, ref => ref.where('userId', '==', userId).where('productId', '==', productId)).get().pipe(
      map(snapshot => !snapshot.empty)
    );
  }
}
