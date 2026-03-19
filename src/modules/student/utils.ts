export function generateRollNumber(): string {
    const randomNumber = Math.floor(100000 + Math.random() * 900000); // 100000 - 999999
    return String(randomNumber);
}