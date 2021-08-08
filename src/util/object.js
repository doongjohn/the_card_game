function compose(...mixins) {
  let obj = {};
  for (let mixin of mixins)
    obj = { ...obj, ...mixin };
  return obj;
}