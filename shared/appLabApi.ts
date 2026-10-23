/** Shared allowlists: no arbitrary property or JavaScript method access. */
export const appPropertyFields = {
  text: 'text', 'background-color': 'background', 'text-color': 'colour', 'font-size': 'fontSize',
  x: 'x', y: 'y', width: 'width', height: 'height', hidden: 'hidden', checked: 'checked', value: 'value',
} as const;
export const appNumberFunctions = { randomNumber: 2, roundNumber: 1, floorNumber: 1, ceilNumber: 1, absNumber: 1, minNumber: 2, maxNumber: 2 } as const;
export const appTextFunctions = { textLength: 1, upperCase: 1, lowerCase: 1, containsText: 2, sliceText: 3 } as const;
