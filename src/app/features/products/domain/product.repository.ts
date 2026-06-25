import { Observable } from 'rxjs';
import { Product } from './product.model';

export abstract class IProductRepository {
  abstract getAll(): Observable<Product[]>;
  abstract create(product: Product): Observable<Product>;
  abstract update(id: string, product: Omit<Product, 'id'>): Observable<Product>;
  abstract delete(id: string): Observable<void>;
  abstract verifyId(id: string): Observable<boolean>;
}
