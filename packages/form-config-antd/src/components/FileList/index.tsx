import React, { useState, useEffect, ChangeEvent } from 'react';
import { getFetchOptions } from '@opensrp/server-service';
import { getAccessToken } from '@onaio/session-reducer';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { Card, Spin, Space, Button, Divider, Input, PageHeader } from 'antd';
import { Dictionary } from '@onaio/utils';
import {
  filesReducer,
  ManifestFilesTypes,
  getAllManifestFilesArray,
  removeManifestFiles,
  fetchManifestFiles,
  filesReducerName,
  OPENSRP_FORM_METADATA_ENDPOINT,
  fetchManifests,
} from '@opensrp/form-config-core';
import { useSelector, useDispatch } from 'react-redux';
import { sendErrorNotification } from '@opensrp/notifications';
import { getTableColumns } from './utils';
import { useHistory, RouteComponentProps } from 'react-router';
import { SettingOutlined, UploadOutlined, SearchOutlined } from '@ant-design/icons';
import { ROUTE_PARAM_FORM_VERSION } from '../../constants';
import { TableLayout } from '@opensrp/react-utils';
import { TableActions } from './TableActions';
import { useTranslation } from '../../mls';

/** Register reducer */
reducerRegistry.register(filesReducerName, filesReducer);

/** inteface for route params */
export interface RouteParams {
  [ROUTE_PARAM_FORM_VERSION]: string;
}

/** interface for component props */
export interface FileListProps {
  opensrpBaseURL: string;
  removeFiles: typeof removeManifestFiles;
  fetchFiles: typeof fetchManifestFiles;
  uploadFileURL: string;
  isJsonValidator: boolean;
  customFetchOptions?: typeof getFetchOptions;
}

/** default component props */
const defaultProps: FileListProps = {
  opensrpBaseURL: '',
  uploadFileURL: '',
  isJsonValidator: false,
  removeFiles: removeManifestFiles,
  fetchFiles: fetchManifestFiles,
};

/** type intersection for all types that pertain to the props */
export type FileListPropTypes = FileListProps & RouteComponentProps<RouteParams>;

/**
 * Component FileList
 *
 * @param {Dictionary} props component props
 * @returns {Element} react element displaying the files
 */
const FileList = (props: FileListPropTypes): JSX.Element => {
  const {
    opensrpBaseURL,
    customFetchOptions,
    removeFiles,
    fetchFiles,
    uploadFileURL,
    isJsonValidator,
    match,
  } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const [sortedInfo, setSortedInfo] = useState<Dictionary>();
  const accessToken = useSelector((state) => getAccessToken(state) as string);
  const data: ManifestFilesTypes[] = useSelector((state) => getAllManifestFilesArray(state));
  const [value, setValue] = useState('');
  const [filterData, setfilterDataData] = useState<ManifestFilesTypes[] | null>(null);
  const formVersion = match.params[ROUTE_PARAM_FORM_VERSION];
  const dispatch = useDispatch();
  const history = useHistory();
  const { t } = useTranslation();

  const title = formVersion
    ? t('Releases: {{formVersion}}', { formVersion })
    : t('JSON Validators');

  useEffect(
    () => {
      setLoading(true);
      fetchManifests(
        accessToken,
        opensrpBaseURL,
        fetchFiles,
        removeFiles,
        formVersion,
        OPENSRP_FORM_METADATA_ENDPOINT,
        dispatch,
        customFetchOptions
      )
        .catch(() => sendErrorNotification('An error occurred'))
        .finally(() => setLoading(false));
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      opensrpBaseURL,
      accessToken,
      customFetchOptions,
      fetchFiles,
      removeFiles,
      formVersion,
      dispatch,
    ]
  );

  if (loading) {
    return <Spin size="large" className="custom-spinner" />;
  }

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value.toLowerCase();
    setValue(searchValue);
    const filterDataedData = data.filter(
      (entry) =>
        entry.label.toLowerCase().includes(searchValue) ||
        entry.identifier.toLowerCase().includes(searchValue) ||
        (entry.module && entry.module.toUpperCase().includes(searchValue))
    );
    setfilterDataData(filterDataedData);
  };

  return (
    <div className="content-section">
      <PageHeader className="page-header" title={title} />
      <Card>
        <Space style={{ marginBottom: 16, float: 'left' }}>
          <Input
            id="search"
            placeholder="Search"
            size="large"
            value={value}
            prefix={<SearchOutlined />}
            onChange={onChange}
          />
        </Space>
        <Space style={{ marginBottom: 16, float: 'right' }}>
          {!formVersion && (
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            <>
              <Button type="primary" id="uploadNewFile" onClick={() => history.push(uploadFileURL)}>
                <UploadOutlined />
                {t('Upload New File')}
              </Button>
              <Divider type="vertical" />
            </>
          )}
          <SettingOutlined />
        </Space>
        <TableLayout
          id="FormFileList"
          persistState={true}
          columns={getTableColumns(isJsonValidator, t, sortedInfo)}
          actions={{
            // eslint-disable-next-line react/display-name
            render: (_: string, file: ManifestFilesTypes) => {
              const tableActionProps = {
                file,
                uploadFileURL,
                accessToken,
                opensrpBaseURL,
                isJsonValidator,
                customFetchOptions,
              };
              return <TableActions {...tableActionProps} />;
            },
          }}
          datasource={value.length < 1 ? data : (filterData as ManifestFilesTypes[])}
          // eslint-disable-next-line @typescript-eslint/naming-convention
          onChange={(_: Dictionary, __: Dictionary, sorter: Dictionary) => {
            setSortedInfo(sorter);
          }}
        />
      </Card>
    </div>
  );
};

FileList.defaultProps = defaultProps;

export { FileList };
