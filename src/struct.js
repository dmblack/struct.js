/**
 *Returns a 'data object' 'struct' (structure) - which helps define
 the building blocks of a 'Data Object'.
 *
 * This object is a combination of jsonschema, a schema that complies to
 *  jsonschema, and then returns a mutable object.
 *
 * @param {*} dependencies
 * @returns
 */
const Struct = (dependencies) => {
  if (Object.keys(dependencies).includes('jsonschema') && Object.keys(dependencies).includes('schema')) {
    const schema = dependencies.schema;
    const validator = new dependencies.jsonschema.Validator();

    if (Object.keys(dependencies).includes('additionalSchema')) {
      if (Array.isArray(dependencies.additionalSchema)) {
        dependencies.additionalSchema.forEach((thisSchema) => {
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
    const schemaHasDefault = (keyValuePair) => {
      if (typeof keyValuePair !== 'object') {
        return false;
      }

      if (typeof (keyValuePair.default) !== 'undefined') {
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
    const schemaHasRef = (keyValuePair) => {
      if (typeof keyValuePair !== 'object') {
        return false;
      }

      if (typeof (keyValuePair['$ref']) !== 'undefined') {
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
    const isValid = (currentState) => {
      // Leverages https://github.com/tdegrunt/jsonschema/blob/master/lib/validator.js
      return validator.validate(currentState, schema);
    };

    // async function isValid (currentState) {
    //   const result = await validateWithPromise(currentState, schema);
    //   return result;
    // };

    // const validateWithPromise = (currentState) => {
    //   return new Promise((resolve, reject) => {
    //     resolve(validator.validate(currentState, schema));
    //   })
    // }

    return (state) => ({
      /**
       *describe
       *
       * @returns {object} - Schema of which this struct conforms.
       */
      describe: () => {
        // For some reason, vaildator.schemas property does not actually return the 'main' schema.
        //  Returning a new object to meet this criteria.
        const schemaIdentifier = schema.id + '#';
        return Object.assign({}, { [schemaIdentifier]: schema }, validator.schemas);
      },
      /**
       *get
       *
       * @param {string} key (Key name of property requested (null for object))
       * @returns {string object} Value of key supplied, or whole state if none.
       */
      get: (key) => {
        if (typeof key === 'undefined') {
          let schemaIdentification = schema.id;
          return { [schemaIdentification]: state };
        }

        return Object.keys(schema.properties).includes(key)
          ? state[key]
          : undefined;
      },
      /**
       *scaffold
       *
       * @returns {object} A scaffolded struct (state)
       */
      scaffold: () => {
        // const validationResult = isValid(state);

        // Scaffold out our object, comparing undefined properties with schema defaults
        //  Important it's 'undefined' properties, as we don't want false positives on
        //  genuinely invalid struct/state against schema.
        isValid(state).errors.forEach((error) => {
          // Validates base schema
          if (typeof state[error.argument] === 'undefined' && schemaHasDefault(schema.properties[error.argument])) {
            state[error.argument] = schema.properties[error.argument].default;
          }
          // Validates child schema
          if (typeof state[error.argument] === 'undefined' && schemaHasRef(schema.properties[error.argument])) {
            if (typeof validator.schemas[error.argument] !== 'undefined') {
              let newProperties = {};
              // Populate an object type..
              Object.keys(validator.schemas[error.argument].properties).forEach((key) => {
                // Now properly handles integer/number type 0
                //  which was previously a falseley failure.
                newProperties[key] = typeof validator.schemas[error.argument].properties[key].default !== 'undefined'
                  ? validator.schemas[error.argument].properties[key].default
                  : 'undefined'
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
      set: (keyValuePair) => {
        if (typeof keyValuePair !== 'object') return undefined;
        const key = Object.keys(keyValuePair)[0];

        // Catches 'false' values (Which are part of the app)
        const value = typeof keyValuePair[key] !== 'undefined'
          ? keyValuePair[key]
          : schema.properties[key].default || undefined;

        const proposedState = Object.assign({}, state, { [key]: value });

        const result = validator.validate(proposedState, schema);

        if (result.valid) {
          state[key] = value;

          return value;
        }

        return undefined;
      },
      /**
       *isValid
       *
       * @returns {boolean} true or false of valid state
       */
      isValid: () => {
        return isValid(state).valid;
      },
      /**
       *validate
       *
       * @returns {object} - validator validation object from JSONSCHEMA
       */
      validate: () => {
        return isValid(state);
      }
    });
  } else {
    return false;
  }
}

module.exports = exports = Struct;
module.exports.Struct = Struct;

export default Struct;