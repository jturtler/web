import { postPutPlan } from '../dataloaders';
import flushPromises from 'flush-promises';
import { store } from '@opensrp/store';
import { authenticateUser } from '@onaio/session-reducer';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fetch = require('jest-fetch-mock');

const mockBaseURL = 'https://example.com/rest/';

describe('dataLoading', () => {
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
    fetch.resetMocks();
  });

  it('load loadProductCatalogue works correctly', async () => {
    fetch.mockResponse(JSON.stringify({}));
    const mockPayload = { title: 'Some title' };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    postPutPlan(mockPayload as any, mockBaseURL).catch((e) => {
      throw e;
    });
    await flushPromises();

    expect(fetch.mock.calls[0]).toEqual([
      'https://example.com/rest/plans',
      {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        body: '{"title":"Some title"}',
        headers: {
          accept: 'application/json',
          authorization: 'Bearer sometoken',
          'content-type': 'application/json;charset=UTF-8',
        },
        method: 'PUT',
      },
    ]);
  });

  it('load loadProductCatalogue works correctly when creating', async () => {
    const mockPayload = { title: 'Some title' };
    fetch.mockResponse(JSON.stringify({}));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    postPutPlan(mockPayload as any, mockBaseURL, false).catch((e) => {
      throw e;
    });
    await flushPromises();

    expect(fetch.mock.calls[0]).toEqual([
      'https://example.com/rest/plans',
      {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        body: '{"title":"Some title"}',

        headers: {
          accept: 'application/json',
          authorization: 'Bearer sometoken',
          'content-type': 'application/json;charset=UTF-8',
        },
        method: 'POST',
      },
    ]);
  });

  it('handles errors', async () => {
    const errorMessage = 'Plan service is offline';
    fetch.mockReject(new Error(errorMessage));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    postPutPlan({} as any, mockBaseURL, false).catch((e) => {
      expect(e.message).toEqual(errorMessage);
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    postPutPlan({} as any, mockBaseURL, true).catch((e) => {
      expect(e.message).toEqual(errorMessage);
    });
    await flushPromises();
  });
});
