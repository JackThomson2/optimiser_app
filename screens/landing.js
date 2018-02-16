import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View
} from 'react-native';
import BTSerial  from 'react-native-android-btserial'

type Props = {};

export default class Landing extends Component<Props> {

    constructor(props) {
        super(props);
        this.state = {
            bluetoothEnabled: false
        };
    }

    componentDidMount() {
        BTSerial.isEnabled((err, enabled) => {
            // enabled is true/false
            console.log('Bluetooth is enabled {enabled}');
            console.log(err);
            if (err)
                return;
            console.log(enabled);
            this.setState({bluetoothEnabled: enabled});
        })
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>
                    Suspension Optimiser
                </Text>
                <Text>Bluetooth enabled {this.state.bluetoothEnabled}</Text>
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
