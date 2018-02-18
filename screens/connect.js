import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Button
} from 'react-native';
import BTSerial  from 'react-native-android-btserial'

type Props = {};

export default class Connect extends Component<Props> {

    constructor(props) {
        super(props);
        this.state = {
            bluetoothEnabled: false
        };
    }

    findItems() {
        BTSerial.listDevices((err, devices) => {
            if (err)
                return;

            console.log(devices);

            let pi = devices.find((device) => {
                return device.name === "raspberrypi"
            });

            console.log(pi);

            BTSerial.connect(address, function (err, status, deviceName) {
                // callback
            })
        })
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>
                    Suspension Optimiser
                </Text>
                <Button
                    onPress={() => this.findItems()}
                    title="Find our device"
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 18,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
});
