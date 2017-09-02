import Relay from 'react-relay';
import Analyzer from './AnalyzerComponent';
import Footer from '../Footer/FooterContainer';

export default Relay.createContainer(Analyzer, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on User {
        ${Footer.getFragment('viewer')}
      }`
  }
});
