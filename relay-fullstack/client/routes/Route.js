import React from 'react';
import { IndexRoute, Route, Redirect } from 'react-router';

import ViewerQuery from './ViewerQuery';
import PropertyQuery from './PropertyQuery';
import AppContainer from '../components/App/AppContainer';
import AnalyzerContainer from '../components/Analyzer/AnalyzerContainer';
import PropertyContainer from '../components/Property/PropertyContainer';
import PropertiesContainer from '../components/Property/PropertiesContainer';
import FeatureContainer from '../components/Feature/FeatureContainer';
import SignupComponent from '../components/Signup/SignupComponent';
import LoginComponent from '../components/Login/LoginComponent';

export default (
  <Route path='/' component={AppContainer} queries={ViewerQuery}>
    <IndexRoute component={AnalyzerContainer} queries={ViewerQuery} />
    <Route path='/property/:id' component={PropertyContainer} queries={PropertyQuery} />
    <Route path='/property' component={PropertiesContainer} queries={ViewerQuery} />
    <Route path='/feature' component={FeatureContainer} queries={ViewerQuery} />
    <Route path='/signup' component={SignupComponent} />
    <Route path='/login' component={LoginComponent} />
    <Redirect from='*' to='/' />
  </Route>
);

