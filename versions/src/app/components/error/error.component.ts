import { Component, ChangeDetectionStrategy, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorComponent implements OnChanges {
  @Input() error: Error;
  hidden: boolean = true;

  ngOnChanges() {
    if (this.error) {
      this.hidden = false;
    }
  }
}
