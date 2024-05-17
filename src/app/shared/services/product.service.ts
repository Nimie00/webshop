// product.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Product } from '../models/Product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  collectionName = 'products';

  constructor(private afs: AngularFirestore) { }

  getProducts(limit: number) {
    return this.afs.collection<Product>(this.collectionName, ref => ref.limit(limit)).valueChanges({ idField: 'id' });
  }

  getProductById(id: number) {
    return this.afs.collection<Product>(this.collectionName).doc(id.toString()).valueChanges();
  }

  createProduct(product: Product) {
    return this.afs.collection<Product>(this.collectionName).doc(product.id.toString()).set(product);
  }

  updateProduct(product: Product) {
    return this.afs.collection<Product>(this.collectionName).doc(product.id.toString()).set(product);
  }

  deleteProduct(productId: number) {
    return this.afs.collection<Product>(this.collectionName).doc(productId.toString()).delete();
  }
}
