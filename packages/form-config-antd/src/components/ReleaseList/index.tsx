import React, { useState, useEffect, ChangeEvent } from 'react';
import { getFetchOptions } from '@opensrp/server-service';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { getAccessToken } from '@onaio/session-reducer';
import { SettingOutlined, UploadOutlined, SearchOutlined } from '@ant-design/icons';
import {
  releasesReducer,
  fetchManifestReleases,
  releasesReducerName,
  getAllManifestReleasesArray,
  ManifestReleasesTypes,
  OPENSRP_MANIFEST_ENDPOINT,
  fetchReleaseFiles,
} from '@opensrp/form-config-core';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { Dictionary } from '@onaio/utils';
import { Card, Spin, Space, Button, Divider, Input, PageHeader } from 'antd';
import { sendErrorNotification } from '@opensrp/notifications';
import { getTableColumns } from './utils';
import { TableLayout } from '@opensrp/react-utils';
import { TableActions } from './TableActions';
import { useTranslation } from '../../mls';

/** Register reducer */
reducerRegistry.register(releasesReducerName, releasesReducer);

/** interface for component props */
export interface ReleaseListProps {
  opensrpBaseURL: string;
  uploadFileURL: string;
  viewReleaseURL: string;
  fetchReleases: typeof fetchManifestReleases;
  customFetchOptions?: typeof getFetchOptions;
}

/** default component props */
const defaultProps: ReleaseListProps = {
  opensrpBaseURL: '',
  uploadFileURL: '',
  viewReleaseURL: '',
  fetchReleases: fetchManifestReleases,
};

/**
 * Component ReleaseList
 *
 * @param {Dictionary} props component props
 * @returns {Element} react element displaying the list of release items
 */
const ReleaseList = (props: ReleaseListProps): JSX.Element => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [loading, setLoading] = useState<boolean>(false);
  const [sortedInfo, setSortedInfo] = useState<Dictionary>();
  const accessToken = useSelector((state) => getAccessToken(state) as string);
  const data: ManifestReleasesTypes[] = useSelector((state) => getAllManifestReleasesArray(state));
  data.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const [filterData, setfilterDataData] = useState<ManifestReleasesTypes[] | null>(null);
  const [value, setValue] = useState('');
  const { opensrpBaseURL, uploadFileURL, viewReleaseURL, customFetchOptions, fetchReleases } =
    props;
  const { t } = useTranslation();

  useEffect(() => {
    setLoading(true);
    fetchReleaseFiles(
      accessToken,
      opensrpBaseURL,
      fetchReleases,
      OPENSRP_MANIFEST_ENDPOINT,
      dispatch,
      customFetchOptions
    )
      .catch(() => sendErrorNotification(t('An error occurred')))
      .finally(() => {
        setLoading(false);
      });
  }, [accessToken, opensrpBaseURL, customFetchOptions, dispatch, fetchReleases, t]);

  if (loading) {
    return <Spin size="large" className="custom-spinner" />;
  }

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value.toLowerCase();
    setValue(searchValue);
    const filterDataedData = data.filter(
      (entry) =>
        entry.appId.toLowerCase().includes(searchValue) ||
        entry.appVersion.toLowerCase().includes(searchValue) ||
        entry.identifier.toLowerCase().includes(searchValue)
    );
    setfilterDataData(filterDataedData);
  };

  return (
    <div className="content-section">
      <PageHeader title={t('Releases')} className="page-header" />
      <Card>
        <Space style={{ marginBottom: 16, float: 'left' }}>
          <Input
            id="search"
            placeholder={t('Search')}
            size="large"
            value={value}
            prefix={<SearchOutlined />}
            onChange={onChange}
          />
        </Space>
        <Space style={{ marginBottom: 16, float: 'right' }}>
          <Button type="primary" id="uploadNewFile" onClick={() => history.push(uploadFileURL)}>
            <UploadOutlined />
            {t('Upload New File')}
          </Button>
          <Divider type="vertical" />
          <SettingOutlined />
        </Space>
        <TableLayout
          id="FormReleaseList"
          persistState={true}
          columns={getTableColumns(t, sortedInfo)}
          actions={{
            // eslint-disable-next-line react/display-name
            render: (_: string, file: ManifestReleasesTypes) => {
              const tableActionProps = {
                file,
                viewReleaseURL,
              };
              return <TableActions {...tableActionProps} />;
            },
          }}
          datasource={value.length < 1 ? data : (filterData as ManifestReleasesTypes[])}
          // eslint-disable-next-line @typescript-eslint/naming-convention
          onChange={(_: Dictionary, __: Dictionary, sorter: Dictionary) => {
            setSortedInfo(sorter);
          }}
        />
      </Card>
    </div>
  );
};

ReleaseList.defaultProps = defaultProps;

export { ReleaseList };
