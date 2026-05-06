export interface IMarkCreate {
  examId: string;
  marks: {
    studentId: string;
    mark: number;
  }[];
}