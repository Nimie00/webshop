import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Product } from '../models/Product';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private collectionName = 'products';
  private productsCollection: AngularFirestoreCollection<Product>;

  constructor(private afs: AngularFirestore) {
    this.productsCollection = afs.collection<Product>(this.collectionName);
  }

  getProducts(limitCount: number, lastDocId?: string): Observable<Product[]> {
    let query = this.afs.collection<Product>(this.collectionName, ref => {
      let queryRef = ref.orderBy('id').limit(limitCount);
      if (lastDocId) {
        queryRef = queryRef.startAfter(lastDocId);
      }
      return queryRef;
    });
    return query.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Product;
        return { ...data };
      }))
    );
  }

  getProductCount(): Observable<number> {
    return this.afs.collection<Product>(this.collectionName).snapshotChanges().pipe(
      map(actions => actions.length)
    );
  }

  getProductById(id: number): Observable<Product | null> {
    return this.afs.collection<Product>(this.collectionName).doc(id.toString()).snapshotChanges().pipe(
      map(action => {
        const data = action.payload.data();
        if (data) {
          return { ...data } as Product;
        } else {
          return null;
        }
      })
    );
  }

  createProduct(product: Product): Promise<void> {
    return this.afs.collection(this.collectionName).doc(product.id).set(product);
  }

  getAllProducts(): Observable<Product[]> {
    return this.afs.collection<Product>(this.collectionName).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Product;
        return { ...data };
      }))
    );
  }

  createIdd(): string {
    return this.afs.createId();
  }
}
