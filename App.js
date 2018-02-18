import React, { Component } from 'react';
import { StackNavigator } from 'react-navigation';

import Landing from './screens/landing';
import Connect from './screens/connect';

const RootStack = StackNavigator(
    {
        Landing: {
            screen: Landing,
        },
        Connect: {
            screen: Connect
        }
    },
    {
        initialRouteName: 'Connect',
    }
);

export default class App extends Component<Props> {
  render() {
      return <RootStack />;
  }
}