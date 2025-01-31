import React from 'react';
import { ConnectedEditProductView } from '..';
import { store } from '@opensrp/store';
import { createBrowserHistory } from 'history';
import { Router } from 'react-router';
import { Provider } from 'react-redux';
import { product1, products } from '../../../ducks/productCatalogue/tests/fixtures';
import { CATALOGUE_EDIT_VIEW_URL } from '../../../constants';
import { mount } from 'enzyme';
import { Helmet } from 'react-helmet';
import { ProductForm } from '../../ProductForm';
import { act } from 'react-dom/test-utils';
import { removeProducts } from '../../../ducks/productCatalogue';
import flushPromises from 'flush-promises';
import toJson from 'enzyme-to-json';
import { authenticateUser } from '@onaio/session-reducer';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fetch = require('jest-fetch-mock');

const history = createBrowserHistory();

describe('CreateEditProduct Page', () => {
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

  beforeEach(() => {
    store.dispatch(removeProducts());
  });

  afterEach(() => {
    fetch.resetMocks();
  });

  it('renders correctly with store(for editing product)', async () => {
    fetch.mockResponse(JSON.stringify(product1));

    const props = {
      history,
      location: {
        hash: '',
        pathname: `${CATALOGUE_EDIT_VIEW_URL}/1`,
        search: '',
        state: {},
      },
      match: {
        isExact: true,
        params: { productId: `1` },
        path: `${CATALOGUE_EDIT_VIEW_URL}/:productId`,
        url: `${CATALOGUE_EDIT_VIEW_URL}/1`,
      },
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedEditProductView {...props}></ConnectedEditProductView>
        </Router>
      </Provider>
    );

    // loading
    expect(toJson(wrapper.find('.ant-spin'))).not.toBeNull();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.text()).toMatchSnapshot('full text snapshot');

    // check if page title is correct
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual('Edit > Scale');

    // check if form is rendered on the page
    expect(wrapper.find('form')).toHaveLength(1);

    expect(wrapper.find(ProductForm).props()).toMatchSnapshot('edit form props');
  });

  it('shows broken page', async () => {
    const props = {
      history,
      location: {
        hash: '',
        pathname: `${CATALOGUE_EDIT_VIEW_URL}/1`,
        search: '',
        state: {},
      },
      match: {
        isExact: true,
        params: { productId: `1` },
        path: `${CATALOGUE_EDIT_VIEW_URL}/:productId`,
        url: `${CATALOGUE_EDIT_VIEW_URL}/1`,
      },
    };

    fetch.mockReject(new Error('Could not pull data'));

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedEditProductView {...props}></ConnectedEditProductView>
        </Router>
      </Provider>
    );

    // show loading screen
    expect(toJson(wrapper.find('.ant-spin'))).not.toBeNull();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // should be in error page
    expect(wrapper.text()).toMatchInlineSnapshot(`"ErrorCould not pull dataGo backGo home"`);
  });

  it('handles missing product', async () => {
    const props = {
      history,
      location: {
        hash: '',
        pathname: `${CATALOGUE_EDIT_VIEW_URL}/7`,
        search: '',
        state: {},
      },
      match: {
        isExact: true,
        params: { productId: `7` },
        path: `${CATALOGUE_EDIT_VIEW_URL}/:productId`,
        url: `${CATALOGUE_EDIT_VIEW_URL}/7`,
      },
    };

    fetch.mockResponse(JSON.stringify(products));

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedEditProductView {...props}></ConnectedEditProductView>
        </Router>
      </Provider>
    );

    // should be in loading screen
    expect(toJson(wrapper.find('.ant-spin'))).not.toBeNull();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    /** resource404 info page */
    expect(wrapper.text()).toMatchInlineSnapshot(
      `"404Sorry, the resource you requested for, does not existGo backGo home"`
    );
  });
});
