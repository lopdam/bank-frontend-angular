import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProductListComponent } from './product-list.component';
import { IProductRepository } from '../../../domain/product.repository';
import { Product } from '../../../domain/product.model';

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Alpha Product',
    description: 'Alpha description here',
    logo: '',
    date_release: '2025-01-01',
    date_revision: '2026-01-01',
  },
  {
    id: '2',
    name: 'Beta Service',
    description: 'Beta description here',
    logo: '',
    date_release: '2025-06-01',
    date_revision: '2026-06-01',
  },
  {
    id: '3',
    name: 'Gamma Plan',
    description: 'Gamma description details',
    logo: '',
    date_release: '2025-12-01',
    date_revision: '2026-12-01',
  },
];

const buildRepo = (overrides?: Partial<IProductRepository>): IProductRepository =>
  ({
    getAll: () => of(mockProducts),
    delete: (_id: string) => of(undefined as unknown as void),
    create: (_p: Product) => of(mockProducts[0]),
    update: (_id: string, _p: Omit<Product, 'id'>) => of(mockProducts[0]),
    verifyId: (_id: string) => of(false),
    ...overrides,
  }) as IProductRepository;

const createTestBed = (repo: IProductRepository) =>
  TestBed.configureTestingModule({
    imports: [ProductListComponent],
    providers: [
      provideRouter([]),
      { provide: IProductRepository, useValue: repo },
    ],
  }).compileComponents();

describe('ProductListComponent — happy path', () => {
  let fixture: ComponentFixture<ProductListComponent>;
  let component: ProductListComponent;

  beforeEach(async () => {
    await createTestBed(buildRepo());
    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('loads products on init and clears loading state', () => {
    expect(component['products']().length).toBe(3);
    expect(component['isLoading']()).toBe(false);
    expect(component['error']()).toBeNull();
  });

  it('filteredProducts returns all when search is empty', () => {
    expect(component['filteredProducts']().length).toBe(3);
  });

  it('filters by product name (case-insensitive)', () => {
    component['searchTerm'].set('alpha');
    expect(component['filteredProducts']().length).toBe(1);
    expect(component['filteredProducts']()[0].name).toBe('Alpha Product');
  });

  it('filters by product description', () => {
    component['searchTerm'].set('beta description');
    expect(component['filteredProducts']().length).toBe(1);
  });

  it('returns empty array when no products match', () => {
    component['searchTerm'].set('zzz-no-match');
    expect(component['filteredProducts']().length).toBe(0);
  });

  it('paginates products by pageSize', () => {
    component['pageSize'].set(2);
    expect(component['paginatedProducts']().length).toBe(2);
  });

  it('resultCount reflects filtered products length', () => {
    component['searchTerm'].set('alpha');
    expect(component['resultCount']()).toBe(1);
  });

  it('openMenu() sets activeMenuId', () => {
    const fakeEvent = { stopPropagation: () => {}, currentTarget: { getBoundingClientRect: () => ({ bottom: 100, right: 200 }) } } as unknown as Event;
    component['openMenu']('1', fakeEvent);
    expect(component['activeMenuId']()).toBe('1');
  });

  it('openMenu() toggles off when same id clicked again', () => {
    const fakeEvent = { stopPropagation: () => {}, currentTarget: { getBoundingClientRect: () => ({ bottom: 100, right: 200 }) } } as unknown as Event;
    component['openMenu']('1', fakeEvent);
    component['openMenu']('1', fakeEvent);
    expect(component['activeMenuId']()).toBeNull();
  });

  it('openDeleteModal() sets deleteTarget and closes menu', () => {
    component['openDeleteModal'](mockProducts[0]);
    expect(component['deleteTarget']()).toEqual(mockProducts[0]);
    expect(component['activeMenuId']()).toBeNull();
  });

  it('closeDeleteModal() clears deleteTarget', () => {
    component['deleteTarget'].set(mockProducts[0]);
    component['closeDeleteModal']();
    expect(component['deleteTarget']()).toBeNull();
  });

  it('confirmDelete() removes product from list on success', () => {
    component['deleteTarget'].set(mockProducts[0]);
    component['confirmDelete']();
    expect(component['products']().length).toBe(2);
    expect(component['products']().find(p => p.id === '1')).toBeUndefined();
    expect(component['deleteTarget']()).toBeNull();
  });

  it('formatDate() converts ISO string to dd/mm/yyyy', () => {
    expect(component['formatDate']('2025-03-15')).toBe('15/03/2025');
  });

  it('formatDate() returns empty string for empty input', () => {
    expect(component['formatDate']('')).toBe('');
  });

  it('onSearch() updates searchTerm signal', () => {
    const event = { target: { value: 'gamma' } } as unknown as Event;
    component['onSearch'](event);
    expect(component['searchTerm']()).toBe('gamma');
  });

  it('onPageSizeChange() updates pageSize signal', () => {
    const event = { target: { value: '10' } } as unknown as Event;
    component['onPageSizeChange'](event);
    expect(component['pageSize']()).toBe(10);
  });
});

describe('ProductListComponent — API error on load', () => {
  let fixture: ComponentFixture<ProductListComponent>;
  let component: ProductListComponent;

  beforeEach(async () => {
    await createTestBed(
      buildRepo({ getAll: () => throwError(() => new Error('Network error')) })
    );
    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('sets error message on API failure', () => {
    expect(component['error']()).toBeTruthy();
    expect(component['isLoading']()).toBe(false);
  });
});

describe('ProductListComponent — delete error', () => {
  let fixture: ComponentFixture<ProductListComponent>;
  let component: ProductListComponent;

  beforeEach(async () => {
    await createTestBed(
      buildRepo({ delete: () => throwError(() => new Error('fail')) })
    );
    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('sets error on delete failure', () => {
    component['deleteTarget'].set(mockProducts[0]);
    component['confirmDelete']();
    expect(component['error']()).toBeTruthy();
  });
});
