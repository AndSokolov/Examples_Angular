import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { GetVersionsService } from './services/get-versions.service';
import { VersionSet } from './shared/interfaces';
import { ErrorService } from './services/error.service';
import { URLS_OF_STANDS, SERVICE_VERSIONS } from './shared/constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  versions: VersionSet[];
  constructor(
    private versionsService: GetVersionsService,
    public errorService: ErrorService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.versions = Object.entries(URLS_OF_STANDS).map(([standType, stand]) => {
      return {
        standType,
        links: ['', stand.emulatorLink, stand.sfPortalLink],
        libVersions$: this.versionsService.getLibVersions(stand.libVersions, true),
        serviceVersions$: stand.serviceVersionsLink
          ? this.versionsService.getServiceVersions(stand.serviceVersionsLink, SERVICE_VERSIONS)
          : null,
        formBackend$: this.versionsService.getBackendServices(stand.formBackend),
        spAdapter$: this.versionsService.getBackendServices(stand.spAdapter),
      };
    });
    this.cdr.detectChanges();
  }
}
