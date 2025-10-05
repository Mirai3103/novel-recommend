// NOTE: Supports cases where `content-type` is other than `json`
const getBody = <T>(c: Response | Request): Promise<T> => {
  const contentType = c.headers.get('content-type');

  if (contentType && contentType.includes('application/json')) {
    return c.json();
  }

  if (contentType && contentType.includes('application/pdf')) {
    return c.blob() as Promise<T>;
  }

  return c.text() as Promise<T>;
};

// NOTE: Update just base url
const getUrl = (contextUrl: string): string => {
  const url = new URL(contextUrl);
  const pathname = url.pathname;
  const search = url.search;
  const baseUrl =
    process.env.NODE_ENV === 'production'
      ? 'productionBaseUrl'
      : 'http://localhost:3000';

  const requestUrl = new URL(`${baseUrl}${pathname}${search}`);

  return requestUrl.toString();
};

// NOTE: Add headers
const getHeaders = (headers?: HeadersInit): HeadersInit => {
  return {
    ...headers,
    Authorization: 'token',
    'Content-Type': 'multipart/form-data',
  };
};
export class FetchError<T = {[key: string]: any}> extends Error {
  public status: number;
  public body: T;
  constructor(response: Response, data: T) {
    super(response.statusText);
    this.name = 'CustomFetchError';
    this.status = response.status;
    this.body = data;
  }
}
export const customFetch = async <T>(
  url: string,
  options: RequestInit,
): Promise<T> => {
  const requestUrl = getUrl(url);
  const requestHeaders = getHeaders(options.headers);

  const requestInit: RequestInit = {
    ...options,
    headers: requestHeaders,
  };

  const response = await fetch(requestUrl, requestInit);
  const data = await getBody<T>(response);
  if(!response.ok){
    throw new FetchError<T>(response, data);
  }

  return data as T
};