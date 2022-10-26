import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { LibVersions, ServiceVersions } from '../../shared/interfaces';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'stand',
  templateUrl: './stand.component.html',
  styleUrls: ['./stand.component.scss'],
  animations: [
    trigger('expand', [
      transition(':enter', [style({ opacity: 0 }), animate('350ms', style({ opacity: 1 }))]),
      transition(':leave', [style({ opacity: 1 }), animate('150ms', style({ opacity: 0 }))]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StandComponent {
  @Input() serviceVersions: ServiceVersions[];
  @Input() libVersions: LibVersions;
  @Input() formBackend: string;
  @Input() spAdapter: string;
  @Input() links: string[];
  @Input() name: string;
  hidden: boolean;
}
