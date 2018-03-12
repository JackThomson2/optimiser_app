import React, { Component } from 'react';
import { StackNavigator } from 'react-navigation';

import Landing from './screens/landing';
import BlueTooth from './screens/bluetooth';
import Connect from './screens/connect';
import Control from './screens/control';

const RootStack = StackNavigator(
    {
        Landing: {
            screen: Landing
        },
        BlueTooth: {
            screen: BlueTooth
        },
        Connect: {
            screen: Connect
        },
        Control: {
            screen: Control
        }
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