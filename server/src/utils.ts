// Generates a random, unique n-character room code
export function generateRoomCode(numChars: number): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from(
    { length: numChars },
    () => letters[Math.floor(Math.random() * letters.length)],
  ).join("");
}

export function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
