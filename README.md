# struct.js
Structure, Struct, or 'struct.js' is designed to help define, from
design; structured data.

# Description
Avoiding adding a personal, or otherwise opinionated, method of
implementation; struct uses jsonschema.

The goal of the project is to provide a simple, logical, implementation
of my structures in JavaScript. 

Upon defining a jsonschema compliant schema object, you can use struct
to; define, and maintain, your objects.

# Dependencies (User Injected)
* [jsonschema](https://www.npmjs.com/package/jsonschema)

IMPORTANT:
I've chosen to not include any dependencies by default in this project,
though the actual library itself requires jsonschema. Instead; I have
been using a 'personal?' method of implementation, likely incorrectly
referred to as injection. 

You must ensure you manually import, then inject at definition, the
jsonschema object.

# Development Dependencies
* babel-cli
* babel-core
* babel-jest
* babel-preset-env
* cross-env
* eslint
* jest
* jsonschema (TESTS - Please ensure you read as above)

# Contributions
Are welcome.

I personally prefer the semistandard coding requirement (';'). It's hot
topic at times. There were very specific conditions in which the ';'
alone were NOT optional, however; none to the contrary.

**Insert example here.. when I find it again.. Used to be on standard.js
homepage**

# How To
## Install
Due to name conflicts, I have not been able to publish this package to 
npm.

The remaining method is to include the package from github. I understand
if you chose not to use this module for that very reason - however; This
module was born out of need due to work on another project. The parent
project has my attention at the moment.

`$ npm install https://github.com/dmblack/struct.js.git`

## Include in your project
`import { struct } from struct.js;`

## Basic Use
Ensure you have your jsonschema installed, and imported;

`$ npm install jsonschema`

`import { jsonschema } from jsonschema;`

Define one, or more, jsonschema compliant schema.
```js
const schema = {
  "id": "/TestSchema",
  "type": "object",
  "additionalProperties": true,
  "properties": {
    "array": { "default": [1, 2, 3, 4], "type": "array" },
    "boolean": { "default": true, "type": "boolean" },
    "date": { "default": new Date().toISOString(), "type": "string", "format": "date-time" },
    "integer": { "default": 0, "type": "integer" },
    "string": { "default": "abc", "type": "string" }
  },
  "required": ["array", "boolean", "date", "integer", "string"]
};
```

Create a factory that allows building structures.
```js
const structure = struct(Object.assign({}, { 'jsonschema': jsonschema }, { 'schema': schema }));
```

**Due to changes in deployment method, naming conflicts on npm, my setup
procedure may be minorly incomplete. Reasons, again; explained above.**
