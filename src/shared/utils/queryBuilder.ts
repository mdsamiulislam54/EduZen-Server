
import { IQueryParams } from "../../types/query.type";

export class QueryBuilder {
    public query: any;
    public params: IQueryParams;
    public page = 1;
    public limit = 10;
    public skip = 0;
    public sortBy: string = 'createdAt';
    public sortOrder: 'asc' | 'desc' = 'desc';

    constructor(query: any, params: IQueryParams) {
        this.query = query;
        this.params = params;
    }

    search(fields: string[]) {
        const searchTerm = this.params.search;
        if (searchTerm) {
            this.query.where = {
                OR: fields.map((field) => ({
                    [field]: {
                        contains: searchTerm,
                        mode: "insensitive"
                    }
                }))
            }
        }

        return this
    }
    filter() {
        const filter = this.params.filter;
       
        if (filter) {
            const filters = filter.split(",");
             console.log("filter....", filters)
            const where: any = {};

            filters.forEach((f) => {
                let [key, value] = f.split(":");
                if (value?.includes("-")) {
                    const [min, max] = value.split("-");

                    where[key] = {
                        gte: Number(min),
                        lte: Number(max),
                    };

                    return;
                }
                if (key.includes(".")) {
                    const [parent, child] = key.split(".");

                    if (!where[parent]) {
                        where[parent] = {};
                    }

                    where[parent][child] = value;
                } else {
                    where[key] = value;
                }
            });

            this.query.where = {
                ...this.query.where,
                ...where,
            };
        }

        return this;
    }
    sort() {
        const sortBy = this.params.sortBy || 'createdAt';
        const sortOrder = this.params.sortOrder === 'asc' ? 'asc' : 'desc';
        console.log("Class", this.params)
        this.sortBy = sortBy;
        this.sortOrder = sortOrder;

    
            this.query.orderBy = {
                [sortBy]: sortOrder
            }
        
        return this;
    }

    paginate() {
        this.page = Number(this.params.page) || 1;
        this.limit = Number(this.params.limit) || 10;

        this.skip = (this.page - 1) * this.limit;

        this.query.skip = this.skip;
        this.query.take = this.limit;

        return this;
    }

    async getMeta(model: any) {
        const total = await model.count({
            where: this.query.where,
        });

        return {
            page: this.page,
            limit: this.limit,
            total,
            totalPages: Math.ceil(total / this.limit),
        };
    }
}

