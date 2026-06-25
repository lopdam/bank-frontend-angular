import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  {
    path: 'products',
    loadComponent: () =>
      import(
        './features/products/presentation/pages/product-list/product-list.component'
      ).then(m => m.ProductListComponent),
  },
  {
    path: 'products/add',
    loadComponent: () =>
      import(
        './features/products/presentation/pages/product-form/product-form.component'
      ).then(m => m.ProductFormComponent),
  },
  {
    path: 'products/edit/:id',
    loadComponent: () =>
      import(
        './features/products/presentation/pages/product-form/product-form.component'
      ).then(m => m.ProductFormComponent),
  },
  { path: '**', redirectTo: 'products' },
];
