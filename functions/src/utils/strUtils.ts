export const joinByHyphen = (str: string) => str.split(' ').join('-');

export const urlEncode = (str: string) => encodeURI(joinByHyphen(str))

export const createKeywords = (name: string) => {
    try {
        const arrName: string[] = []
        let curName = ''
        name.split('').forEach(letter => {
            curName += letter.toLowerCase()
            arrName.push(curName)
        })
        return arrName
    } catch (err) {
        console.log(err)
        return []
    }
}

export function randomString(keyStr = 'xT0b2N5') {
    const rand = Math.random().toString(36).slice(-8)
    const date = Date.now().toString(36)
    const str = parseInt([...keyStr].map(s => s.charCodeAt(0)).join('')).toString(36).substring(0, 12)
    return (rand + str + date)
}