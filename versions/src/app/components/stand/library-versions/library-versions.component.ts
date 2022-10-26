import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { LibVersions } from '../../../shared/interfaces';

@Component({
  selector: 'library-versions',
  templateUrl: './library-versions.component.html',
  styleUrls: ['./library-versions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryVersionsComponent {
  @Input() libVersions: LibVersions;
  @Input() links: string[];
}
