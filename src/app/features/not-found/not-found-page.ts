import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { EmptyState } from '../../shared/components/empty-state';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, ButtonModule, EmptyState],
  template: `
    <app-empty-state
      icon="pi pi-compass"
      title="Página não encontrada"
      message="O endereço acessado não existe no Seggi."
    >
      <p-button label="Voltar ao início" icon="pi pi-home" routerLink="/" />
    </app-empty-state>
  `,
})
export class NotFoundPage {}
