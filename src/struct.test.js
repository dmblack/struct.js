/* global expect it */
import { dependencies, array, boolean, date, integer, string } from './dependency_inject.testsetup';

const basicSchema = {
  'id': '/TestSchema',
  'type': 'object',
  'additionalProperties': true,
  'properties': {
    'array': { 'default': array(), 'type': 'array' },
    'boolean': { 'default': boolean(), 'type': 'boolean' },
    'date': { 'default': date(), 'type': 'string', 'format': 'date-time' },
    'integer': { 'default': integer(), 'type': 'integer' },
    'string': { 'default': string(), 'type': 'string' }
  },
  'required': ['array', 'boolean', 'date', 'integer', 'string']
};

const struct = require('./struct.js').default(Object.assign({}, dependencies, { 'schema': basicSchema }));

const basicStruct = struct({});

it('BASIC STRUCT - Should be invalid state', () => {
  expect(basicStruct.isValid()).toBeFalsy();
});

it('BASIC STRUCT - Should return an empty object', () => {
  expect(Object.keys(basicStruct.get()['/TestSchema']).length).toEqual(0);
});

it('BASIC STRUCT - Should return an object on scaffold', () => {
  expect(typeof basicStruct.scaffold()).toEqual('object');
});

it('BASIC STRUCT - Should now be in valid state', () => {
  expect(basicStruct.isValid()).toBeTruthy();
});

it('BASIC STRUCT - Should not return an empty object', () => {
  expect(Object.keys(basicStruct.get()['/TestSchema']).length).toEqual(Object.keys(basicSchema.properties).length);
});

it('BASIC STRUCT - Set should allow updating a variable', () => {
  const key = 'integer';
  const value = integer();
  expect(basicStruct.get('integer')).toEqual(basicSchema.properties.integer.default);
  expect(typeof basicStruct.set({ [key]: value })).toEqual(typeof value);
  expect(basicStruct.get('integer')).toEqual(value);
});

it('STRUCT BASE - STRICT - Should allow additional properties', () => {
  const key = string();
  const value = string();
  expect(Object.keys(basicStruct.get()['/TestSchema']).length).toEqual(Object.keys(basicSchema.properties).length);
  expect(typeof basicStruct.set({ [key]: value })).toEqual(typeof value);
  expect(Object.keys(basicStruct.get()['/TestSchema']).length).toEqual(Object.keys(basicSchema.properties).length + 1);
  expect(basicStruct.isValid).toBeTruthy();
});
