import { Batch } from "../../generated/client";

const createBatch = async (payload:Batch)=>{
    console.log(payload)
}


export const batchService = {
    createBatch
}