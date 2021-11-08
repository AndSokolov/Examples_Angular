import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { Board, BoardCommits, Commit } from "../../utils/interfaces";
import { GetDataService } from "../../services/get-data.service";
import { ErrorService } from "../../services/error.service";
import { take } from 'rxjs';
import { SLASH_CODE_URI } from "../../utils/constants";

@Component({
  selector: 'app-boards',
  templateUrl: './boards.component.html',
  styleUrls: ['./boards.component.scss']
})
export class BoardsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  displayedColumns = ['number'];
  dataSource = new MatTableDataSource([]);
  currentBoardCommits: BoardCommits;
  selectedRow: Board;

  constructor(
    private getDataService: GetDataService,
    private errorService: ErrorService
  ) { }

  ngOnInit(): void {
    this.getBoardsNumbers();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  /** getting board numbers from back */
  getBoardsNumbers(){
    this.getDataService.getBoardNumbers().pipe(take(1)).subscribe((boards: string[]) => {
      this.dataSource.data = boards ? boards.map((jira) => ({number: jira})) : [];
      this.dataSource.paginator = this.paginator;
    }, (err) => {
      this.errorService.handleError(err);
    })
  }

  getCommitsByBoardNumber(board: Board) {
    const boardNumber = board.number;
    this.currentBoardCommits = null;

    this.getDataService.getCommitsByBoardNumber(this.encodeSlash(boardNumber)).pipe(take(1)).subscribe((commits: Commit[]) => {
      commits = commits || [];
      this.currentBoardCommits = { boardNumber, commits };
    }, (err) => {
      this.errorService.handleError(err);
    })
  }

  encodeSlash(boardNumber: string): string{
    return boardNumber.replace(/\//g, SLASH_CODE_URI);
  }
}
