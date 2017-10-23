export function mapPromise(items, mapper) {
  const reducer = (promise, item) =>
    promise.then(mappedItems => mapper(item).then(res => mappedItems.concat([res])));
  return items.reduce(reducer, Promise.resolve([]));
}
