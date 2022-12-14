/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
    let newArr = [...arr];
    newArr.sort(( a, b ) => {   
        return  a.localeCompare(b.toLowerCase(), ['ru', 'en'], {caseFirst: "upper"});
    })
    let res = param === 'asc' ? newArr : newArr.reverse()
    return res;
}
