import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Button,
    Alert,
    StatusBar
} from 'react-native';
import BluetoothSerial  from 'react-native-bluetooth-serial'
import * as colours from '../colours'
import LottieView from 'lottie-react-native';

export default class Bluetooth extends React.Component {

    static navigationOptions = {
        title: 'Enable Bluetooth',
        headerStyle: {
            backgroundColor: colours.mainColour,
        },
        headerTintColor: colours.textColour,
        headerTitleStyle: {
            fontWeight: '100',
        },
    };

    constructor(props) {
        super(props);
        this.state = {
            bluetoothEnabled: false
        };
    }

    componentDidMount() {
        setTimeout(async () => {
            try {
                let bluetoothEnabled = await BluetoothSerial.isEnabled();
                this.setState({bluetoothEnabled});
            } catch (err) {
                this.setState({bluetoothEnabled : false})
            }
        },1);
        this.animation.play();
        BluetoothSerial.on('bluetoothEnabled', () => this.toConnect());
    }

    componentWillUnmount() {
        BluetoothSerial.removeListener('bluetoothEnabled', () => this.toConnect());
    }

    toConnect() {
        this.props.navigation.replace('Connect');
    }

    enableBluetooth() {
        setTimeout(async () => {
            try {
                await BluetoothSerial.enable();
            } catch (err) {
                console.log(err);
                this.setState({bluetoothEnabled : false});
                Alert.alert('Uh oh!', "We couldn't enable Bluetooth.\nPlease enable this manually .");
            }
        },1);
    };

    render() {
        return (
            <View style={styles.container}>
                <StatusBar
                    barStyle="light-content"
                    backgroundColor={colours.darkMain}
                />
                <View style={styles.animContainer}>
                    <LottieView
                        ref={animation => this.animation = animation}
                        loop={true}
                        speed={1}
                        source={require('../anims/bluetooth.json')}
                    />
                </View>
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>{this.state.bluetoothEnabled ?
                        'We now need to connect to your device' :
                        'Please turn on your bluetooth to continue'}</Text>
                    {!this.state.bluetoothEnabled && <Button
                        onPress={() => this.enableBluetooth()}
                        title={this.state.bluetoothEnabled ? 'Connect to device' : 'Enable Bluetooth'}
                        color={colours.mainColour}/>}
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        backgroundColor: '#FFF',
        width: '100%'
    },
    welcome: {
        fontSize: 18,
        textAlign: 'center',
        paddingVertical: '20%'
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
    animContainer: {
        height: 250,
        width: '100%'
    },
    infoBox: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20
    },
    infoText: {
        textAlign: 'center',
        marginBottom: 20,
        fontSize: 20
    }
});
