import { product1, products } from '../../ducks/productCatalogue/tests/fixtures';
import {
  loadProductCatalogue,
  loadSingleProduct,
  postProduct,
  postPutOptions,
  putProduct,
} from '../dataLoaders';
import * as catalogueDux from '../../ducks/productCatalogue';
import flushPromises from 'flush-promises';
import { store } from '@opensrp/store';
import { authenticateUser } from '@onaio/session-reducer';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fetch = require('jest-fetch-mock');

const mockBaseURL = 'https://example.com/rest';

jest.setTimeout(10000);

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
    fetch.once(JSON.stringify(products));
    const creatorSpy = jest.spyOn(catalogueDux, 'fetchProducts');
    loadProductCatalogue(mockBaseURL).catch((e) => {
      throw e;
    });
    await flushPromises();

    expect(creatorSpy).toHaveBeenCalledWith(products);
    creatorSpy.mockRestore();
    expect(fetch.mock.calls[0]).toEqual([
      'https://example.com/restproduct-catalogue',
      {
        headers: {
          accept: 'application/json',
          authorization: 'Bearer sometoken',
          'content-type': 'application/json;charset=UTF-8',
        },
        method: 'GET',
      },
    ]);
  });

  it('no products in api', async () => {
    fetch.once(JSON.stringify([]));
    const creatorSpy = jest.spyOn(catalogueDux, 'fetchProducts');

    loadProductCatalogue(mockBaseURL).catch((e) => {
      expect(e.message).toEqual('No products found in the catalogue');
    });

    await flushPromises();

    expect(creatorSpy).toHaveBeenCalled();
    creatorSpy.mockRestore();
    expect(fetch.mock.calls[0]).toEqual([
      'https://example.com/restproduct-catalogue',
      {
        headers: {
          accept: 'application/json',
          authorization: 'Bearer sometoken',
          'content-type': 'application/json;charset=UTF-8',
        },
        method: 'GET',
      },
    ]);
  });

  it('load loadSingleProduct works correctly', async () => {
    fetch.once(JSON.stringify(product1));
    const creatorSpy = jest.spyOn(catalogueDux, 'fetchProducts');
    loadSingleProduct(mockBaseURL, '1').catch((e) => {
      throw e;
    });
    await flushPromises();

    expect(creatorSpy).toHaveBeenCalledWith([product1]);
    creatorSpy.mockRestore();
    expect(fetch.mock.calls[0]).toEqual([
      'https://example.com/restproduct-catalogue/1',
      {
        headers: {
          accept: 'application/json',
          authorization: 'Bearer sometoken',
          'content-type': 'application/json;charset=UTF-8',
        },
        method: 'GET',
      },
    ]);
  });

  it('load loadSingleProduct behaves when error', async () => {
    fetch.once(JSON.stringify({}));
    const creatorSpy = jest.spyOn(catalogueDux, 'fetchProducts');
    loadSingleProduct(mockBaseURL, '1').catch((e) => {
      expect(e.message).toEqual('Product not found in the catalogue');
    });
    await flushPromises();

    expect(creatorSpy).not.toHaveBeenCalled();
    creatorSpy.mockRestore();
  });

  it('postProduct works correctly', async () => {
    fetch.once(JSON.stringify({}));
    const sampleFile = new File(['dummy'], 'dummy.txt');
    const mockPayload = { name: 'Ghost', photoURL: sampleFile, uniqueId: '1' };
    postProduct(mockBaseURL, mockPayload).catch((e) => {
      throw e;
    });
    await flushPromises();

    expect(fetch.mock.calls[0]).toMatchObject([
      'https://example.com/restproduct-catalogue',
      {
        body: expect.any(FormData),
        headers: {
          authorization: 'Bearer sometoken',
        },
        method: 'POST',
      },
    ]);

    const body = fetch.mock.calls[0][1].body;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bodyObject = (Object as any).fromEntries(body);
    expect(bodyObject).toMatchObject({
      file: sampleFile,
      productCatalogue: expect.any(File),
    });

    const reader = new FileReader();
    reader.readAsText(bodyObject.productCatalogue);

    reader.addEventListener('load', function () {
      try {
        const result = reader.result;
        expect(result).toEqual(JSON.stringify({ name: 'Ghost' }));
      } catch (_) {
        // eslint-disable-next-line no-empty
      }
    });

    await flushPromises();
  });

  it('putProduct works correctly', async () => {
    fetch.once(JSON.stringify({}));
    const sampleFile = new File(['dummy'], 'dummy.txt');
    const mockPayload = { name: 'Ghost', photoURL: sampleFile, uniqueId: '1' };
    putProduct(mockBaseURL, mockPayload).catch((e) => {
      throw e;
    });
    await flushPromises();

    expect(fetch.mock.calls[0]).toMatchObject([
      'https://example.com/restproduct-catalogue/1',
      {
        body: expect.any(FormData),
        headers: {
          authorization: 'Bearer sometoken',
        },
        method: 'PUT',
      },
    ]);

    const body = fetch.mock.calls[0][1].body;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bodyObject = (Object as any).fromEntries(body);
    expect(bodyObject).toMatchObject({
      file: sampleFile,
      productCatalogue: expect.any(File),
    });

    const reader = new FileReader();
    reader.readAsText(bodyObject.productCatalogue);

    reader.addEventListener('load', function () {
      try {
        const result = reader.result;
        expect(result).toEqual(JSON.stringify({ name: 'Ghost', uniqueId: '1' }));
      } catch (_) {
        // eslint-disable-next-line no-empty
      }
    });

    await flushPromises();
  });

  it('postProduct behaves when error', async () => {
    const errorMessage = 'Posting failed';
    fetch.mockReject(new Error(errorMessage));
    const sampleFile = new File(['dummy'], 'dummy.txt');
    const mockPayload = { name: 'Ghost', photoURL: sampleFile, uniqueId: '1' };
    postProduct(mockBaseURL, mockPayload).catch((e) => {
      expect(e.message).toEqual(errorMessage);
    });
    await flushPromises();
  });

  it('putProduct behaves when error', async () => {
    const errorMessage = 'Posting failed';
    fetch.mockReject(new Error(errorMessage));
    const sampleFile = new File(['dummy'], 'dummy.txt');
    const mockPayload = { name: 'Ghost', photoURL: sampleFile };
    putProduct(mockBaseURL, mockPayload).catch((e) => {
      expect(e.message).toEqual(errorMessage);
    });
    await flushPromises();
  });

  it('custom getFetchOptions works when payload is undefined', () => {
    const signal = new AbortController().signal;
    const mockAccessToken = 'So secret';
    const res = postPutOptions(signal, mockAccessToken, 'POST');
    expect(res).toEqual({
      headers: {
        accept: 'application/json',
        authorization: 'Bearer So secret',
        'content-type': 'application/json;charset=UTF-8',
      },
      method: 'POST',
    });
  });
});
