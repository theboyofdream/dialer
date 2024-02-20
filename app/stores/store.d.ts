type ApiResponse<T> = {
  status: number;
  message: string;
  data: T;
};
type JsonResponse = { [key: string]: string }


export type {
  ApiResponse,
  JsonResponse
}