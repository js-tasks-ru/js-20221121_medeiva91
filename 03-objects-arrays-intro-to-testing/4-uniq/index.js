/**
 * uniq - returns array of uniq values:
 * @param {*[]} arr - the array of primitive values
 * @returns {*[]} - the new array with uniq values
 */
export function uniq(arr) {
    if (!arr) { return []};

    let newArr = [];
    arr.forEach((item) => {
        if (!newArr.includes(item)) {
            newArr.push(item);
        }
    })

    return newArr;
}
