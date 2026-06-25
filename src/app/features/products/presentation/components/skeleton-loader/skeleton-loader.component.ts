import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  templateUrl: './skeleton-loader.component.html',
  styleUrl: './skeleton-loader.component.css',
})
export class SkeletonLoaderComponent {
  rows = input<number>(5);
  protected readonly rowsArray = computed(() =>
    Array.from({ length: this.rows() })
  );
}
