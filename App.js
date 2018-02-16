import React, { Component } from 'react';
import { StackNavigator } from 'react-navigation';

import Landing from './screens/landing';

const RootStack = StackNavigator(
    {
        Landing: {
            screen: Landing,
        },
    },
    {
        initialRouteName: 'Landing',
    }
);

export default class App extends Component<Props> {
  render() {
      return <RootStack />;
  }
}