import React, { Component } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    View,
    Button,
    FlatList,
    ScrollView,
    TouchableNativeFeedback
} from 'react-native';
import BluetoothSerial  from 'react-native-bluetooth-serial'
import * as colours from '../colours'
import LottieView from 'lottie-react-native';
import BusyIndicator from 'react-native-busy-indicator';
import loaderHandler from 'react-native-busy-indicator/LoaderHandler';
import { VictoryLine, VictoryChart, VictoryTheme, VictoryLegend, VictoryAxis } from "victory-native";

type Props = {};

export default class Connect extends Component<Props> {

    static navigationOptions = {
        title: 'Read Data',
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
            xData: [[], [], [], [], []],
            yData: [[], [], [], [], []],
            zData: [[], [], [], [], []],
            recording: false
        };
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async sendLoop() {
        let response = await BluetoothSerial.readFromDevice();
        console.log(`We got ${response}`);
        setTimeout(async() => {
            let res = await BluetoothSerial.write("ping");

            await this.sendLoop();
        },5000);
    }

    startRecording = async () => {
        let res = await BluetoothSerial.write("start");
        if (res == true) {
            await this.waitTillRead();
            console.log('Recording started');
            this.setState({recording : true});
        }
    };

    stopRecording = async () => {
        let res = await BluetoothSerial.write("stop");
        if (res == true) {
            await this.waitTillRead();
            console.log('Recording stopped');
            this.setState({recording : false});
        }
    };

    getChunks = async () => {
        let res = await BluetoothSerial.write("transaction:continue");
        if (res == true) {
            let data = await this.waitTillRead();
            let dataJSON = [];
            try {
                dataJSON = JSON.parse(data);
                console.log(dataJSON);
            } catch(err) {
                return;
            }

            let xData = this.state.xData;
            let yData = this.state.yData;
            let zData = this.state.zData;

            dataJSON.forEach(item => {
                for (let i = 0; i < 5; i++) {
                    xData[i].push(item[i].x);
                    yData[i].push(item[i].y);
                    zData[i].push(item[i].z);
                }
            });
            this.setState({xData, yData, zData});
        }
    };

    getChunkNum = async () => {
        let res = await BluetoothSerial.write("transaction:init");
        if (res == true) {
            return await this.waitTillRead();
        }
    };

    getData = async () => {
        this.setState({xData: [[], [], [], [], []], yData: [[], [], [], [], []], zData: [[], [], [], [], []]});
        let chunks = await this.getChunkNum();
        console.log(chunks);
        for (let i = 0; i < chunks; i++) {
            await this.getChunks();
        }
        console.log(this.state);
    };

    waitTillRead = async () => {
        while (true) {
            await this.sleep(1000);
            let response = await BluetoothSerial.readFromDevice();

            if (response) {
                return response;
            }
        }
    };

    drawData = (data, title = "") => {
        if (!data || data[0].length <= 0)
            return null;
        else {
            return (
                <View>
                    <Text style={styles.infoText}>{title}</Text>
                    <VictoryChart theme={VictoryTheme.material} domainPadding={{ x: 20, y: [20, 100] }}>
                        <VictoryAxis offsetY={50}/>
                        <VictoryAxis dependentAxis offsetX={50} crossAxis={false}/>
                        <VictoryLegend
                                       x={90}
                                       y={50}
                                       title="Accelerometers"
                                       centerTitle
                                       orientation="horizontal"
                                       gutter={20}
                                       itemsPerRow={3}
                                       style={{ border: { stroke: "black" }, title: {fontSize: 10 } }}
                                       data={[
                                           { name: "1", symbol: { fill: "#c43a31" } },
                                           { name: "2", symbol: { fill: "#37c469" } },
                                           { name: "3", symbol: { fill: "#4879c4" } },
                                           { name: "4", symbol: { fill: "#ffce5a" } },
                                           { name: "5", symbol: { fill: "#cf3aff" } },
                                       ]}
                        />
                        <VictoryLine data={data[0]} style={{ data: { stroke: "#c43a31"}}}/>
                        <VictoryLine data={data[1]} style={{ data: { stroke: "#37c469"}}}/>
                        <VictoryLine data={data[2]} style={{ data: { stroke: "#4879c4"}}}/>
                        <VictoryLine data={data[3]} style={{ data: { stroke: "#ffce5a"}}}/>
                        <VictoryLine data={data[4]} style={{ data: { stroke: "#cf3aff"}}}/>
                    </VictoryChart>
                </View>)
        }
    };

    getInfoText = () => {
        return (
            <Text style={styles.infoText}>{this.state.recording ? 'Recording now' : 'Not recording'}</Text>
        );
    };

    render() {
        return (
            <ScrollView style={styles.container} removeClippedSubviews={true}>
                <View style={styles.infoBox}>
                    {this.getInfoText()}
                    {this.drawData(this.state.xData, 'X Data')}
                    {this.drawData(this.state.yData, 'Y Data')}
                    {this.drawData(this.state.zData, 'Z Data')}
                    <View style={styles.buttonContainer}>
                        <Button
                            onPress={this.startRecording}
                            title="Start recording"
                            color={colours.mainColour}/>
                        <Button
                            onPress={this.stopRecording}
                            title="Stop recording"
                            color={colours.mainColour}/>
                        <Button
                            onPress={this.getData}
                            title="Read from device"
                            color={colours.mainColour}/>
                    </View>
                </View>
                <BusyIndicator size={'large'} overlayHeight={150} color={colours.mainColour} overlayWidth={'auto'}/>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    },
    row: {
        height: 200,
        flexDirection: 'row'
    },
    infoText: {
        marginVertical: 15,
        fontSize: 26,
        textAlign: 'center'
    },
    buttonContainer: {
        height: 160,
        justifyContent: 'space-around'
    }
});
