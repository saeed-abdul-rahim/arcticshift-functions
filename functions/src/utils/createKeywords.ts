export const createKeywords = (name: string) => {
    const arrName: string[] = [];
    let curName = '';
    name.split('').forEach(letter => {
      curName += letter;
      arrName.push(curName);
    });
    return arrName;
}
