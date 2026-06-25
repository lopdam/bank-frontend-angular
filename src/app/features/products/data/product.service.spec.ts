import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { API_BASE_URL } from '../../../core/constants/api.constants';
import { Product } from '../domain/product.model';

const mockProduct: Product = {
  id: 'test-1',
  name: 'Test Product',
  description: 'A test description here',
  logo: 'http://logo.png',
  date_release: '2025-01-01',
  date_revision: '2026-01-01',
};

describe('ProductService', () => {
  let service: ProductService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService],
    });
    service = TestBed.inject(ProductService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAll() maps response data array', () => {
    let result: Product[] | undefined;
    service.getAll().subscribe(p => (result = p));
    http
      .expectOne(`${API_BASE_URL}/products`)
      .flush({ data: [mockProduct] });
    expect(result).toEqual([mockProduct]);
  });

  it('create() sends POST and returns data', () => {
    let result: Product | undefined;
    service.create(mockProduct).subscribe(p => (result = p));
    const req = http.expectOne(`${API_BASE_URL}/products`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockProduct);
    req.flush({ message: 'ok', data: mockProduct });
    expect(result).toEqual(mockProduct);
  });

  it('update() sends PUT to correct URL and returns data', () => {
    const { id, ...payload } = mockProduct;
    let result: Product | undefined;
    service.update('test-1', payload).subscribe(p => (result = p));
    const req = http.expectOne(`${API_BASE_URL}/products/test-1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ message: 'ok', data: mockProduct });
    expect(result?.name).toBe(mockProduct.name);
  });

  it('delete() sends DELETE to correct URL', () => {
    let called = false;
    service.delete('test-1').subscribe(() => (called = true));
    const req = http.expectOne(`${API_BASE_URL}/products/test-1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'ok' });
    expect(called).toBe(true);
  });

  it('verifyId() returns true when id exists', () => {
    let result: boolean | undefined;
    service.verifyId('test-1').subscribe(v => (result = v));
    http
      .expectOne(`${API_BASE_URL}/products/verification/test-1`)
      .flush(true);
    expect(result).toBe(true);
  });

  it('verifyId() returns false when id is available', () => {
    let result: boolean | undefined;
    service.verifyId('new-id').subscribe(v => (result = v));
    http
      .expectOne(`${API_BASE_URL}/products/verification/new-id`)
      .flush(false);
    expect(result).toBe(false);
  });
});
