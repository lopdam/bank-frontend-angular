import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { IProductRepository } from '../domain/product.repository';

export const productIdValidator = (
  repository: IProductRepository,
  debounceMs = 400
): AsyncValidatorFn =>
  (control: AbstractControl): Observable<ValidationErrors | null> => {
    const value = control.value as string;
    if (!value || value.length < 3) return of(null);

    return timer(debounceMs).pipe(
      switchMap(() => repository.verifyId(value)),
      map(exists => (exists ? { idExists: true } : null)),
      catchError(() => of(null))
    );
  };

export const releaseDateValidator = (): ValidatorFn =>
  (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(control.value) >= today ? null : { pastDate: true };
  };
