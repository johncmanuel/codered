export const toTitleCase = (input: string): string => {
  return input
    .replace(/[_\-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
