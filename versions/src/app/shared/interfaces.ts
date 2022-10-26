import { Observable } from 'rxjs';

export interface LibVersions {
  sfPortalVersion: string;
  formPlayerVersion: string;
  epguLibVersion: string;
  sfPortalLink?: string;
  formPlayerLink?: string;
}

export interface ServiceVersions {
  [key: string]: string;
}

export interface BackendServices {
  app: { version: string };
}

export interface VersionSet {
  standType: string;
  libVersions$?: Observable<LibVersions>;
  serviceVersions$?: Observable<ServiceVersions>;
  formBackend$?: Observable<string>;
  spAdapter$?: Observable<string>;
}

export interface UrlsOfStand {
  libVersions: string;
  formBackend: string;
  spAdapter: string;
  serviceVersionsLink?: string;
  sfPortalLink?: string;
  emulatorLink?: string;
}

export interface UrlsOfStands {
  Uat: UrlsOfStand;
  DevL11: UrlsOfStand;
  Dev01: UrlsOfStand;
  Dev02: UrlsOfStand;
  Prod: UrlsOfStand;
  ProdLike: UrlsOfStand;
}
