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

  getProducts(limitCount: number, offset: number): Observable<Product[]> {
    return this.afs.collection<Product>(this.collectionName, ref => ref
      .orderBy('id') // feltételezve, hogy van egy 'id' mező
      .startAt(offset)
      .limit(limitCount))
      .snapshotChanges().pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Product;
          return { ...data };
        }))
      );
  }

  getProductById(id: number): Observable<Product | null> {
    const docName = id === 1 ? 'product' : `product${id}`;
    return this.afs.collection<Product>(this.collectionName).doc(docName).snapshotChanges().pipe(
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

  updateProduct(product: Product): Promise<void> {
    return this.productsCollection.doc(product.id.toString()).set(product);
  }

  deleteProduct(productId: number): Promise<void> {
    return this.productsCollection.doc(productId.toString()).delete();
  }

  getAllProducts(): Observable<Product[]> {
    return this.afs.collection<Product>(this.collectionName).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Product;
        return { ...data };
      }))
    );
  }

  createId(): string {
    return this.afs.createId();
  }
}
