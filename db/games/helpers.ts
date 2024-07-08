export const selectPlayerRandomly = () => {
    return Math.random() < 0.5
        ? "X"
        : "O"
}