import { incrementValue } from "../../common";
import { TotalDocs } from "./schema";

export function incrementDocByOne() {
    return {
        totalDocs: incrementValue(1)
    } as TotalDocs
}

export function decrementDocByOne() {
    return {
        totalDocs: incrementValue(-1)
    } as TotalDocs
}