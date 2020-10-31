export const createKeywords = (name: string) => {
  try {
    const arrName: string[] = []
    let curName = ''
    name.split('').forEach(letter => {
      curName += letter
      arrName.push(curName)
    })
    return arrName
  } catch (err) {
    console.log(err)
    return []
  }
}
