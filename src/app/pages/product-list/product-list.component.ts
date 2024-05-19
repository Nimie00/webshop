import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductService } from '../../shared/services/product.service';
import { AuthService } from '../../shared/services/auth.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Product } from '../../shared/models/Product';
import { Subscription } from 'rxjs';
import { lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  isLoggedIn = false;
  limit = 10;
  offset = 0;
  currentPage = 1;
  totalProducts = 0;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private storage: AngularFireStorage,
    private router: Router
  ) { }

  ngOnInit(): void {
    const authSubscription = this.authService.isUserLoggedIn().subscribe(async isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      this.limit = this.isLoggedIn ? 24 : 10;
      await this.loadProducts();
    });

    this.subscriptions.add(authSubscription);
  }

  async loadProducts() {
    const productSubscription = this.productService.getProducts(this.limit, this.offset).subscribe(async data => {
      this.products = data;
      this.totalProducts = data.length;

      for (const product of this.products) {
        if (product.imageId) {
          const imgRef = this.storage.ref(`images/${product.imageId}.png`);
          try {
            product.imageUrl = await lastValueFrom(imgRef.getDownloadURL());
          } catch (error) {
            console.error(`Failed to get download URL for imageId: ${product.imageId}`, error);
          }
        }
      }
    });

    this.subscriptions.add(productSubscription);
  }

  async next() {
    if ((this.offset + this.limit) < this.totalProducts) {
      this.offset += this.limit;
      this.currentPage++;
      await this.loadProducts();
    }
  }

  async prev() {
    if (this.offset > 0) {
      this.offset -= this.limit;
      this.currentPage--;
      await this.loadProducts();
    }
  }

  onProductClick(product: Product) {
    if (this.isLoggedIn) {
      this.router.navigate([`/product/${product.id}`]);
    } else {
      alert('Please log in to view product details.');
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
