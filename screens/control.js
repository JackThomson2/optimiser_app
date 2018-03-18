import React, { Component } from 'react';
import {
    ActivityIndicator,
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
import {observer} from 'mobx-react/native';
import Records from '../store/records';
import Icon from 'react-native-vector-icons/MaterialIcons';

type Props = {};

@observer
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
        setTimeout(async () => this.getAllData(), 500);
        BluetoothSerial.on('read', (data) => console.log(`Data ${data}`));
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async getAllData() {
        let res = await BluetoothSerial.write("transaction:list");
        if (res == true) {
            try {
                let response = await BluetoothSerial.readFromDevice();
                let names = JSON.parse(response);
                let fileNames = [];

                names.forEach(name => {
                    let dateStr = name.substring(0, name.length - 5);
                    let rawDate = parseInt(dateStr);
                    let date = new Date(rawDate);
                    let record = {
                        title: name,
                        date,
                        rawDate
                    };
                    fileNames.push(record)
                });
                Records.addItems(fileNames);
            } catch(err) {
                setTimeout(async () => await this.getAllData(),300);
            }
        }
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
        return;
        let res = await BluetoothSerial.write("transaction:start");
        if (res == true) {
            await this.waitTillRead();
            console.log('Recording started');
            this.setState({recording : true});
        }
    };

    stopRecording = async () => {
        let res = await BluetoothSerial.write("transaction:stop");
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

    async initWithFile(file) {
        let size = null;
        while(!Number.isInteger(size)) {
            await this.sleep(500);
            let request = 'transaction:init:filename:' + file.title + ',';
            let res = await BluetoothSerial.write(request);
            if (res == true) {
                size = parseInt(await this.waitTillRead());
            }
        }
        return size;
    }

    async getFilesData(file, range) {
        let data = {xData: [[], [], [], [], []], yData: [[], [], [], [], []], zData: [[], [], [], [], []]};

        return await this.dataRecursion(file, data, 0, range);
    }

    async dataRecursion(file, data, curr, range) {
        if (curr > range)
            return data;

        await this.sleep(50);

        let request = 'transaction:request:filename:' + file.title + ',chunk:' + curr + ',';
        let res = await BluetoothSerial.write(request);
        if (!res)
            return await this.dataRecursion(file,data,curr,range);

        let req = await this.waitTillRead();
        let dataJSON = [];
        try {
            dataJSON = JSON.parse(req);
            if (!Array.isArray(dataJSON)) {
                await this.sleep(300);
                return await this.dataRecursion(file, data, curr, range);
            }
        } catch(err) {
            console.log("Error retrying");
            await this.sleep(300);
            return await this.dataRecursion(file,data,curr,range);
        }
        dataJSON.forEach(item => {
            for (let i = 0; i < 5; i++) {
                data.xData[i].push(item[i].x);
                data.yData[i].push(item[i].y);
                data.zData[i].push(item[i].z);
            }
        });

        return await this.dataRecursion(file, data, curr + 1, range);
    }

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

    getInfoText = () => {
        return (
            <Text style={styles.infoText}>{this.state.recording ? 'Recording now' : 'Not recording'}</Text>
        );
    };

    renderItem(item) {
        return (
            <TouchableNativeFeedback onPress={() => this.itemPressed(item)}>
                <View style={styles.listItem}>
                    <Text>Recording from</Text>
                    <Text>{item.date.toString()}</Text>
                    <View style={styles.notifier}>
                        {item.loading === true ? <ActivityIndicator
                                animating={true} size="small" color={colours.mainColour} /> :
                            <Icon name={item.data === null ? "file-download" : "check"} size={25} color={colours.mainColour}/>}
                    </View>
                </View>
            </TouchableNativeFeedback>
        )
    }

    async itemPressed(record) {
        if (!record.data) {
            Records.setLoading(record, true);

            let size = await this.initWithFile(record);
            let data = await this.getFilesData(record, size);

            Records.setData(record, data);
        } else {
            console.log(record.data);
        }

        Records.setItem(record.title);
        this.props.navigation.navigate('Viewer');
    }

    render() {
        return (
            <View style={styles.container}>
                    <Text style={styles.welcome}>Past Recordings</Text>
                    <FlatList
                        data={Records.store}
                        renderItem={({item}) => this.renderItem(item)}
                    />
                    <Button
                        onPress={this.startRecording}
                        title="Start recording"
                        color={colours.mainColour}/>
                <BusyIndicator size={'large'} overlayHeight={150} color={colours.mainColour} overlayWidth={'auto'}/>
            </View>
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
    },
    listItem: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#FAFAFA',
        marginTop: 1,
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
    },
    notifier: {
        position: 'absolute',
        top: 20,
        right: 10,
    }
});
