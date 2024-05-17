import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { AdminComponent } from './admin.component';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../shared/services/auth.guard';
import { AdminGuard } from '../../shared/services/admin.guard';
import { ProductFormModule } from '../product-form/product-form.module';

@NgModule({
  declarations: [
    AdminComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    ProductFormModule, // Importáljuk a ProductFormModule-t
    RouterModule.forChild([
      {
        path: '',
        component: AdminComponent,
        canActivate: [AuthGuard, AdminGuard]
      }
    ])
  ]
})
export class AdminModule { }
