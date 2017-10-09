import Relay from 'react-relay';
import Property from './PropertyComponent';

export default Relay.createContainer(Property, {
  fragments: {
    property: () => Relay.QL`
      fragment on Property {
        id
        lastListedPrice
        residualValue
        lastListedTime
        lastUpdatedTime
        mortgage
        taxes
        strataFees
        yearBuilt
        levels
        bedrooms
        size
        lotSizeSqFt
        walkscore
        daysOnMarket
        type
        buildingType
        ownership
        mls
        address
        info
        view
        url
        source
        currency
        country
        liked
        removed
        cashFlow
        discountRate
        growthRate
        numberOfYears
        nonOperationAssets
        presentValue
      }`
  }
});
