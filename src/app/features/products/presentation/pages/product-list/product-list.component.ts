import { Component, inject, OnInit, signal, computed, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { IProductRepository } from '../../../domain/product.repository';
import { Product } from '../../../domain/product.model';
import { SkeletonLoaderComponent } from '../../components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [SkeletonLoaderComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent implements OnInit {
  private readonly repository = inject(IProductRepository);
  private readonly router = inject(Router);

  protected readonly products = signal<Product[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly searchTerm = signal('');
  protected readonly pageSize = signal(5);
  protected readonly deleteTarget = signal<Product | null>(null);
  protected readonly activeMenuId = signal<string | null>(null);
  protected readonly menuPosition = signal<{ top: number; right: number }>({ top: 0, right: 0 });

  protected readonly filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.products().filter(
      p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
    );
  });

  protected readonly paginatedProducts = computed(() =>
    this.filteredProducts().slice(0, this.pageSize())
  );

  protected readonly resultCount = computed(() => this.filteredProducts().length);

  ngOnInit(): void {
    this.loadProducts();
  }

  protected loadProducts(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.repository.getAll().subscribe({
      next: products => {
        this.products.set(products);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar los productos. Intente de nuevo.');
        this.isLoading.set(false);
      },
    });
  }

  protected navigateToAdd(): void {
    this.router.navigate(['/products/add']);
  }

  protected navigateToEdit(product: Product): void {
    this.router.navigate(['/products/edit', product.id], {
      state: { product },
    });
  }

  protected onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected onPageSizeChange(event: Event): void {
    this.pageSize.set(Number((event.target as HTMLSelectElement).value));
  }

  protected openMenu(id: string, domEvent: Event): void {
    domEvent.stopPropagation();
    if (this.activeMenuId() === id) {
      this.activeMenuId.set(null);
      return;
    }
    const rect = (domEvent.currentTarget as HTMLElement).getBoundingClientRect();
    this.menuPosition.set({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    this.activeMenuId.set(id);
  }

  @HostListener('document:click')
  protected closeMenu(): void {
    this.activeMenuId.set(null);
  }

  protected openDeleteModal(product: Product): void {
    this.deleteTarget.set(product);
    this.closeMenu();
  }

  protected closeDeleteModal(): void {
    this.deleteTarget.set(null);
  }

  protected confirmDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;
    this.repository.delete(target.id).subscribe({
      next: () => {
        this.products.update(list => list.filter(p => p.id !== target.id));
        this.closeDeleteModal();
      },
      error: () => {
        this.error.set('Error al eliminar el producto.');
        this.closeDeleteModal();
      },
    });
  }

  protected formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }
}
