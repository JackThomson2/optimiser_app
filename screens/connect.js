import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Button,
    FlatList,
    TouchableNativeFeedback
} from 'react-native';
import BTSerial  from 'react-native-android-btserial'
import * as colours from '../colours'
import LottieView from 'lottie-react-native';

type Props = {};

export default class Connect extends Component<Props> {

    static navigationOptions = {
        title: 'Find our device',
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
        this.animation.play();
    }

    findItems() {
        console.log('Finding items');
        BTSerial.listDevices((err, devices) => {
            if (err) {
                console.log(err);
                return;
            }

            BTSerial.connect(address, function (err, status, deviceName) {
                // callback
            })
        })
    }

    renderItem(item) {
        return (
            <TouchableNativeFeedback>
                <View style={styles.listItem}>
                    <Text>{item.key}</Text>
                </View>
            </TouchableNativeFeedback>
        )
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.animContainer}>
                    <LottieView
                        ref={animation => this.animation = animation}
                        loop={true}
                        speed={1}
                        source={require('../anims/search.json')}
                    />
                </View>
                <View style={styles.infoBox}>
                    <Button
                        onPress={() => this.findItems()}
                        title="Search for new devices"
                        color={colours.mainColour}/>
                    <Text style={styles.welcome}>
                        Select your device from this list
                    </Text>
                </View>
                <FlatList
                    data={[{key: 'a'}, {key: 'b'}]}
                    renderItem={({item}) => this.renderItem(item)}
                />
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
    },
    welcome: {
        fontSize: 18,
        textAlign: 'center',
        margin: 10,
        marginVertical: 30
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
        width: '100%',
        paddingHorizontal: 20
    },
    listItem: {
        paddingHorizontal: 20,
        paddingVertical: 10
    }
});
