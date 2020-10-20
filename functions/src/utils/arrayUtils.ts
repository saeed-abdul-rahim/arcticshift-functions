export const allEqual = (arr: any[]) => arr.every( v => v === arr[0] )

export const isBothArrEqual = (a: any[], b: any[]) => a.length === b.length && a.every((el, ix) => el === b[ix])

export function uniqueArr(data: string[]): string[] {
    return [...new Set([...data])]
}

export function arraySplit(inputArray: any[], splitSize = 10) {
    const result = inputArray.reduce((resultArray: any[][], item: any, index: number) => { 
        const chunkIndex = Math.floor(index/splitSize)
        if(!resultArray[chunkIndex]) resultArray[chunkIndex] = []
        resultArray[chunkIndex].push(item)
        return resultArray
    }, [])
    return result
}

export function filterOut(value: string[], from: string[]): string[] {
    try {
        let filtered = from
        value.map(v => filtered = filtered.filter(fv => fv !== v))
        return filtered
    } catch (err) {
        throw err
    }
}

export function filterIn(value: string[], from: string[]): string[] {
    try {
        let filtered = from
        value.map(v => filtered = filtered.filter(fv => fv === v))
        return filtered
    } catch (err) {
        throw err
    }
}

export function arrToBoolObject(arr: string[]) {
    return arr.reduce((m: any, v) => {
        m[v] = true
        return m
      }, {})
}

export function hasDuplicatesArrObj(objArr: any[], property: string) {
    const seen = new Set()
    return objArr.some(currentObject => {
        return seen.size === seen.add(currentObject[property]).size
    })
}

export function mergeDuplicatesArrObj(objArr: any[]): any {
    return objArr.reduce((acc, n) => {
        for (const prop in n) {
          if (acc.hasOwnProperty(prop)) acc[prop] += n[prop]
          else acc[prop] = n[prop]
        }
        return acc
    }, {})
}

export function removeDuplicatesArrObj(objArr: any[], prop: string, keepLast?: boolean) {
    let newObjArr = objArr
    if (keepLast) {
        newObjArr = newObjArr.slice().reverse()
    }
    newObjArr = newObjArr.filter((v, i, a) => a.findIndex(t=>(t[prop] === v[prop]))===i)
    return keepLast ? newObjArr.reverse() : newObjArr
}
