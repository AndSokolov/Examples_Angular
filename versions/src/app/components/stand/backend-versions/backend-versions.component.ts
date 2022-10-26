import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

interface IBackendVersions {
  formBackend: string;
  spAdapter: string;
}
@Component({
  selector: 'backend-versions',
  templateUrl: './backend-versions.component.html',
  styleUrls: ['./backend-versions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackendVersionsComponent {
  @Input() backendServices: IBackendVersions;
}
