export default function flattenObject(object) {
  function traverseObjectRecursive(properties, obj) {
    Object.keys(obj).forEach((key) => {
      properties.push({
        obj: obj,
        key: key,
        value: obj[key]
      });

      if (typeof obj[key] === 'object') {
        traverseObjectRecursive(properties, obj[key]);
      }
    });

    return properties;
  }

  return traverseObjectRecursive([], object);
}
