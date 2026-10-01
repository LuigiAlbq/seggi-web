import { Component, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { EmptyState } from './empty-state';

/** Estado de erro de carregamento com botão para tentar de novo. */
@Component({
  selector: 'app-load-error',
  imports: [ButtonModule, EmptyState],
  template: `
    <app-empty-state
      icon="pi pi-exclamation-triangle"
      title="Não foi possível carregar os dados"
      message="Verifique sua conexão e se o seggi-app está em execução."
    >
      <p-button
        label="Tentar novamente"
        icon="pi pi-refresh"
        severity="secondary"
        [outlined]="true"
        (onClick)="retry.emit()"
      />
    </app-empty-state>
  `,
})
export class LoadError {
  readonly retry = output<void>();
}
