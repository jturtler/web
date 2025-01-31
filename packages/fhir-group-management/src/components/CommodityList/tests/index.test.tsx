/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CommodityList } from '..';
import React from 'react';
import { store } from '@opensrp/store';
import { createMemoryHistory } from 'history';
import { Route, Router, Switch } from 'react-router';
import { Provider } from 'react-redux';
import { authenticateUser } from '@onaio/session-reducer';
import { QueryClient, QueryClientProvider } from 'react-query';
import nock from 'nock';
import { waitForElementToBeRemoved } from '@testing-library/dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { groupResourceType, LIST_COMMODITY_URL } from '../../../constants';
import { commoditiesPage1 } from './fixtures';

jest.mock('fhirclient', () => {
  return jest.requireActual('fhirclient/lib/entry/browser');
});

jest.mock('@opensrp/react-utils', () => {
  const actual = jest.requireActual('@opensrp/react-utils');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SearchForm = (props: any) => {
    const { onChangeHandler } = props;
    return (
      <div className="search-input-wrapper">
        <input onChange={onChangeHandler} data-testid="search-form"></input>
      </div>
    );
  };
  return {
    ...actual,
    SearchForm,
  };
});

nock.disableNetConnect();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
    },
  },
});

const props = {
  fhirBaseURL: 'http://test.server.org',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AppWrapper = (props: any) => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Switch>
          <Route exact path={`${LIST_COMMODITY_URL}`}>
            {(routeProps) => <CommodityList {...{ ...props, ...routeProps }} />}
          </Route>
          <Route exact path={`${LIST_COMMODITY_URL}/:id`}>
            {(routeProps) => <CommodityList {...{ ...props, ...routeProps }} />}
          </Route>
        </Switch>
      </QueryClientProvider>
    </Provider>
  );
};

beforeAll(() => {
  store.dispatch(
    authenticateUser(
      true,
      {
        email: 'bob@example.com',
        name: 'Bobbie',
        username: 'RobertBaratheon',
      },
      { api_token: 'hunter2', oAuth2Data: { access_token: 'sometoken', state: 'abcde' } }
    )
  );
});

afterEach(() => {
  nock.cleanAll();
  cleanup();
});

afterAll(() => {
  nock.enableNetConnect();
});

test('renders correctly when listing resources', async () => {
  const history = createMemoryHistory();
  history.push(LIST_COMMODITY_URL);

  nock(props.fhirBaseURL)
    .get(`/${groupResourceType}/_search`)
    .query({
      _getpagesoffset: 0,
      _count: 20,
      code: 'http://snomed.info/sct|386452003',
    })
    .reply(200, commoditiesPage1)
    .persist();

  render(
    <Router history={history}>
      <AppWrapper {...props}></AppWrapper>
    </Router>
  );

  await waitForElementToBeRemoved(document.querySelector('.ant-spin'));

  expect(document.querySelector('title')).toMatchInlineSnapshot(`
    <title>
      Commodity List
    </title>
  `);

  expect(document.querySelector('.ant-page-header-heading-title')).toMatchSnapshot('Header title');

  document.querySelectorAll('tr').forEach((tr, idx) => {
    tr.querySelectorAll('td').forEach((td) => {
      expect(td).toMatchSnapshot(`table row ${idx} page 1`);
    });
  });

  // view details
  nock(props.fhirBaseURL)
    .get(`/${groupResourceType}/6f3980e0-d1d6-4a7a-a950-939f3ca7b301`)
    .reply(200, commoditiesPage1.entry[1].resource);

  // target the initial row view details
  const dropdown = document.querySelector('tbody tr:nth-child(1) [data-testid="action-dropdown"]');
  fireEvent.click(dropdown!);

  const viewDetailsLink = screen.getByText(/View Details/);
  expect(viewDetailsLink).toMatchInlineSnapshot(`
    <a
      href="/commodity/list/6f3980e0-d1d6-4a7a-a950-939f3ca7b301"
    >
      View Details
    </a>
  `);
  fireEvent.click(viewDetailsLink);
  expect(history.location.pathname).toEqual('/commodity/list/6f3980e0-d1d6-4a7a-a950-939f3ca7b301');

  await waitForElementToBeRemoved(document.querySelector('.ant-spin'));

  // see view details contents
  const keyValuePairs = document.querySelectorAll(
    'div[data-testid="key-value"] .singleKeyValue-pair'
  );
  keyValuePairs.forEach((pair) => {
    expect(pair).toMatchSnapshot();
  });

  // close view details
  const closeButton = document.querySelector('[data-testid="close-button"]');
  fireEvent.click(closeButton!);

  expect(history.location.pathname).toEqual('/commodity/list');
  expect(nock.isDone()).toBeTruthy();
});
