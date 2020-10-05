export function strArrToBoolObject(arr: string[]) {
    return arr.reduce(function(m: any, v) {
        m[v] = true;
        return m;
      }, {});
}
