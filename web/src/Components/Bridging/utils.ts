import { GraphData } from "../../Types";

export function differentiateArrayObjects(arr: GraphData[]): GraphData[] {
    return arr.map((currentObj, index, array) => {
        // Handling for the last element since it has no successor
        if (index === array.length - 1) {
            const lastObj: GraphData = { size: currentObj.size }; // Preserving the size property
            // Set all other properties to NaN or 0 to indicate no difference can be calculated
            Object.keys(currentObj).forEach((key) => {
                if (key !== 'size') {
                    lastObj[key] = NaN; // or set to 0 as per requirement
                }
            });
            return lastObj;
        }

        const nextObj = array[index + 1];
        const differentiatedObj: GraphData = { size: currentObj.size }; // Preserve the size property

        // Iterate over the properties of the current object
        Object.keys(currentObj).forEach((key) => {
            if (key !== 'size' && typeof currentObj[key] === 'number') {
                // Calculate the difference with the next object's corresponding property
                const difference = (nextObj[key] || 0) - currentObj[key];
                differentiatedObj[key] = parseFloat(difference.toFixed(3));
            }
        });

        return differentiatedObj;
    });
}