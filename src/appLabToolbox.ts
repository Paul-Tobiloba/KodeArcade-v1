import { appNumberFunctions, appTextFunctions } from '../shared/appLabApi';

export const appToolboxCategories = [
  { name: 'UI controls', colour: 'ui', examples: [
    'onEvent("button1", "click", function() {\n});', 'onEvent("input1", "change", function() {\n});',
    'setText("label1", "Hello!");', 'setNumber("label1", 10);', 'setChecked("checkbox1", true);',
    'setProperty("label1", "background-color", "#6d4aff");', 'setProperty("label1", "text-color", "#ffffff");',
    'setProperty("label1", "font-size", 24);', 'setProperty("slider1", "value", 75);',
    'setPosition("label1", 20, 100);', 'setSize("label1", 200, 60);',
    'setScreen("home");', 'showElement("label1");', 'hideElement("label1");',
  ] },
  { name: 'Control', colour: 'control', examples: [
    'onStart(function() {\n});', 'if (score > 0) {\n}', 'if (score > 0) {\n} else {\n}', 'repeat(4, function() {\n});',
    'if (!getChecked("checkbox1")) {\n}', 'if (score >= 10) {\n}', 'if (score <= 0) {\n}',
    'if (score > 0 && score < 10) {\n}', 'if (score === 0 || score === 10) {\n}',
  ] },
  { name: 'Variables', colour: 'variable', examples: [
    'var score = 0;', 'score = score + 1;', 'score = score - 1;', 'var name = getText("input1");',
    'var amount = getNumber("input1");', 'var enabled = getChecked("checkbox1");',
  ] },
  { name: 'Text', colour: 'variable', examples: [
    'var message = joinText("Hello, ", "Coder");', 'var letters = textLength("Hello");',
    'var loud = upperCase("hello");', 'var quiet = lowerCase("HELLO");',
    'var found = containsText("Hello, Coder", "Coder");', 'var piece = sliceText("Hello", 0, 3);',
  ] },
  { name: 'Math', colour: 'control', examples: [
    'var result = 5 + 3;', 'var result = 5 - 3;', 'var result = 5 * 3;', 'var result = 6 / 3;', 'var remainder = 7 % 3;',
    'var roll = randomNumber(1, 6);', 'var rounded = roundNumber(2.6);', 'var lower = floorNumber(2.6);',
    'var higher = ceilNumber(2.2);', 'var distance = absNumber(-5);', 'var smallest = minNumber(3, 7);', 'var largest = maxNumber(3, 7);',
  ] },
  { name: 'Data', colour: 'data', examples: [
    'setCell("table1", 0, "value", 1);', 'var item = getCell("table1", 0, "name");', 'var rows = getRowCount("table1");',
    'addRow("table1");', 'deleteRow("table1", 0);', 'console.log("Hello!");', 'console.log(getProperty("label1", "text"));',
  ] },
] as const;

export const appCommandHints: [string, string][] = [
  ['onEvent', '(id, "click" | "change", function() { … })'], ['onStart', '(function() { … })'],
  ['setText', '(id, text)'], ['setNumber', '(id, number)'], ['getText', '(id)'], ['getNumber', '(id)'], ['getChecked', '(id)'], ['setChecked', '(id, trueOrFalse)'],
  ['setScreen', '(screenId)'], ['showElement', '(id)'], ['hideElement', '(id)'], ['setProperty', '(id, property, value)'], ['getProperty', '(id, property)'],
  ['setPosition', '(id, x, y)'], ['setSize', '(id, width, height)'], ['joinText', '(first, second)'], ['repeat', '(count, function() { … })'],
  ['getCell', '(table, row, column)'], ['setCell', '(table, row, column, value)'], ['getRowCount', '(table)'], ['addRow', '(table)'], ['deleteRow', '(table, row)'], ['console.log', '(value)'],
  ...Object.entries(appNumberFunctions).map(([name, count]): [string, string] => [name, count === 1 ? '(number)' : '(first, second)']),
  ...Object.entries(appTextFunctions).map(([name, count]): [string, string] => [name, count === 1 ? '(text)' : count === 2 ? '(text, search)' : '(text, start, end)']),
];
