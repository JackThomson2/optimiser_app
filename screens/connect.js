import React, { Component } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    View,
    Button,
    FlatList,
    TouchableNativeFeedback,
    ActivityIndicator
} from 'react-native';
import BluetoothSerial  from 'react-native-bluetooth-serial'
import * as colours from '../colours'
import LottieView from 'lottie-react-native';
import BusyIndicator from 'react-native-busy-indicator';
import loaderHandler from 'react-native-busy-indicator/LoaderHandler';

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
            bluetoothEnabled: false,
            devices: []
        };
    }

    componentDidMount() {
        this.animation.play();
        setTimeout(() => this.findItems(),50);
    }

    findItems() {
        console.log('Finding items');
        setTimeout(async () => {
            try {
                let devices = await BluetoothSerial.list();

                let cntr = 0;
                let list = [];

                devices.forEach(device => {
                    device.key = cntr.toString();
                    cntr++;
                    list.push(device)
                });


                console.log(list);

                this.setState({devices: list})
            } catch(err) {
                console.log(err);
            }
        });
    }

    discoverDevices() {
        loaderHandler.showLoader('Searching for items...');
        setTimeout(async () => {
            try {
                let devices = await BluetoothSerial.discoverUnpairedDevices();

                console.log(devices);

                let list = this.state.devices;
                let cntr = list.length;

                devices.forEach(device => {
                    device.key = cntr.toString();
                    cntr++;
                    list.push(device)
                });

                this.setState({devices: list});

                loaderHandler.hideLoader();
            } catch(err) {
                console.log(err);
                loaderHandler.hideLoader();
            }
        },1);
    }

    itemPressed(item) {
        loaderHandler.showLoader('Connecting to item...');
        setTimeout(async () => {
            try {
                let res = await BluetoothSerial.connect(item.id);
                loaderHandler.hideLoader();

                this.props.navigation.navigate('Control');
            } catch (err) {
                console.log(err);
                loaderHandler.hideLoader();
                Alert.alert('Uh oh', 'Could not connect to your device');
            }
        },1);
    }

    renderItem(item) {
        return (
            <TouchableNativeFeedback onPress={() => this.itemPressed(item)}>
                <View style={styles.listItem}>
                    <Text>{item.name}</Text>
                    <Text>{item.address}</Text>
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
                        onPress={() => this.discoverDevices()}
                        title="Search for new devices"
                        color={colours.mainColour}/>
                    <Text style={styles.welcome}>
                        Select your device from this list
                    </Text>
                </View>
                <FlatList
                    data={this.state.devices}
                    renderItem={({item}) => this.renderItem(item)}
                />
                <BusyIndicator size={'large'} overlayHeight={150} color={colours.mainColour} overlayWidth={'auto'}/>
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
        height: 150,
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
