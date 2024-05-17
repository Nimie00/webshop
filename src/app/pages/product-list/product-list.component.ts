import { Component, OnInit, OnDestroy  } from '@angular/core';
import { ProductService } from '../../shared/services/product.service';
import { AuthService } from '../../shared/services/auth.service';
import { Product } from '../../shared/models/Product';
import { Subscription } from 'rxjs';

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
  private subscriptions: Subscription = new Subscription();

  constructor(private productService: ProductService, private authService: AuthService) { }

  ngOnInit(): void {
    const authSubscription = this.authService.isUserLoggedIn().subscribe(user => {
      this.isLoggedIn = !!user;
      this.limit = this.isLoggedIn ? 24 : 10;
      this.loadProducts();
    });

    this.subscriptions.add(authSubscription);
  }

  loadProducts() {
    const productSubscription = this.productService.getProducts(this.limit).subscribe(data => {
      this.products = data.slice(this.offset, this.offset + this.limit);
    });

    this.subscriptions.add(productSubscription);
  }

  next() {
    this.offset += this.limit;
    this.loadProducts();
  }

  prev() {
    if (this.offset > 0) {
      this.offset -= this.limit;
      this.loadProducts();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
