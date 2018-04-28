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
import Modal from "react-native-modal";

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
        isVisible: false,
        recording: false,
        record: true,
        size: 0,
        count: 0
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
        this.modalContent = this.modalContent.bind(this);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async getAllData() {
        let res = await BluetoothSerial.write("transaction:list");
        if (res == true) {
            try {
                await this.sleep(300);
                let response = await BluetoothSerial.readFromDevice();
                console.log(response);
                let names = JSON.parse(response);
                console.log(names);
                let fileNames = [];

                names.forEach(name => {
                    let rawDate = parseInt(name);
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
                console.log(err);
                setTimeout(async () => await this.getAllData(),300);
            }
        }
    }

    async toggleRecording() {
        let message = "transaction:";
        message += this.state.recording === true ? 'stop' : 'start';
        let res = await BluetoothSerial.write(message);
        if (res == true) {
            let res = await this.waitTillRead();
            console.log(`Recording started, result ${res}`);
            if (this.state.recording === true)
                setTimeout(async () => this.getAllData(), 300);
            this.setState({recording : !this.state.recording, isVisible: !this.state.recording});
        }
    };

    async initWithFile(file) {
        let size = null;
        let data = null;
        try {
            let request = 'transaction:init:filename:' + file.title + ',';
            let res = await BluetoothSerial.write(request);
            if (res == true) {
                data = await this.waitTillRead();
                let res = JSON.parse(data);
                console.log(res);
                return this.dataProcess(res);
            }
        } catch (err) {
            console.log(`Error ${err} retrying data is ${data}`);
            return await this.initWithFile(file);
        }
        return size;
    }

    dataProcess(dataJSON) {
        let data = {xData: [[], [], [], [], []], yData: [[], [], [], [], []], zData: [[], [], [], [], []]};

        for (let i = 0; i < 4; i++) {
            let toRead = dataJSON[i.toString()][1];
            let size = toRead.x.length;

            for (let x = 0; x < size; x++) {
                let xData = {y : toRead.x[x], x : x};
                let yData = {y : toRead.y[x], x : x};
                let zData = {y : toRead.z[x], x : x};

                data.xData[i].push(xData);
                data.yData[i].push(yData);
                data.zData[i].push(zData);
            }
        }

        return data;
    }

    waitTillRead = async () => {
        await BluetoothSerial.clear();
        let available = 0;
        while (true) {
            await this.sleep(100);
            let nowAvailable = await BluetoothSerial.available();

            if (available === nowAvailable && nowAvailable > 0) {
                let response = await BluetoothSerial.readFromDevice();
                return response;
            }
            available = nowAvailable;
        }
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

    modalContent() {
        if (this.state.record === false) {
            return (
              <View style={styles.modalContainer}>
                  <ActivityIndicator
                      animating={true} size="large" color={colours.mainColour} />
                  {(this.state.size > 0) && <Text>{this.state.count}/{this.state.size + 1}</Text>}
                  <Text>Loading data</Text>
                  <Button
                      onPress={() => this.toggleVisible()}
                      title={'Close'}
                      color={colours.mainColour}/>
              </View>
            );
        } else {
            return (
              <View style={styles.modalContainer}>
                  <Text style={styles.controlText}>Control Device</Text>
                  <Button
                      onPress={() => this.toggleRecording()}
                      title={this.state.recording ? 'Stop Recording' : 'Start recording'}
                      color={colours.mainColour}/>
                  <View style={styles.spacer}/>
                  <Button
                      onPress={() => this.toggleVisible()}
                      title={'Close'}
                      color={colours.mainColour}/>
              </View>
            );
        }
    };

    toggleVisible()  {
        this.setState({isVisible : !this.state.isVisible});
    };

    async itemPressed(record) {
        if (!record.data) {
            this.setState({record : false, isVisible: true, size: 0, count: 0});
            Records.setLoading(record, true);

            let data = await this.initWithFile(record);

            Records.setData(record, data);
        } else {
            console.log(record.data);
        }

        this.setState({record : false, isVisible: false, size: 0, count: 0});
        Records.setItem(record.title);
        this.props.navigation.navigate('Viewer');
    }

    openRecord() {
        this.setState({record : true, isVisible: true});
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
                        onPress={() => this.openRecord()}
                        title="Start recording"
                        color={colours.mainColour}/>
                    <Modal isVisible={this.state.isVisible} useNativeDriver={true}>
                        {this.modalContent()}
                    </Modal>
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
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        width: '100%',
        paddingVertical: 40,
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    controlText: {
        fontSize: 25,
        marginBottom: 30
    },
    spacer: {
        height: 20,
    }
});
