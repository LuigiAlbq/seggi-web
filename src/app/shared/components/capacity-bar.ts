import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';
import { occupancyLevel, occupancyPercent } from '../utils/occupancy';

const BAR_COLORS = {
  ok: 'var(--p-primary-color)',
  warn: 'var(--p-orange-500)',
  full: 'var(--p-red-500)',
} as const;

/** Barra de ocupação de um armazém: unidades em estoque ÷ capacidade. */
@Component({
  selector: 'app-capacity-bar',
  imports: [DecimalPipe, ProgressBarModule],
  template: `
    <div class="flex min-w-40 flex-col gap-1">
      <p-progressbar
        [value]="percent()"
        [showValue]="false"
        [style]="{ height: '0.5rem' }"
        [color]="color()"
        [attr.aria-label]="'Ocupação ' + percent() + '%'"
      />
      <span class="text-xs text-muted-color">
        {{ used() | number }} / {{ capacity() | number }} un. ({{ percent() }}%)
      </span>
    </div>
  `,
})
export class CapacityBar {
  readonly used = input.required<number>();
  readonly capacity = input.required<number>();

  protected readonly percent = computed(() => occupancyPercent(this.used(), this.capacity()));
  protected readonly color = computed(() => BAR_COLORS[occupancyLevel(this.percent())]);
}
