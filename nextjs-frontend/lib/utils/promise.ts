export async function tryAsync<T,E>(promise: Promise<T>): Promise<[T, E]> {
    return promise
      .then(data => [data, null] as [T, E])
      .catch(err => [null, err] as [T, E])
  }
  