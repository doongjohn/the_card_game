function compose(obj, ...mixins) {
  let result = obj;
  for (let mixin of mixins)
    result = { ...result, ...mixin };
  if (obj.prototype)
    result.prototype = obj.prototype;
  return result;
}

function composed(val, ...comps) {
  for (let comp of comps)
    for (let field in comp)
      if (!val.hasOwnProperty(field))
        return false;
  return true;
}