import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductListComponent } from './product-list.component';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

const routes: Routes = [
  { path: '', component: ProductListComponent }
];

@NgModule({
  declarations: [ProductListComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule
  ]
})
export class ProductListModule { }
