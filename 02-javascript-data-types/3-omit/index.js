/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
    let arr =  Object.entries(obj),
        newObj = {};

    arr.forEach((item) => {
       const field = fields.find(field => item[0] == field) ;
       if (!field) {
           newObj[item[0]] = item[1];
       }
    })

    return newObj;
};
