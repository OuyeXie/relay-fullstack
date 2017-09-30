import Relay from 'react-relay';
import Property from './PropertyComponent';

export default Relay.createContainer(Property, {
  fragments: {
    property: () => Relay.QL`
      fragment on Property {
        id
        cashFlow
        discountRate
        growthRate
        numberOfYears
        nonOperationAssets
        presentValue
      }`
  }
});
