import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { GetDataService } from "../../services/get-data.service";
import { ErrorService } from "../../services/error.service";
import { catchError, Observable, of, take } from "rxjs";
import { Commit } from "../../utils/interfaces";

@Component({
  selector: 'app-all-commits',
  templateUrl: './all-commits.component.html',
  styleUrls: ['./all-commits.component.scss']
})
export class AllCommitsComponent implements OnInit {

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  allCommits$: Observable<Commit[]>;

  constructor(
    private getDataService: GetDataService,
    private errorService: ErrorService
  ) {
  }

  ngOnInit(): void {
    this.allCommits$ = this.getDataService.getAllCommits().pipe(
      take(1),
      catchError((err) => {
          this.errorService.handleError(err);
          return of([]);
      }
      )
    );
  }
}
