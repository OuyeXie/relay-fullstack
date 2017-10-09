/* eslint-disable no-unused-vars, no-use-before-define */
import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  nodeDefinitions,
  cursorForObjectInConnection
} from 'graphql-relay';

import {
  User,
  Feature,
  Property,
  getUser,
  getFeature,
  getFeatures,
  addFeature,
  getProperty
} from './database';

import { calculate, calculateBeforeYear } from './treasure';

import { prop } from '../utils/common';

/**
 * We get the node interface and field from the Relay library.
 *
 * The first method defines the way we resolve an ID to its object.
 * The second defines the way we resolve an object to its GraphQL type.
 */
const { nodeInterface, nodeField } = nodeDefinitions(
  async (globalId) => {
    const { type, id } = fromGlobalId(globalId);
    if (type === 'User') {
      return getUser(id);
    } else if (type === 'Feature') {
      return getFeature(id);
    } else if (type === 'Property') {
      return await getProperty(id);
    }
    return null;
  },
  (obj) => {
    if (obj instanceof User) {
      return userType;
    } else if (obj instanceof Feature) {
      return featureType;
    } else if (obj instanceof Property) {
      return propertyType;
    }
    return null;
  }
);

/**
 * Define your own types here
 */

const userType = new GraphQLObjectType({
  name: 'User',
  description: 'A person who uses our app',
  fields: () => ({
    id: globalIdField('User'),
    features: {
      type: featureConnection,
      description: 'Features that I have',
      args: connectionArgs,
      resolve: (_, args) => connectionFromArray(getFeatures(), args)
    },
    username: {
      type: GraphQLString,
      description: 'Users\'s username'
    },
    website: {
      type: GraphQLString,
      description: 'User\'s website'
    }
  }),
  interfaces: [nodeInterface]
});

const featureType = new GraphQLObjectType({
  name: 'Feature',
  description: 'Feature integrated in our starter kit',
  fields: () => ({
    id: globalIdField('Feature'),
    name: {
      type: GraphQLString,
      description: 'Name of the feature'
    },
    description: {
      type: GraphQLString,
      description: 'Description of the feature'
    },
    url: {
      type: GraphQLString,
      description: 'Url of the feature'
    }
  }),
  interfaces: [nodeInterface]
});

const propertyType = new GraphQLObjectType({
  name: 'Property',
  description: 'Property',
  fields: () => ({
    id: globalIdField('Property'),
    lastListedPrice: {
      type: GraphQLFloat,
      resolve: prop('lastListedPrice')
    },
    residualValue: {
      type: GraphQLFloat,
      resolve: prop('residualValue')
    },
    lastListedTime: {
      type: GraphQLString,
      resolve: prop('lastListedTime')
    },
    lastUpdatedTime: {
      type: GraphQLString,
      resolve: prop('lastUpdatedTime')
    },
    mortgage: {
      type: GraphQLFloat,
      resolve: prop('mortgage')
    },
    taxes: {
      type: GraphQLFloat,
      resolve: prop('taxes')
    },
    strataFees: {
      type: GraphQLFloat,
      resolve: prop('strataFees')
    },
    yearBuilt: {
      type: GraphQLInt,
      resolve: prop('yearBuilt')
    },
    levels: {
      type: GraphQLInt,
      resolve: prop('levels')
    },
    bedrooms: {
      type: GraphQLInt,
      resolve: prop('bedrooms')
    },
    size: {
      type: GraphQLFloat,
      resolve: prop('size')
    },
    lotSizeSqFt: {
      type: GraphQLFloat,
      resolve: prop('lotSizeSqFt')
    },
    walkscore: {
      type: GraphQLFloat,
      resolve: prop('walkscore')
    },
    daysOnMarket: {
      type: GraphQLInt,
      resolve: prop('daysOnMarket')
    },
    type: {
      type: GraphQLString,
      resolve: prop('type')
    },
    buildingType: {
      type: GraphQLString,
      resolve: prop('buildingType')
    },
    ownership: {
      type: GraphQLString,
      resolve: prop('ownership')
    },
    mls: {
      type: GraphQLString,
      resolve: prop('mls')
    },
    address: {
      type: GraphQLString,
      resolve: prop('address')
    },
    info: {
      type: GraphQLString,
      resolve: prop('info')
    },
    view: {
      type: GraphQLString,
      resolve: prop('view')
    },
    url: {
      type: GraphQLString,
      resolve: prop('url')
    },
    source: {
      type: GraphQLString,
      resolve: prop('source')
    },
    currency: {
      type: GraphQLString,
      resolve: prop('currency')
    },
    country: {
      type: GraphQLString,
      resolve: prop('country')
    },
    liked: {
      type: GraphQLBoolean,
      resolve: prop('liked')
    },
    removed: {
      type: GraphQLBoolean,
      resolve: prop('removed')
    },
    cashFlow: {
      type: GraphQLFloat,
      resolve: prop('cashFlow')
    },
    discountRate: {
      type: GraphQLFloat,
      resolve: prop('discountRate')
    },
    growthRate: {
      type: GraphQLFloat,
      resolve: prop('growthRate')
    },
    numberOfYears: {
      type: GraphQLInt,
      resolve: prop('numberOfYears')
    },
    nonOperationAssets: {
      type: GraphQLFloat,
      resolve: prop('nonOperationAssets')
    },
    presentValue: {
      type: GraphQLFloat,
      description: 'Present value of a property',
      resolve: (d) => {
        let pv = 0;
        if (d.numberOfYears && d.numberOfYears > 0) {
          pv = calculateBeforeYear(d.cashFlow, d.discountRate, d.growthRate, d.numberOfYears, d.nonOperationAssets);
        } else {
          pv = calculate(d.cashFlow, d.discountRate, d.growthRate, d.nonOperationAssets);
        }
        return pv;
      }
    },
  }),
  interfaces: [nodeInterface]
});

/**
 * Define your own connection types here
 */
const { connectionType: featureConnection, edgeType: featureEdge } = connectionDefinitions({
  name: 'Feature',
  nodeType: featureType
});

const { connectionType: propertyConnection, edgeType: propertyEdge } = connectionDefinitions({
  name: 'Property',
  nodeType: propertyType
});

/**
 * Create feature example
 */

const addFeatureMutation = mutationWithClientMutationId({
  name: 'AddFeature',
  inputFields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    description: { type: new GraphQLNonNull(GraphQLString) },
    url: { type: new GraphQLNonNull(GraphQLString) },
  },

  outputFields: {
    featureEdge: {
      type: featureEdge,
      resolve: (obj) => {
        const cursorId = cursorForObjectInConnection(getFeatures(), obj);
        return { node: obj, cursor: cursorId };
      }
    },
    viewer: {
      type: userType,
      resolve: () => getUser('1')
    }
  },

  mutateAndGetPayload: ({ name, description, url }) => addFeature(name, description, url)
});


/**
 * This is the type that will be the root of our query,
 * and the entry point into our schema.
 */
const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    node: nodeField,
    // Add your own root fields here
    viewer: {
      type: userType,
      resolve: () => getUser('1')
    },
    property: {
      type: propertyType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: async (root, { id }, context, info) => getProperty(id)
    }
  })
});

/**
 * This is the type that will be the root of our mutations,
 * and the entry point into performing writes in our schema.
 */
const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    addFeature: addFeatureMutation
    // Add your own mutations here
  })
});

/**
 * Finally, we construct our schema (whose starting query type is the query
 * type we defined above) and export it.
 */
export default new GraphQLSchema({
  query: queryType,
  mutation: mutationType
});
