"use strict";

const loValues = require("lodash/values");

const {
  isString,
  isNumber,
  isDate,
  isStringFloat,
  isUndefined,
  isFunction,
  isArray,
  isObject,
  isBoolean,
  isError,
  isNull,
  isENUMObject,
  isJKTObject
} = require("./utils/detector");

const STRING = "String";
const STRING_ONLY = `${STRING}!`;
const NUMBER = "Number";
const NUMBER_ONLY = `${NUMBER}!`;
const DATE = "Date";
const DATE_ONLY = `${DATE}!`;
const BOOLEAN = "Boolean";
const BOOLEAN_ONLY = `${BOOLEAN}!`;
const OBJECT = "Object";
const OBJECT_ONLY = `${OBJECT}!`;
const ARRAY = "Array";
const ARRAY_ONLY = `${ARRAY}!`;
const FUNCTION = "Function";
const FUNCTION_ONLY = `${FUNCTION}!`;
const ANY = "Any";

const parserableTypes = typeName =>
  [STRING, ARRAY, BOOLEAN, DATE, FUNCTION, NUMBER, OBJECT, ANY].includes(
    typeName
  );

const nonNullableTypes = typeName =>
  [
    STRING_ONLY,
    ARRAY_ONLY,
    BOOLEAN_ONLY,
    DATE_ONLY,
    FUNCTION_ONLY,
    NUMBER_ONLY,
    OBJECT_ONLY
  ].includes(typeName);

const isPredefinedTypes = valueType =>
  isFunction(valueType) ||
  isArray(valueType) ||
  isObject(valueType) ||
  isBoolean(valueType) ||
  isDate(valueType) ||
  isError(valueType) ||
  isNull(valueType) ||
  isNumber(valueType) ||
  (isString(valueType) && !nonNullableTypes(valueType) && !parserableTypes(valueType));

const hasValidTypes = schema => {
  let valid = true;
  loValues(schema).forEach(t => {
    if (!(parserableTypes(t) || nonNullableTypes(t))) {
      const validPredefinedVal =
        isFunction(t) ||
        isArray(t) ||
        isObject(t) ||
        isBoolean(t) ||
        isDate(t) ||
        isError(t) ||
        isNull(t) ||
        isNumber(t) ||
        isJKTObject(t) ||
        isENUMObject(t);
      if (!validPredefinedVal) {
        valid = false;
      }
    }
  });
  return valid;
};

const isDeleteProperty = value => /\s*\!DELETE\s*/g.test(value);

module.exports = {
  STRING,
  STRING_ONLY,
  NUMBER,
  NUMBER_ONLY,
  DATE,
  DATE_ONLY,
  BOOLEAN,
  BOOLEAN_ONLY,
  OBJECT,
  OBJECT_ONLY,
  ARRAY,
  ARRAY_ONLY,
  FUNCTION,
  FUNCTION_ONLY,
  ANY,
  parserableTypes,
  nonNullableTypes,
  isDeleteProperty,
  isPredefinedTypes,
  hasValidTypes
};
