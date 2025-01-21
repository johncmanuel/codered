// Generates a random, unique n-character room code
export function generateRoomCode(numChars: number): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from(
    { length: numChars },
    () => letters[Math.floor(Math.random() * letters.length)],
  ).join("");
}
