export interface ResponseError extends Error {
    statusCode: number;
    errors?: [string, unknown][];
}
