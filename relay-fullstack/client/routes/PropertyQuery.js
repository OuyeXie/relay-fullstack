import Relay from 'react-relay';

export default {
  property: () => Relay.QL`
      query {
        property(id: $id)
      }
    `
};
