/**
 * pick - Creates an object composed of the picked object properties:
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to pick
 * @returns {object} - returns the new object
 */
export const pick = (obj, ...fields) => {
    let arr =  Object.entries(obj),
        newObj = {};

    arr.forEach((item) => {
       const field = fields.find(field => item[0] == field) ;
       if (field) {
           newObj[field] = item[1];
       }
    })

    return newObj;
};
