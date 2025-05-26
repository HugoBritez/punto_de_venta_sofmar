export interface ResponseViewModel<T> {
    data: T;
    statusCode: number;
    success: boolean;
}