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
export default function (dependencies) {
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

    const schemaHasDefault = (object) => {
      if (typeof object !== 'object') {
        return false;
      }

      if (typeof (object.default) !== 'undefined') {
        return true;
      }

      return false;
    };

    const isValid = (currentState) => {
      return validator.validate(currentState, schema);
    };

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
      // Should re-write to include ANY undefined structure to defaults.
      scaffold: () => {
        const validationResult = isValid(state);

        // Scaffold out our object, comparing undefined properties with schema defaults
        //  Important it's 'undefined' properties, as we don't want false positives on
        //  genuinely invalid struct/state against schema.
        validationResult.errors.forEach((error) => {
          if (typeof state[error.argument] === 'undefined' && schemaHasDefault(schema.properties[error.argument])) {
            state[error.argument] = schema.properties[error.argument].default;
          }
        });

        return state;
      },
      /**
       *set
       *
       * @param {object} keyValuePair - Key and value pair of change
       * @returns {string undefined} Value if success, or undefined if none.
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
          // Update our meta stat (if it exists).
          //  This is a bit of a conditional hell - need better way...
          //  Maybe some kind of middleware like wrapper that detects
          //  state change and updates meta if relevant? Hmmmmmmmmmmmm
          if (state['/Meta'] && state['/Meta'].stat && state['/Meta'].stat.updated_at) {
            state['/Meta'].stat.updated_at = new Date().toISOString();
          }
          return value;
        } else {
          return undefined;
        }
      },
      /**
       *isValid - Returns boolean result (valid) of schema validation.
       *
       * @returns {boolean} true = valid, false = invalid
       */
      isValid: () => {
        return isValid(state).valid;
      },
      /**
       *validate
       *autoDefaults
       * @returns {boolean} - True or false if struct conforms to schema
       */
      validate: () => {
        return isValid(state);
      }
    });
  } else {
    return false;
  }
}
