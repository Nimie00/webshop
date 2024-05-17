import { NgModule } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { ProductDetailsComponent } from './product-details.component';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

const routes: Routes = [
  { path: ':id', component: ProductDetailsComponent }
];

@NgModule({
  declarations: [ProductDetailsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    NgOptimizedImage
  ]
})
export class ProductDetailsModule { }
