import { Component, input } from '@angular/core';

/** Título da página com área à direita para ações (projetadas via ng-content). */
@Component({
  selector: 'app-page-header',
  template: `
    <header class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div class="min-w-0">
        <h1 class="m-0 text-2xl font-bold tracking-tight">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="m-0 mt-1 text-muted-color">{{ subtitle() }}</p>
        }
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <ng-content />
      </div>
    </header>
  `,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
}
