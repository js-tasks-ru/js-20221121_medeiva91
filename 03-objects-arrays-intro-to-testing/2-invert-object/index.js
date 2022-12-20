/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
    if (obj) {
        const keys = Object.keys(obj);
        const values = Object.values(obj);
    
        let newObj = {};
    
        values.forEach((value, index) => {
            newObj[value] = keys[index];
        });
    
        return newObj;   
    } else {
        return obj;
    }

}
