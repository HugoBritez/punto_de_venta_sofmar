export interface ResponseViewModel<T> {
    body: T;
    statusCode: number;
    success: boolean;
}