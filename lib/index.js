'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /**
                                                                                                                                                                                                                                                                               *Returns a 'data object' 'struct' (structure) - which helps define
                                                                                                                                                                                                                                                                               the building blocks of a 'Data Object'.
                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                               * This object is a combination of jsonschema, a schema that complies to
                                                                                                                                                                                                                                                                               *  jsonschema, and then returns a mutable object.
                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                               * @param {*} dependencies
                                                                                                                                                                                                                                                                               * @returns
                                                                                                                                                                                                                                                                               */


exports.default = function (dependencies) {
  if (Object.keys(dependencies).includes('jsonschema') && Object.keys(dependencies).includes('schema')) {
    var schema = dependencies.schema;
    var validator = new dependencies.jsonschema.Validator();

    if (Object.keys(dependencies).includes('additionalSchema')) {
      if (Array.isArray(dependencies.additionalSchema)) {
        dependencies.additionalSchema.forEach(function (thisSchema) {
          validator.addSchema(thisSchema, thisSchema.id);
        });
      } else {
        validator.addSchema(dependencies.additionalSchema, dependencies.additionalSchema.id);
      }
    }

    /**
     *schemaHasDefault
     *
     * @param {object} keyValuePair Key and Value pair of which to check
     * @returns {boolean} true if property has default
     */
    var schemaHasDefault = function schemaHasDefault(keyValuePair) {
      if ((typeof keyValuePair === 'undefined' ? 'undefined' : _typeof(keyValuePair)) !== 'object') {
        return false;
      }

      if (typeof keyValuePair.default !== 'undefined') {
        return true;
      }

      return false;
    };

    /**
     *schemaHasRef
     *
     * @param {object} keyValuePair Key and Value pair of property to check
     * @returns {boolean} true if property has a child schema ($ref)
     */
    var schemaHasRef = function schemaHasRef(keyValuePair) {
      if ((typeof keyValuePair === 'undefined' ? 'undefined' : _typeof(keyValuePair)) !== 'object') {
        return false;
      }

      if (typeof keyValuePair['$ref'] !== 'undefined') {
        return true;
      }

      return false;
    };

    /**
     *isValid
     *
     * @param {object} currentState Current STATE object
     * @returns {object} validator object
     */
    var _isValid = function _isValid(currentState) {
      return validator.validate(currentState, schema);
    };

    return function (state) {
      return {
        /**
         *describe
         *
         * @returns {object} - Schema of which this struct conforms.
         */
        describe: function describe() {
          // For some reason, vaildator.schemas property does not actually return the 'main' schema.
          //  Returning a new object to meet this criteria.
          var schemaIdentifier = schema.id + '#';
          return Object.assign({}, _defineProperty({}, schemaIdentifier, schema), validator.schemas);
        },
        /**
         *get
         *
         * @param {string} key (Key name of property requested (null for object))
         * @returns {string object} Value of key supplied, or whole state if none.
         */
        get: function get(key) {
          if (typeof key === 'undefined') {
            var schemaIdentification = schema.id;
            return _defineProperty({}, schemaIdentification, state);
          }

          return Object.keys(schema.properties).includes(key) ? state[key] : undefined;
        },
        /**
         *scaffold
         *
         * @returns {object} A scaffolded struct (state)
         */
        scaffold: function scaffold() {
          var validationResult = _isValid(state);

          // Scaffold out our object, comparing undefined properties with schema defaults
          //  Important it's 'undefined' properties, as we don't want false positives on
          //  genuinely invalid struct/state against schema.
          validationResult.errors.forEach(function (error) {
            // Validates base schema
            if (typeof state[error.argument] === 'undefined' && schemaHasDefault(schema.properties[error.argument])) {
              state[error.argument] = schema.properties[error.argument].default;
            }
            // Validates child schema
            if (typeof state[error.argument] === 'undefined' && schemaHasRef(schema.properties[error.argument])) {
              if (typeof validator.schemas[error.argument] !== 'undefined') {
                var newProperties = {};
                // Populate an object type..
                Object.keys(validator.schemas[error.argument].properties).forEach(function (key) {
                  newProperties[key] = validator.schemas[error.argument].properties[key].default || 'undefined';
                });

                state[error.argument] = newProperties;
              }
            }
          });

          return state;
        },
        /**
         *set
         *
         * @param {*} keyValuePair - Key of property, and value to set
         * @returns {object} state if successful - undefined if failed
         */
        set: function set(keyValuePair) {
          if ((typeof keyValuePair === 'undefined' ? 'undefined' : _typeof(keyValuePair)) !== 'object') return undefined;
          var key = Object.keys(keyValuePair)[0];

          // Catches 'false' values (Which are part of the app)
          var value = typeof keyValuePair[key] !== 'undefined' ? keyValuePair[key] : schema.properties[key].default || undefined;

          var proposedState = Object.assign({}, state, _defineProperty({}, key, value));

          var result = validator.validate(proposedState, schema);

          if (result.valid) {
            state[key] = value;

            return value;
          }

          return undefined;
        },
        /**
         *isValid - Returns boolean result (valid) of schema validation.
         *
         * @returns {boolean} true = valid, false = invalid
         */
        /**
         *isValid
         *
         * @returns {boolean} true or false of valid state
         */
        isValid: function isValid() {
          return _isValid(state).valid;
        },
        /**
         *validate
         *
         * @returns {object} - validator validation object from JSONSCHEMA
         */
        validate: function validate() {
          return _isValid(state);
        }
      };
    };
  } else {
    return false;
  }
};

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
