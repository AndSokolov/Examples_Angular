import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { Commit } from "../interfaces";
import { DatePipe } from '@angular/common';
import { JIRA_URL, REPOSITORY_URL } from "../constants";

@Component({
  selector: 'app-commits',
  templateUrl: './commits.component.html',
  styleUrls: ['./commits.component.scss']
})
export class CommitsComponent implements OnInit, AfterViewInit {
  @Input() data: Commit[] = [];
  @Input() type: string;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  constructor(
    private changeDetection: ChangeDetectorRef,
    private datePipe: DatePipe
  ) { }

  jira_url = JIRA_URL;
  repo_url = REPOSITORY_URL;
  dataSource = new MatTableDataSource([]);
  displayedColumns = ['FirmwareNumber','FirmwareDate','BoardNumber', 'CommitAuthor', 'CommitDate', 'CommitHash', 'CommitMessage', 'JiraIssue'];

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.mapData();
    this.customizeDisplayColumns();
    this.dataSource.paginator = this.paginator;
    this.dataSource.data = this.data;
    this.dataSource.sort = this.sort;
    this.changeDetection.detectChanges();
  }

  mapData() {
    this.data.forEach((commit: Commit) => {
      if (commit.CommitAuthor) {
        commit.CommitAuthor = this.trimCommitAuthor(commit.CommitAuthor)
      }
      if (commit.CommitHash) {
        commit.CommitHash = commit.CommitHash.slice(0,7);
      }
      if (commit.CommitDate) {
        commit.stringDateCommit = this.datePipe.transform(commit.CommitDate * 1000, 'yyyy-MM-dd HH:mm:ss');
      }
      if (commit.CommitMessage){
        commit.CommitMessage = commit.CommitMessage.split('\n');
      }
      if (commit.DirectoryName) {
        this.parseDirectoryName(commit);
      }
    })
  }

  parseDirectoryName(commit: Commit){
    let date;
    const matches = commit.DirectoryName.match(/\d\d\d\d_\d\d_\d\d_\d\d_\d\d/);
    if (matches) {
      const arrDate = matches[0].split('_');
      commit.stringDateFW = `${arrDate[0]}-${arrDate[1]}-${arrDate[2]} ${arrDate[3]}:${arrDate[1]}`
      date = new Date(+arrDate[0], +arrDate[1], +arrDate[2]);
      date.setHours(+arrDate[3]);
      date.setMinutes(+arrDate[4]);
      commit.FirmwareDate = +date;
    } else {
      commit.FirmwareDate = 0;
      commit.stringDateFW = '';
    }
  }

  trimCommitAuthor(author: string): string {
    const pos = author.indexOf('@');
    if( pos !== -1 ){
      author = author.slice(0, pos);
    }
    return author;
  }

  customizeDisplayColumns() {
    if (this.type === 'jira') {
      this.displayedColumns.splice(7, 1);

    } else if (this.type === 'boards') {
      this.displayedColumns.splice(2, 1);
    }
  }
}
