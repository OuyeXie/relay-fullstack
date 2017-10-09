import Relay from 'react-relay';
import Properties from './PropertiesComponent';

export default Relay.createContainer(Properties, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on User {
        id,
        properties(first: 20) {
          edges {
            node {
              id
              info
              url
            }
          }
        }
      }`
  }
});
