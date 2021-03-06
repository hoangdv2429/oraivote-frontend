const processSchema = (schema) => {
    try {
        if ((schema.oneOf || schema.anyOf)) {
            let key = 'anyOf';
            if (schema.oneOf) key = 'oneOf';
            schema[key] = ((schema.oneOf || schema.anyOf)).map((item) => ({
                ...item, title: item.required[0]
                    .replace(/_/g, ' ')
                    .replace(/(?<=^|\s+)\w/g, (v) => v.toUpperCase())
            }))
            return schema;
        }
        return schema
    } catch (error) {
        console.log("process schema failed:", error);
        return null;
    }
};

export const parseGasLimits = (gasLimits) => {
    if (!gasLimits) return undefined;
    return { upload: gasLimits, init: gasLimits, exec: gasLimits }
}

export { processSchema };