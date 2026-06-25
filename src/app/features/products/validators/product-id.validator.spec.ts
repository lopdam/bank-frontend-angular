import { FormControl } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Observable } from 'rxjs';
import { ValidationErrors } from '@angular/forms';
import {
  productIdValidator,
  releaseDateValidator,
} from './product-id.validator';
import { IProductRepository } from '../domain/product.repository';
import { of } from 'rxjs';

const mockRepo = {
  verifyId: (id: string) => of(id === 'taken'),
} as unknown as IProductRepository;

describe('productIdValidator', () => {
  const validator = productIdValidator(mockRepo, 0);

  it('returns null for empty value', async () => {
    const result = await firstValueFrom(
      validator(new FormControl('')) as Observable<ValidationErrors | null>
    );
    expect(result).toBeNull();
  });

  it('returns null for value shorter than 3 chars', async () => {
    const result = await firstValueFrom(
      validator(new FormControl('ab')) as Observable<ValidationErrors | null>
    );
    expect(result).toBeNull();
  });

  it('returns { idExists: true } when id is taken', async () => {
    const result = await firstValueFrom(
      validator(new FormControl('taken')) as Observable<ValidationErrors | null>
    );
    expect(result).toEqual({ idExists: true });
  });

  it('returns null when id is available', async () => {
    const result = await firstValueFrom(
      validator(new FormControl('free-id')) as Observable<ValidationErrors | null>
    );
    expect(result).toBeNull();
  });
});

describe('releaseDateValidator', () => {
  const validator = releaseDateValidator();

  it('returns null for empty value', () => {
    expect(validator(new FormControl(''))).toBeNull();
  });

  it('returns null for today', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(validator(new FormControl(today))).toBeNull();
  });

  it('returns null for a future date', () => {
    expect(validator(new FormControl('2099-01-01'))).toBeNull();
  });

  it('returns { pastDate: true } for a past date', () => {
    expect(validator(new FormControl('2000-01-01'))).toEqual({
      pastDate: true,
    });
  });
});
