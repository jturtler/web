import { URLParams, getFetchOptions, HTTPError, GetAccessTokenType } from '@opensrp/server-service';
import { Dictionary } from '@onaio/utils';
import { UploadFileFieldTypes } from './types';
import {
  OPENSRP_FORMS_ENDPOINT,
  OPENSRP_FORM_METADATA_ENDPOINT,
  OPENSRP_MANIFEST_ENDPOINT,
} from '../constants';
import {
  fetchManifestFiles,
  ManifestFilesTypes,
  removeManifestFiles,
} from '../ducks/manifestFiles';
import { handleDownload } from './fileDownload';
import { fetchManifestDraftFiles, removeManifestDraftFiles } from '../ducks/manifestDraftFiles';
import { Dispatch } from 'redux';
import { fetchManifestReleases, ManifestReleasesTypes } from '../ducks/manifestReleases';
import { format } from 'date-fns';
import { OpenSRPService } from '@opensrp/react-utils';

/**
 * format long date to YYY-mm-dd
 *
 * @param {string} stringDate - date as a string
 * @returns {string} - string of date in YYY-mm-dd format
 */
export const formatDate = (stringDate: string): string => {
  return format(new Date(stringDate), 'yyyy-MM-dd');
};

/**
 * Handle download link click
 *
 * @param {GetAccessTokenType} accessToken - opensrp API access token
 * @param {string} baseURL OpenSRP API base URL
 * @param {string} downloadEndPoint opensrp download URL
 * @param {ManifestFilesTypes} obj manifest object file to be downloaded
 * @param {boolean} isJsonValidator pass true if is json validator. Default is false
 *  @param {getFetchOptions} getPayload custom fetch options
 */
export const downloadManifestFile = async (
  accessToken: GetAccessTokenType | string,
  baseURL: string,
  downloadEndPoint: string,
  obj: ManifestFilesTypes,
  isJsonValidator = false,
  getPayload?: typeof getFetchOptions
) => {
  const { identifier } = obj;
  const params: URLParams = {
    form_identifier: identifier, // eslint-disable-line @typescript-eslint/naming-convention
    form_version: obj.version, // eslint-disable-line @typescript-eslint/naming-convention
  };
  if (isJsonValidator) {
    params['is_json_validator'] = true;
  }
  const clientService = new OpenSRPService(downloadEndPoint, baseURL, getPayload);
  return await clientService.list(params).then((res) => {
    handleDownload(res.clientForm.json, identifier);
  });
};

/**
 * Handle form upload submission
 *
 * @param {Dictionary} values - submitted values
 * @param {GetAccessTokenType | string} accessToken  - Opensrp API access token
 * @param {string} opensrpBaseURL - Opensrp API base URL
 * @param {boolean} isJsonValidator - boolean to confirm if the form is json validator or not
 * @param {Function} setSubmitting - set the form state for isSubmitting
 * @param {Function} setIfDoneHere - set the form state for ifDoneHere
 * @param {Function} alertError - receive error description
 * @param {string} endpoint - Opensrp endpoint
 */
export const submitUploadForm = async (
  values: UploadFileFieldTypes,
  accessToken: GetAccessTokenType | string,
  opensrpBaseURL: string,
  isJsonValidator: boolean,
  setSubmitting: (isSubmitting: boolean) => void,
  setIfDoneHere: (ifDoneHere: boolean) => void,
  alertError: (err: string) => void,
  endpoint = OPENSRP_FORMS_ENDPOINT
) => {
  setSubmitting(true);
  const formData = new FormData();
  const { form } = values;

  Object.keys(values).forEach((key) => {
    if (key === 'form') {
      formData.append('form', form);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formData.append(key, (values as any)[key]);
    }
  });

  if (isJsonValidator) {
    formData.append('is_json_validator', 'true');
  }

  const token = await OpenSRPService.processAcessToken(accessToken);

  const customOptions = () => {
    return {
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: 'POST',
    };
  };

  const clientService = new OpenSRPService(endpoint, opensrpBaseURL, customOptions);
  return clientService
    .create(formData)
    .then(() => {
      setIfDoneHere(true);
    })
    .catch((err: HTTPError) => {
      alertError(err.description);
    })
    .finally(() => {
      setSubmitting(false);
    });
};

/**
 * Handle make release
 *
 * @param {ManifestFilesTypes[]} data draft files to make release for
 * @param {GetAccessTokenType | string} accessToken  Opensrp API access token
 * @param {string} opensrpBaseURL Opensrp API base URL
 * @param {Function} removeFiles redux action to remove draft files
 * @param {Function} setIfDoneHere set ifDoneHere form status
 * @param {string} endpoint - Opensrp endpoint
 * @param {Dispatch} dispatch - dispatch function from redux store
 * @param {Function} customFetchOptions custom opensrp API fetch options
 */
export const makeRelease = (
  data: ManifestFilesTypes[],
  accessToken: GetAccessTokenType | string,
  opensrpBaseURL: string,
  removeFiles: typeof removeManifestDraftFiles,
  setIfDoneHere: (ifDoneHere: boolean) => void,
  endpoint = OPENSRP_MANIFEST_ENDPOINT,
  dispatch?: Dispatch,
  customFetchOptions?: typeof getFetchOptions
) => {
  const identifiers = data.map((form) => form.identifier);
  const json = {
    /* eslint-disable-next-line @typescript-eslint/naming-convention */
    forms_version: data[0].version,
    identifiers,
  };
  const clientService = new OpenSRPService(endpoint, opensrpBaseURL, customFetchOptions);
  return clientService.create({ json: JSON.stringify(json) }).then(() => {
    if (dispatch) {
      dispatch(removeFiles());
    } else {
      removeFiles();
    }

    setIfDoneHere(true);
  });
};

/**
 * Fetch manifest draft files
 *
 * @param {GetAccessTokenType | string} accessToken  Opensrp API access token
 * @param {string} opensrpBaseURL Opensrp API base URL
 * @param {Function} fetchFiles redux action to fetch draft files
 * @param {string} endpoint - Opensrp endpoint
 * @param {Dispatch} dispatch - dispatch function from redux store
 * @param {Function} customFetchOptions custom opensrp API fetch options
 */
export const fetchDrafts = (
  accessToken: GetAccessTokenType | string,
  opensrpBaseURL: string,
  fetchFiles: typeof fetchManifestDraftFiles,
  endpoint = OPENSRP_FORM_METADATA_ENDPOINT,
  dispatch?: Dispatch,
  customFetchOptions?: typeof getFetchOptions
) => {
  /** get manifest Draftfiles */
  const params = { is_draft: true };
  const clientService = new OpenSRPService(endpoint, opensrpBaseURL, customFetchOptions);
  return clientService.list(params).then((res: ManifestFilesTypes[]) => {
    if (dispatch) {
      dispatch(fetchFiles(res));
    } else {
      fetchFiles(res);
    }
  });
};

/**
 * Fetch releases
 *
 * @param {GetAccessTokenType | string} accessToken  Opensrp API access token
 * @param {string} opensrpBaseURL Opensrp API base URL
 * @param {Function} fetchFiles redux action to fetch releases files
 * @param {string} endpoint - Opensrp endpoint
 * @param {Dispatch} dispatch - dispatch function from redux store
 * @param {Function} customFetchOptions custom opensrp API fetch options
 */
export const fetchReleaseFiles = (
  accessToken: GetAccessTokenType | string,
  opensrpBaseURL: string,
  fetchFiles: typeof fetchManifestReleases,
  endpoint = OPENSRP_MANIFEST_ENDPOINT,
  dispatch?: Dispatch,
  customFetchOptions?: typeof getFetchOptions
) => {
  const clientService = new OpenSRPService(endpoint, opensrpBaseURL, customFetchOptions);
  return clientService.list().then((res: ManifestReleasesTypes[]) => {
    if (dispatch) {
      dispatch(fetchFiles(res));
    } else {
      fetchFiles(res);
    }
  });
};

/**
 * Fetch manifest files
 *
 * @param {GetAccessTokenType | string} accessToken  Opensrp API access token
 * @param {string} opensrpBaseURL Opensrp API base URL
 * @param {Function} fetchFiles redux action to fetch manifest files
 * @param {Function} removeFiles redux action to remove manifest files
 * @param {string} formVersion form version present request is to get manifest files else get json validator files
 * @param {string} endpoint - Opensrp endpoint
 * @param {Dispatch} dispatch - dispatch function from redux store
 * @param {Function} customFetchOptions custom opensrp API fetch options
 */
export const fetchManifests = (
  accessToken: GetAccessTokenType | string,
  opensrpBaseURL: string,
  fetchFiles: typeof fetchManifestFiles,
  removeFiles: typeof removeManifestFiles,
  formVersion?: string | null,
  endpoint = OPENSRP_FORM_METADATA_ENDPOINT,
  dispatch?: Dispatch,
  customFetchOptions?: typeof getFetchOptions
) => {
  /** get manifest files */
  let params = null;
  // if form version is available -  means request is to get manifest files else get json validator files
  /* eslint-disable-next-line @typescript-eslint/naming-convention */
  params = formVersion ? { identifier: formVersion } : { is_json_validator: true };

  if (dispatch) {
    dispatch(removeFiles());
  } else {
    removeFiles();
  }

  const clientService = new OpenSRPService(endpoint, opensrpBaseURL, customFetchOptions);
  return clientService.list(params).then((res: ManifestFilesTypes[]) => {
    if (dispatch) {
      dispatch(fetchFiles(res));
    } else {
      fetchFiles(res);
    }
  });
};
