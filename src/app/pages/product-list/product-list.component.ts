import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductService } from '../../shared/services/product.service';
import { AuthService } from '../../shared/services/auth.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Product } from '../../shared/models/Product';
import { Subscription, lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  isLoggedIn = false;
  limit = 8;
  offset: string | undefined = undefined; // Using a string to represent the last product ID
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
      this.limit = this.isLoggedIn ? 16 : 8;
      this.loadProductCount();
      await this.loadProducts();
    });

    this.subscriptions.add(authSubscription);
  }

  loadProductCount(): void {
    this.productService.getProductCount().subscribe(count => {
      this.totalProducts = count;
    });
  }

  async loadProducts() {
    this.productService.getProducts(this.limit, this.offset).subscribe(async data => {
      this.products = data;

      for (const product of this.products) {
        if (product.imageId) {
          const imgRef = this.storage.ref(`images/${product.imageId}.png`);
          try {
            product.imageUrl = await lastValueFrom(imgRef.getDownloadURL());
          } catch (error) {
            console.log(`Failed to get download URL for imageId: ${product.imageId}`, error);
          }
        }
      }

      // Update offset with the last product's ID
      if (this.products.length > 0) {
        this.offset = this.products[this.products.length - 1].id;
      }
    });
  }

  async next() {
    if ((this.currentPage * this.limit) < this.totalProducts) {
      this.currentPage++;
      await this.loadProducts();
    }
  }

  async prev() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.offset = undefined; // Reset offset for previous page
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
