export const calculateGrade = (mark: number, total: number) => {
  const percent = (mark / total) * 100;

  if (percent >= 80) return "A+";
  if (percent >= 70) return "A";
  if (percent >= 60) return "A-";
  if (percent >= 50) return "B";
  if (percent >= 40) return "C";
  return "F";
};