import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ServiceVersions } from '../../../shared/interfaces';

@Component({
  selector: 'service-versions',
  templateUrl: './service-versions.component.html',
  styleUrls: ['./service-versions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceVersionsComponent {
  @Input() serviceVersions: ServiceVersions;
  headers = ['Service number', 'Service version'];
}
