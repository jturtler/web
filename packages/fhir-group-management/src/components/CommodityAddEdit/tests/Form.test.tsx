import { store } from '@opensrp/store';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Router } from 'react-router';
import { CommodityForm } from '../Form';
import { createBrowserHistory } from 'history';
import { authenticateUser } from '@onaio/session-reducer';
import nock from 'nock';
import { QueryClientProvider, QueryClient } from 'react-query';
import { cleanup, fireEvent, waitFor } from '@testing-library/react';
import flushPromises from 'flush-promises';
import { groupResourceType } from '../../../constants';
import { commodity1, createdCommodity, editedCommodity } from './fixtures';
import { getGroupFormFields } from '../utils';
import * as notifications from '@opensrp/notifications';
import userEvents from '@testing-library/user-event';

jest.mock('@opensrp/notifications', () => ({
  __esModule: true,
  ...Object.assign({}, jest.requireActual('@opensrp/notifications')),
}));

const history = createBrowserHistory();

jest.mock('fhirclient', () => {
  return jest.requireActual('fhirclient/lib/entry/browser');
});

jest.mock('uuid', () => {
  const actual = jest.requireActual('uuid');
  return {
    ...actual,
    v4: () => '9b782015-8392-4847-b48c-50c11638656b',
  };
});

describe('Health care form', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });

  const AppWrapper = (props: { children: React.ReactNode }) => {
    return (
      <Router history={history}>
        <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>;
      </Router>
    );
  };

  const formProps = {
    fhirBaseUrl: 'http://test.server.org',
    initialValues: getGroupFormFields(),
  };

  beforeAll(() => {
    nock.disableNetConnect();
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

  afterAll(() => {
    nock.enableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    cleanup();
    jest.resetAllMocks();
  });

  it('renders correctly', async () => {
    const div = document.createElement('div');
    document.body.appendChild(div);

    const wrapper = mount(
      <AppWrapper>
        <CommodityForm {...formProps} />
      </AppWrapper>,
      { attachTo: div }
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(toJson(wrapper.find('FormItem#name label'))).toMatchSnapshot('name label');
    expect(toJson(wrapper.find('FormItem#name input'))).toMatchSnapshot('name field');

    expect(toJson(wrapper.find('FormItem#active label').first())).toMatchSnapshot('active label');
    expect(toJson(wrapper.find('FormItem#active input'))).toMatchSnapshot('active field');

    expect(toJson(wrapper.find('FormItem#type label').first())).toMatchSnapshot('type label');
    expect(toJson(wrapper.find('FormItem#type input#type'))).toMatchSnapshot('type field');

    expect(toJson(wrapper.find('FormItem#unitOfMeasure label').first())).toMatchSnapshot(
      'unit of measure label'
    );
    expect(toJson(wrapper.find('FormItem#unitOfMeasure input#unitOfMeasure'))).toMatchSnapshot(
      'unit of measure field'
    );

    expect(toJson(wrapper.find('#submit-button button'))).toMatchSnapshot('submit button');
    expect(toJson(wrapper.find('#cancel-button button'))).toMatchSnapshot('cancel button');

    wrapper.find('button#cancel-button').simulate('click');
    wrapper.unmount();
  });

  it('form validation works', async () => {
    const div = document.createElement('div');
    document.body.appendChild(div);

    const wrapper = mount(
      <AppWrapper>
        <CommodityForm {...formProps} />
      </AppWrapper>,
      { attachTo: div }
    );

    wrapper.find('form').simulate('submit');

    await act(async () => {
      await flushPromises();
    });
    wrapper.update();

    await waitFor(() => {
      const atLeastOneError = document.querySelector('.ant-form-item-explain-error');
      expect(atLeastOneError).toBeInTheDocument();
    });

    // name is required and has no default
    expect(wrapper.find('FormItem#name').text()).toMatchInlineSnapshot(
      `"Enter Commodity nameRequired"`
    );

    // status has no
    expect(wrapper.find('FormItem#active').text()).toMatchInlineSnapshot(
      `"Select Commodity statusActiveDisabled"`
    );

    // required
    expect(wrapper.find('FormItem#type').text()).toMatchInlineSnapshot(
      `"Select Commodity TypeSelect Commodity type'type' is required"`
    );

    // required
    expect(wrapper.find('FormItem#unitOfMeasure').text()).toMatchInlineSnapshot(
      `"Select the unit of measureSelect the unit of measure'unitOfMeasure' is required"`
    );

    wrapper.unmount();
  });

  it('submits new group', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const successNoticeMock = jest
      .spyOn(notifications, 'sendSuccessNotification')
      .mockImplementation(() => undefined);

    const someMockURL = '/someURL';

    nock(formProps.fhirBaseUrl)
      .put(`/${groupResourceType}/9b782015-8392-4847-b48c-50c11638656b`, createdCommodity)
      .reply(200, { ...createdCommodity, id: '123' })
      .persist();

    const wrapper = mount(
      <AppWrapper>
        <CommodityForm successUrl={someMockURL} {...formProps} />
      </AppWrapper>,
      { attachTo: container }
    );

    // simulate active change
    wrapper
      .find('FormItem#active input')
      .first()
      .simulate('change', {
        target: { checked: true },
      });

    // simulate name change
    wrapper
      .find('FormItem#name input')
      .simulate('change', { target: { name: 'name', value: 'Dettol' } });

    // simulate value selection for type
    wrapper.find('input#type').simulate('mousedown');

    const optionTexts = [
      ...document.querySelectorAll(
        '#type_list+div.rc-virtual-list .ant-select-item-option-content'
      ),
    ].map((option) => {
      return option.textContent;
    });

    expect(toJson(wrapper.find('FormItem#type'))).toMatchSnapshot('asd');

    expect(optionTexts).toHaveLength(2);
    expect(optionTexts).toEqual(['Medication', 'Device']);

    // filter searching through members works
    await userEvents.type(document.querySelector('input#type'), 'dev');

    // options after search
    const afterFilterOptionTexts = [
      ...document.querySelectorAll(
        '#type_list+div.rc-virtual-list .ant-select-item-option-content'
      ),
    ].map((option) => {
      return option.textContent;
    });

    expect(afterFilterOptionTexts).toHaveLength(1);
    expect(afterFilterOptionTexts).toEqual(['Device']);

    fireEvent.click(document.querySelector('[title="Device"]'));

    // unit of measure

    // simulate value selection for members
    wrapper.find('input#unitOfMeasure').simulate('mousedown');

    fireEvent.click(document.querySelector('[title="Bottles"]'));

    await flushPromises();
    wrapper.update();

    wrapper.find('form').simulate('submit');

    await waitFor(() => {
      expect(successNoticeMock.mock.calls).toEqual([['Commodity updated successfully']]);
    });

    expect(nock.isDone()).toBeTruthy();
    wrapper.unmount();
  });

  it('cancel handler is called on cancel', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const cancelUrl = '/canceled';

    const wrapper = mount(
      <AppWrapper>
        <CommodityForm cancelUrl={cancelUrl} {...formProps} />
      </AppWrapper>,

      { attachTo: container }
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    wrapper.find('button#cancel-button').simulate('click');
    wrapper.update();

    expect(history.location.pathname).toEqual('/canceled');
    wrapper.unmount();
  });

  it('edits resource', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const errorNoticeMock = jest
      .spyOn(notifications, 'sendErrorNotification')
      .mockImplementation(() => undefined);

    nock(formProps.fhirBaseUrl)
      .put(`/${groupResourceType}/${commodity1.id}`, editedCommodity)
      .replyWithError('Failed to update Commodity')
      .persist();

    const initialValues = getGroupFormFields(commodity1);
    const localProps = {
      ...formProps,
      initialValues,
    };

    const wrapper = mount(
      <AppWrapper>
        <CommodityForm {...localProps} />
      </AppWrapper>,
      { attachTo: container }
    );

    // simulate name change
    wrapper
      .find('FormItem#name input')
      .simulate('change', { target: { name: 'name', value: 'Dettol Strips' } });

    // simulate active check to be disabled
    wrapper
      .find('FormItem#active input')
      .last()
      .simulate('change', {
        target: { checked: true },
      });

    // simulate value selection for members
    wrapper.find('input#unitOfMeasure').simulate('mousedown');
    // check options
    document
      .querySelectorAll('#unitOfMeasure .ant-select-item ant-select-item-option')
      .forEach((option) => {
        expect(option).toMatchSnapshot('organizations option');
      });

    fireEvent.click(document.querySelector('[title="Strips"]'));

    await flushPromises();
    wrapper.update();

    wrapper.find('form').simulate('submit');

    await waitFor(() => {
      expect(errorNoticeMock.mock.calls).toEqual([
        [
          `request to http://test.server.org/Group/${commodity1.id} failed, reason: Failed to update Commodity`,
        ],
      ]);
    });

    expect(nock.isDone()).toBeTruthy();

    wrapper.unmount();
  });
});
