import { environment } from '../../environments/environment';
import { UrlsOfStands } from './interfaces';
import * as MASKS from '../../../proxy.conf.json';

const endpoints = require('../../assets/config.json');

const getUrl = (mask: string): string => {
  if (environment.production) {
    return mask;
  }

  const name = Object.keys(MASKS).find((key: string) => key.includes(mask));
  const url = MASKS[name]?.link || MASKS[name]?.target;
  return url;
};

export const SERVICE_VERSIONS = endpoints.serviceVersions;

export const URLS_OF_STANDS: UrlsOfStands = {
  Uat: {
    libVersions: `${environment.uatLibApi}/${endpoints.libVersions}`,
    sfPortalLink: `${getUrl(environment.uatUrl)}/${endpoints.sfPortalLink}`,
    serviceVersionsLink: `${environment.uatServiceApi}/${endpoints.serviceVersionsApiUrl}`,
    emulatorLink: '',
    formBackend: `${environment.uatUrl}/${endpoints.formBackend}`,
    spAdapter: `${environment.uatServiceApi}/${endpoints.spAdapter}`,
  },
  DevL11: {
    libVersions: `${environment.devL11LibApi}/${endpoints.libVersions}`,
    sfPortalLink: `${getUrl(environment.devL11LibApi)}/${endpoints.sfPortalLink}`,
    emulatorLink: `${getUrl(environment.devL11ServiceApi)}`,
    serviceVersionsLink: `${environment.devL11ServiceApi}/${endpoints.serviceVersionsApiUrl}`,
    formBackend: `${environment.devL11ServiceApi}/${endpoints.formBackend}`,
    spAdapter: `${environment.devL11ServiceApi}/${endpoints.spAdapter}`,
  },
  Dev01: {
    libVersions: `${environment.dev01LibApi}/${endpoints.libVersions}`,
    sfPortalLink: `${getUrl(environment.dev01LibApi)}/${endpoints.sfPortalLink}`,
    emulatorLink: `${getUrl(environment.dev01ServiceApi)}`,
    serviceVersionsLink: `${environment.dev01ServiceApi}/${endpoints.serviceVersionsApiUrl}`,
    formBackend: `${environment.dev01ServiceApi}/${endpoints.formBackend}`,
    spAdapter: `${environment.dev01ServiceApi}/${endpoints.spAdapter}`,
  },
  Dev02: {
    libVersions: `${environment.dev02LibApi}/${endpoints.libVersions}`,
    sfPortalLink: `${getUrl(environment.dev02LibApi)}/${endpoints.sfPortalLink}`,
    emulatorLink: `${getUrl(environment.dev02ServiceApi)}`,
    serviceVersionsLink: `${environment.dev02ServiceApi}/${endpoints.serviceVersionsApiUrl}`,
    formBackend: `${environment.dev02ServiceApi}/${endpoints.formBackend}`,
    spAdapter: `${environment.dev02ServiceApi}/${endpoints.spAdapter}`,
  },
  Prod: {
    libVersions: `${environment.prodLibApi}/${endpoints.libVersions}`,
    sfPortalLink: `${getUrl(environment.prodLibApi)}/${endpoints.sfPortalLink}`,
    emulatorLink: '',
    formBackend: `${environment.prodServiceApi}/${endpoints.formBackend}`,
    spAdapter: `${environment.prodServiceApi}/${endpoints.spAdapter}`,
  },
  ProdLike: {
    libVersions: `${environment.prodLikeLibApi}/${endpoints.libVersions}`,
    sfPortalLink: `${getUrl(environment.prodLikeLibApi)}/${endpoints.sfPortalLink}`,
    emulatorLink: '',
    serviceVersionsLink: `${environment.prodLikeServiceApi}/${endpoints.serviceVersionsApiUrl}`,
    formBackend: `${environment.prodLikeServiceApi}/${endpoints.formBackend}`,
    spAdapter: `${environment.prodLikeServiceApi}/${endpoints.spAdapter}`,
  },
};
