import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="flex flex-col items-center gap-2 px-4 py-10 text-center">
      <i [class]="icon()" class="text-4xl text-muted-color" aria-hidden="true"></i>
      <p class="m-0 font-semibold">{{ title() }}</p>
      @if (message()) {
        <p class="m-0 max-w-md text-sm text-muted-color">{{ message() }}</p>
      }
      <div class="mt-2"><ng-content /></div>
    </div>
  `,
})
export class EmptyState {
  readonly icon = input('pi pi-inbox');
  readonly title = input.required<string>();
  readonly message = input<string>();
}
