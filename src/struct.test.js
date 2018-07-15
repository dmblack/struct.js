/* global expect it */
import { dependencies, array, boolean, date, integer, string } from './setupTests';

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

const basStruct = require('./struct.js').default(Object.assign({}, dependencies, { 'schema': basicSchema }));

const basicStruct = basStruct({});

it('BASIC STRUCT - Should be invalid state', () => {
  expect(basicStruct.isValid()).toBeFalsy();
});

it('BASIC STRUCT - Should return an empty object', () => {
  expect(Object.keys(basicStruct.get()[basicSchema.id]).length).toEqual(0);
});

it('BASIC STRUCT - Should return an object on scaffold', () => {
  expect(typeof basicStruct.scaffold()).toEqual('object');
});

it('BASIC STRUCT - Should now be in valid state', () => {
  expect(basicStruct.isValid()).toBeTruthy();
});

it('BASIC STRUCT - Should not return an empty object', () => {
  expect(Object.keys(basicStruct.get()[basicSchema.id]).length).toEqual(Object.keys(basicSchema.properties).length);
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
  expect(Object.keys(basicStruct.get()[basicSchema.id]).length).toEqual(Object.keys(basicSchema.properties).length);
  expect(typeof basicStruct.set({ [key]: value })).toEqual(typeof value);
  expect(Object.keys(basicStruct.get()[basicSchema.id]).length).toEqual(Object.keys(basicSchema.properties).length + 1);
  expect(basicStruct.isValid()).toBeTruthy();
});

// In this test case, we inject a child schema (which may be recursive).
const advancedSchema = {
  'id': '/AdvancedSchema',
  'type': 'object',
  'additionalProperties': false,
  'properties': {
    'array': { 'default': array(), 'type': 'array' },
    'boolean': { 'default': boolean(), 'type': 'boolean' },
    'date': { 'default': date(), 'type': 'string', 'format': 'date-time' },
    'integer': { 'default': integer(), 'type': 'integer' },
    'string': { 'default': string(), 'type': 'string' },
    '/AdvancedChildSchema': {
      '$ref': '/AdvancedChildSchema'
    }
  },
  'required': ['array', 'boolean', 'date', 'integer', 'string', '/AdvancedChildSchema']
};

const advancedChildSchema = {
  'id': '/AdvancedChildSchema',
  'properties': {
    'created_at': { 'default': date(), 'type': 'string', 'format': 'date-time' },
    'created_by': { 'default': integer(), 'type': 'integer' },
    'updated_at': { 'default': date(), 'type': 'string', 'format': 'date-time' },
    'updated_by': { 'default': integer(), 'type': 'integer' }
  },
  'required': ['created_at', 'created_by', 'updated_at', 'updated_by']
};

const advStruct = require('./struct.js').default(Object.assign({}, dependencies, { 'schema': advancedSchema }, { 'additionalSchema': advancedChildSchema }));

const advancedStruct = advStruct({});

it('ADVANCED STRUCT - Should be invalid state', () => {
  expect(advancedStruct.isValid()).toBeFalsy();
});

it('ADVANCED STRUCT - Should return an empty object', () => {
  expect(Object.keys(advancedStruct.get()[advancedSchema.id]).length).toEqual(0);
});

it('ADVANCED STRUCT - Should return an object on scaffold', () => {
  expect(typeof advancedStruct.scaffold()).toEqual('object');
});

it('ADVANCED STRUCT - Should now be in valid state', () => {
  expect(advancedStruct.isValid()).toBeTruthy();
});

it('ADVANCED STRUCT - Should not return an empty object', () => {
  expect(Object.keys(advancedStruct.get()[advancedSchema.id]).length).toEqual(Object.keys(advancedSchema.properties).length);
});

it('ADVANCED STRUCT - Set should allow updating a variable', () => {
  const key = 'integer';
  const value = integer();
  expect(advancedStruct.get('integer')).toEqual(advancedSchema.properties.integer.default);
  expect(typeof advancedStruct.set({ [key]: value })).toEqual(typeof value);
  expect(advancedStruct.get('integer')).toEqual(value);
});

it('STRUCT BASE - STRICT - Should NOT allow additional properties', () => {
  const key = string();
  const value = string();
  expect(Object.keys(advancedStruct.get()[advancedSchema.id]).length).toEqual(Object.keys(advancedSchema.properties).length);
  expect(typeof advancedStruct.set({ [key]: value })).toEqual('undefined');
  expect(Object.keys(advancedStruct.get()[advancedSchema.id]).length).toEqual(Object.keys(advancedSchema.properties).length);
  expect(advancedStruct.isValid()).toBeTruthy();
});
