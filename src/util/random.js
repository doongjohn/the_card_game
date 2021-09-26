Array.shuffle = function (array, count) {
  for (let i = 0; i < count; ++i)
    array.sort(() => Math.random() - 0.5)
}