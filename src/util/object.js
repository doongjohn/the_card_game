function compose(...mixins) {
  let obj = {};
  for (let mixin of mixins)
    obj = { ...obj, ...mixin };
  return obj;
}

function composed(val, ...comps) {
  for (let comp of comps)
    for (let field in comp)
      if (!val.hasOwnProperty(field))
        return false;
  return true;
}