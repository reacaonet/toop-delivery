/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const removeAccents = (text: string) => {
  try {
    const result = `${text}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return result;
  } catch (err) {
    return text;
  }
};

export const normalizeObjectAccents = async (objectItem: any): Promise<any> => {
  try {
    for await (const item of Object.keys(objectItem)) {
      if (typeof objectItem[item] === 'object') {
        objectItem[item] = await normalizeObjectAccents(objectItem[item]);
      } else if (typeof objectItem[item] === 'string') {
        objectItem[item] = removeAccents(objectItem[item]);
      }
    }
    return objectItem;
  } catch (err) {
    return objectItem;
  }
};
