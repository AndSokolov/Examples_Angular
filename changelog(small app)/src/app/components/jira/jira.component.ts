import { AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { take } from 'rxjs';
import { ErrorService } from "../../services/error.service";
import { GetDataService } from "../../services/get-data.service";
import { Commit, Jira, JiraCommits } from "../../utils/interfaces";
import { JIRA_URL } from "../../utils/constants";

@Component({
  selector: 'app-jira',
  templateUrl: './jira.component.html',
  styleUrls: ['./jira.component.scss']
})
export class JiraComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  jira_url = JIRA_URL;
  displayedColumns = ['number'];
  dataSource = new MatTableDataSource<Jira>([]);
  currentJiraCommits: JiraCommits;
  selectedRow: Jira;

  constructor(
    private getDataService: GetDataService,
    private errorService: ErrorService
  ) { }

  ngOnInit(): void {
    this.getJiraNumbers();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  /** getting jira numbers from back */
  getJiraNumbers(){
    this.getDataService.getJiraNumbers().pipe(take(1)).subscribe((jira: Array<string>) => {
      this.dataSource.data = jira ? jira.map((jira) => ({number: jira})) : [];
      this.dataSource.paginator = this.paginator;
    }, (err) => {
        this.errorService.handleError(err);
    })
  }


  getCommitsByJiraNumber(jira: Jira) {
    const jiraNumber = jira.number;
    this.currentJiraCommits = null;

    this.getDataService.getCommitsByJiraNumber(jiraNumber).pipe(take(1)).subscribe((commits: Commit[]) => {
      commits = commits || [];
      this.currentJiraCommits = { jiraNumber, commits };
    }, (err) => {
      this.errorService.handleError(err);
    })
  }
}
