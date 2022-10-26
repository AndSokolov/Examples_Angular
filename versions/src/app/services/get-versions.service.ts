import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable, of } from 'rxjs';
import { catchError, filter, map, mergeMap, reduce } from 'rxjs/operators';
import { BackendServices, LibVersions, ServiceVersions } from '../shared/interfaces';
import { ErrorService } from './error.service';

@Injectable()
export class GetVersionsService {
  constructor(private http: HttpClient, private errorService: ErrorService) {}

  public getLibVersions(url: string, hasQueryParam = false): Observable<LibVersions> {
    const path = hasQueryParam ? `${url}?${new Date().getTime()}` : url;

    return this.http.get<LibVersions>(path).pipe(
      filter(Boolean),
      map(this.trimKeysInLibVersions),
      catchError((err) => {
        this.errorService.handleError(err);
        return of(null);
      }),
    );
  }

  public getServiceVersions(
    url: string,
    versions: string[],
    hasQueryParam = true,
  ): Observable<ServiceVersions> {
    return from(versions).pipe(
      mergeMap((version) =>
        this.http.get<ServiceVersions>(
          hasQueryParam ? `${url}/${version}?${new Date().getTime()}` : `${url}/${version}`,
        ),
      ),
      filter(Boolean),
      map(this.trimKeysInServiceVersions),
      reduce((acc, version) => ({ ...acc, ...version }), {}),
      catchError((err) => {
        this.errorService.handleError(err);
        return of(null);
      }),
    );
  }

  public getBackendServices(url: string): Observable<string> {
    return this.http
      .get<BackendServices>(url, { withCredentials: true })
      .pipe(
        map((value) => value?.app?.version),
        catchError((err) => {
          this.errorService.handleError(err);
          return of(null);
        }),
      );
  }

  /** Trimming methods */
  private trimKeysInServiceVersions(versions: ServiceVersions): ServiceVersions {
    const keyValues = Object.keys(versions).map((key) => {
      const index = key.indexOf('-version');
      return index !== -1 ? { [key.slice(0, index)]: versions[key] } : { [key]: versions[key] };
    });
    return Object.assign({}, ...keyValues);
  }

  private trimKeysInLibVersions(versions: LibVersions): LibVersions {
    const keyValues = Object.keys(versions).map((key) => {
      const index = key.indexOf('Version');
      return index !== -1 ? { [key.slice(0, index)]: versions[key] } : { [key]: versions[key] };
    });
    return Object.assign({}, ...keyValues);
  }
}
