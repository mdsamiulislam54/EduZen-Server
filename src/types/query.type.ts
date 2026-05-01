export interface IQueryParams {
    search ?: string;
    page?: string;
    limit?: string;
    sort?: string;
    filter:string 
    [key: string] : string | undefined;
}