import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView
} from 'react-native';
import * as colours from '../colours'
import Records from '../store/records';
import { VictoryLine, VictoryChart, VictoryTheme, VictoryLegend, VictoryAxis } from "victory-native";
import {observer} from "mobx-react/native";

@observer
export default class DataView extends React.Component {

    static navigationOptions = {
        title: 'Data View',
        headerStyle: {
            backgroundColor: colours.mainColour,
        },
        headerTintColor: colours.textColour,
        headerTitleStyle: {
            fontWeight: '100',
        },
    };

    drawData = (data, title = "") => {
        console.log(data);
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
                        <VictoryLine data={data[0]} style={{ data: { stroke: "#c43a31" } }}/>
                        <VictoryLine data={data[1]} style={{ data: { stroke: "#37c469" } }}/>
                        <VictoryLine data={data[2]} style={{ data: { stroke: "#4879c4" } }}/>
                        <VictoryLine data={data[3]} style={{ data: { stroke: "#ffce5a" } }}/>
                        <VictoryLine data={data[4]} style={{ data: { stroke: "#cf3aff" } }}/>
                    </VictoryChart>
                </View>)
        }
    };

    render() {
        console.log(Records.currItem);
        return (
            <ScrollView style={styles.scrollContainer}>
                <View style={styles.container}>
                    {this.drawData(Records.currItem.data.xData, 'X Data')}
                    {this.drawData(Records.currItem.data.yData, 'Y Data')}
                    {this.drawData(Records.currItem.data.zData, 'Z Data')}
                </View>
            </ScrollView>
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
    scrollContainer: {
      flex: 1,
      width: '100%'
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
