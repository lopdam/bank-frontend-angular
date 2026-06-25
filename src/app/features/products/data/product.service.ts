import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from '../../../core/constants/api.constants';
import { IProductRepository } from '../domain/product.repository';
import {
  Product,
  ProductListResponse,
  ProductMutationResponse,
} from '../domain/product.model';

@Injectable()
export class ProductService extends IProductRepository {
  private readonly http = inject(HttpClient);

  getAll(): Observable<Product[]> {
    return this.http
      .get<ProductListResponse>(`${API_BASE_URL}/products`)
      .pipe(map(res => res.data));
  }

  create(product: Product): Observable<Product> {
    return this.http
      .post<ProductMutationResponse>(`${API_BASE_URL}/products`, product)
      .pipe(map(res => res.data));
  }

  update(id: string, product: Omit<Product, 'id'>): Observable<Product> {
    return this.http
      .put<ProductMutationResponse>(`${API_BASE_URL}/products/${id}`, product)
      .pipe(map(res => res.data));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/products/${id}`);
  }

  verifyId(id: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${API_BASE_URL}/products/verification/${id}`
    );
  }
}
