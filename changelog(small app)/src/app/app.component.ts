import { Component, OnInit } from '@angular/core';
import { ToastrService } from "ngx-toastr";
import { ErrorService } from './services/error.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  constructor(
    private errorService: ErrorService,
    public toastr: ToastrService
  ) {}

  ngOnInit() {
    this.errorService.errorEmitter.subscribe((err: Error) => this.toastr.error(err.message, err.name, { positionClass: 'toast-bottom-right' }));
  }
}
