import {finalize} from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../shared/services/product.service';
import { Product } from '../../shared/models/Product';

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

  async getNextProductId(): Promise<string> {
    const products = await this.productService.getAllProducts().toPromise();
    if (!products) {
      return "1";
    }
    const ids = products.map((product: Product) => product.id);
    let maxid = 0
    ids.forEach((id) => {
      if(parseInt(id) > maxid){
        maxid = parseInt(id)
      }
    })
    return maxid.toString()
  }

  async onSubmit() {
    if (this.productForm.valid && this.selectedFile) {
      const productData = this.productForm.value;
      const filePath = `products/${Date.now()}_${this.selectedFile.name}`;
      const fileRef = this.storage.ref(filePath);
      const uploadTask = this.storage.upload(filePath, this.selectedFile);

      uploadTask.snapshotChanges().pipe(
        finalize(async () => {
          const url = await fileRef.getDownloadURL().toPromise();
          const newProductId = await this.getNextProductId();
          const newProduct: Product = {
            id: newProductId,
            name: productData.name,
            description: productData.description,
            price: productData.price,
            imageId: url
          };
          this.productService.createProduct(newProduct).then(() => {
            this.productForm.reset();
            this.selectedFile = null;
          });
        })
      ).subscribe();
    }
  }
}
