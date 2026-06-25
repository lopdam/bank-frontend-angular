import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ProductFormComponent } from './product-form.component';
import { IProductRepository } from '../../../domain/product.repository';
import { Product } from '../../../domain/product.model';

const mockProduct: Product = {
  id: 'trj-crd',
  name: 'Tarjeta Credito',
  description: 'Descripcion larga para tarjeta de credito',
  logo: 'http://logo.png',
  date_release: '2025-01-01',
  date_revision: '2026-01-01',
};

const mockRepo: IProductRepository = {
  getAll: () => of([mockProduct]),
  create: (_p: Product) => of(mockProduct),
  update: (_id: string, _p: Omit<Product, 'id'>) => of(mockProduct),
  delete: (_id: string) => of(undefined as unknown as void),
  verifyId: (_id: string) => of(false),
};

describe('ProductFormComponent — Add Mode', () => {
  let fixture: ComponentFixture<ProductFormComponent>;
  let component: ProductFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormComponent],
      providers: [
        provideRouter([]),
        { provide: IProductRepository, useValue: mockRepo },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates in add mode', () => {
    expect(component).toBeTruthy();
    expect(component['isEditMode']).toBe(false);
  });

  it('ID field is enabled in add mode', () => {
    expect(component['form'].get('id')!.enabled).toBe(true);
  });

  it('form is invalid when all fields are empty', () => {
    expect(component['form'].invalid).toBe(true);
  });

  it('hasError() returns false when field is not touched', () => {
    expect(component['hasError']('name')).toBe(false);
  });

  it('hasError() returns true for specific error after touch', () => {
    const ctrl = component['form'].get('name')!;
    ctrl.markAsTouched();
    expect(component['hasError']('name', 'required')).toBe(true);
  });

  it('date_revision auto-fills one year after date_release', () => {
    component['form'].get('date_release')!.setValue('2025-03-15');
    expect(component['form'].get('date_revision')!.value).toBe('2026-03-15');
  });

  it('date_revision rolls over correctly for leap day (Feb 29 → Mar 1)', () => {
    component['form'].get('date_release')!.setValue('2024-02-29');
    expect(component['form'].get('date_revision')!.value).toBe('2025-03-01');
  });

  it('reset() clears all fields', () => {
    component['form'].get('name')!.setValue('Test Name');
    component['reset']();
    expect(component['form'].get('name')!.value).toBeNull();
  });

  it('submit() marks form touched and does not call repo when invalid', () => {
    let createCalled = false;
    const originalCreate = mockRepo.create.bind(mockRepo);
    mockRepo.create = (...args: Parameters<typeof mockRepo.create>) => {
      createCalled = true;
      return originalCreate(...args);
    };
    component['submit']();
    expect(createCalled).toBe(false);
    expect(component['form'].get('name')!.touched).toBe(true);
    mockRepo.create = originalCreate;
  });
});

describe('ProductFormComponent — Edit Mode', () => {
  let fixture: ComponentFixture<ProductFormComponent>;
  let component: ProductFormComponent;

  beforeEach(async () => {
    Object.defineProperty(window, 'history', {
      writable: true,
      value: { state: { product: mockProduct } },
    });

    await TestBed.configureTestingModule({
      imports: [ProductFormComponent],
      providers: [
        provideRouter([]),
        { provide: IProductRepository, useValue: mockRepo },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'trj-crd' } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('detects edit mode from route param', () => {
    expect(component['isEditMode']).toBe(true);
    expect(component['editId']).toBe('trj-crd');
  });

  it('ID field is disabled in edit mode', () => {
    expect(component['form'].get('id')!.disabled).toBe(true);
  });

  it('pre-fills form with product data from history state', () => {
    expect(component['form'].get('name')!.value).toBe(mockProduct.name);
    expect(component['form'].get('description')!.value).toBe(
      mockProduct.description
    );
    expect(component['form'].get('logo')!.value).toBe(mockProduct.logo);
  });
});
