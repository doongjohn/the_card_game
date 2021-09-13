function shuffleArray(array, n = 1) {
  for (let i = 0; i < n; ++i)
    array.sort(() => Math.random() - 0.5)
}