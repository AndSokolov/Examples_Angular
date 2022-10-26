import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Commit } from "../utils/interfaces";
import { CHANGE_LOG_URL } from "../utils/constants";

@Injectable({
  providedIn: 'root'
})
export class GetDataService {

  constructor(private http: HttpClient) { }

  public getBoardNumbers(): Observable<string[]> {
    return this.http.get<string[]>(CHANGE_LOG_URL + '/board');
  }

  public getCommitsByBoardNumber(boardNumber: string): Observable<Commit[]> {
    return this.http.get<Commit[]>(CHANGE_LOG_URL + `/board/${boardNumber}/commits`);
  }

  public getJiraNumbers(): Observable<string[]> {
    return this.http.get<string[]>(CHANGE_LOG_URL + '/jira');
  }

  public getCommitsByJiraNumber(jiraNumber: string): Observable<Commit[]> {
    return this.http.get<Commit[]>(CHANGE_LOG_URL + `/jira/${jiraNumber}/commits`);
  }

  public getAllCommits(): Observable<Commit[]> {
    return this.http.get<Commit[]>(CHANGE_LOG_URL + `/commits`);
  }
}
