import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Button,
    Alert,
    StatusBar
} from 'react-native';
import BTSerial  from 'react-native-android-btserial'
import * as colours from '../colours'
import LottieView from 'lottie-react-native';

export default class Landing extends React.Component {

    static navigationOptions = {
        title: 'Welcome',
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
    }

    componentDidMount() {
        this.animation.play();
    }

    startButton() {
        BTSerial.isEnabled((err, enabled) => {
            let resultScreen = 'BlueTooth';
            if (!err && !enabled || true)
                resultScreen = 'Connect';

            this.props.navigation.navigate(resultScreen);
        });
    }

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
                        speed={3.5}
                        source={require('../anims/bike.json')}
                    />
                </View>
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>Welcome</Text>
                    <Button
                        onPress={() => this.startButton()}
                        title={'Get Started'}
                        color={colours.mainColour}/>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
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
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        width: '100%'
    },
    infoText: {
        textAlign: 'center',
        marginBottom: 30,
        fontSize: 40
    }
});
