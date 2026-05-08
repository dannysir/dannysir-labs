export const deepEqual = (a: unknown, b: unknown, seen: WeakMap<object, object> = new WeakMap()): boolean => {
  if (Object.is(a, b)) return true;
  if (a === null || b === null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  const objA = a as object;
  const objB = b as object;

  if (Object.getPrototypeOf(objA) !== Object.getPrototypeOf(objB)) return false;

  if (seen.has(objA)) return seen.get(objA) === objB;
  seen.set(objA, objB);

  if (Array.isArray(objA)) {
    const arrA = objA as unknown[];
    const arrB = objB as unknown[];
    if (arrA.length !== arrB.length) return false;
    return arrA.every((item, i) => deepEqual(item, arrB[i], seen));
  }

  const recordA = objA as Record<string, unknown>;
  const recordB = objB as Record<string, unknown>;
  const keysA = Object.keys(recordA);
  const keysB = Object.keys(recordB);
  if (keysA.length !== keysB.length) return false;

  return keysA.every((k) => (
    Object.prototype.hasOwnProperty.call(recordB, k)
    && deepEqual(recordA[k], recordB[k], seen)
  ));
};
