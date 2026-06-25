import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IProductRepository } from '../../../domain/product.repository';
import { Product } from '../../../domain/product.model';
import {
  productIdValidator,
  releaseDateValidator,
} from '../../../validators/product-id.validator';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly repository = inject(IProductRepository);

  protected isEditMode = false;
  protected editId = '';
  protected submitError: string | null = null;

  protected readonly form = this.fb.group({
    id: [
      '',
      {
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(10),
        ],
        asyncValidators: [productIdValidator(this.repository)],
        updateOn: 'change',
      },
    ],
    name: [
      '',
      [Validators.required, Validators.minLength(5), Validators.maxLength(100)],
    ],
    description: [
      '',
      [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(200),
      ],
    ],
    logo: ['', Validators.required],
    date_release: ['', [Validators.required, releaseDateValidator()]],
    date_revision: [{ value: '', disabled: true }],
  });

  constructor() {
    this.form
      .get('date_release')!
      .valueChanges.pipe(takeUntilDestroyed())
      .subscribe(val => {
        if (!val) return;
        const release = new Date(val);
        const revision = new Date(release);
        revision.setFullYear(revision.getFullYear() + 1);
        this.form
          .get('date_revision')!
          .setValue(revision.toISOString().split('T')[0]);
      });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.isEditMode = true;
    this.editId = id;
    this.form.get('id')!.clearAsyncValidators();
    this.form.get('id')!.disable();
    this.prefillForm(id);
  }

  private prefillForm(id: string): void {
    const state = history.state as { product?: Product };
    if (state?.product) {
      this.applyProduct(state.product);
      return;
    }
    this.repository.getAll().subscribe({
      next: products => {
        const found = products.find(p => p.id === id);
        if (found) this.applyProduct(found);
        else this.router.navigate(['/products']);
      },
      error: () => this.router.navigate(['/products']),
    });
  }

  private applyProduct(product: Product): void {
    this.form.patchValue({
      id: product.id,
      name: product.name,
      description: product.description,
      logo: product.logo,
      date_release: product.date_release,
    });
    this.form.get('date_revision')!.setValue(product.date_revision);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitError = null;
    const raw = this.form.getRawValue();

    if (this.isEditMode) {
      this.repository
        .update(this.editId, {
          name: raw.name ?? '',
          description: raw.description ?? '',
          logo: raw.logo ?? '',
          date_release: raw.date_release ?? '',
          date_revision: raw.date_revision ?? '',
        })
        .subscribe({
          next: () => this.router.navigate(['/products']),
          error: () => {
            this.submitError = 'Error al actualizar el producto.';
          },
        });
      return;
    }

    this.repository
      .create({
        id: raw.id ?? '',
        name: raw.name ?? '',
        description: raw.description ?? '',
        logo: raw.logo ?? '',
        date_release: raw.date_release ?? '',
        date_revision: raw.date_revision ?? '',
      })
      .subscribe({
        next: () => this.router.navigate(['/products']),
        error: () => {
          this.submitError = 'Error al agregar el producto.';
        },
      });
  }

  protected reset(): void {
    this.form.reset();
    if (this.isEditMode) {
      this.form.get('id')!.disable();
    }
  }

  protected hasError(field: string, error?: string): boolean {
    const ctrl = this.form.get(field);
    if (!ctrl?.touched) return false;
    return error ? ctrl.hasError(error) : ctrl.invalid;
  }
}
