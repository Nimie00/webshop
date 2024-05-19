import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductDetailsComponent } from './product-details.component';
import { RouterModule, Routes } from '@angular/router';
import {FormsModule} from "@angular/forms";

const routes: Routes = [
  { path: '', component: ProductDetailsComponent }
];

@NgModule({
  declarations: [ProductDetailsComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule
    ]
})
export class ProductDetailsModule { }
