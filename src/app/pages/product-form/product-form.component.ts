import { finalize } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../shared/services/product.service';
import { Product } from '../../shared/models/Product';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private storage: AngularFireStorage
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  getNextProductId(): Observable<string> {
    return new Observable<string>(observer => {
      this.productService.getAllProducts().subscribe({
        next: (products) => {
          console.log("Products fetched:", products);
          if (!products || products.length === 0) {
            observer.next("1");
          } else {
            const ids = products.map((product: Product) => parseInt(product.id));
            const maxid = Math.max(...ids);
            observer.next((maxid + 1).toString());
          }
          observer.complete();
        },
        error: (error) => {
          console.log('Error fetching products:', error);
          observer.next("1");
          observer.complete();
        }
      });
    });
  }

  async onSubmit() {
    if (this.productForm.valid && this.selectedFile) {
      console.log("Form is valid and file is selected.");
      const productData = this.productForm.value;
      console.log("itt");

      this.getNextProductId().subscribe({
        next: async (newProductId) => {
          console.log("ott");
          const filePath = `images/${newProductId}.png`;
          const uploadTask = this.storage.upload(filePath, this.selectedFile);

          uploadTask.snapshotChanges().pipe(
            finalize(async () => {
              try {
                const newProduct: Product = {
                  id: newProductId,
                  name: productData.name,
                  description: productData.description,
                  price: productData.price,
                  imageId: newProductId
                };
                await this.productService.createProduct(newProduct);
                alert('Product successfully added to database');
                console.log('Product successfully added to database');
                this.productForm.reset();
                this.selectedFile = null;
              } catch (error) {
                alert('Error adding product to database: ' + error);
                console.log('Error adding product to database: ', error);
              }
            })
          ).subscribe();
          console.log('Image successfully uploaded to storage');
        },
        error: (error) => {
          alert('Error generating new product ID: ' + error.message);
          console.log('Error generating new product ID: ', error);
        }
      });
    } else {
      alert('Form is invalid or file not selected');
      console.log('Form is invalid or file not selected');
    }
  }
}
