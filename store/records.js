import { observable, action, computed } from 'mobx';
import { create, persist } from 'mobx-persist';
import { AsyncStorage } from 'react-native';

class RecordStore {
    @persist('object')
    @observable
    store = [];

    currItem = {};

    TEST = true;

    @action
    addItems(items) {
        let counter = this.store.length;
        let newStore = this.store.slice(0);
        items.forEach(item => {
            let matches = newStore.filter(record => record.title === item.title);
            if (matches.length === 0) {
                item.key = counter.toString();
                item.data = null;
                item.loading = false;
                counter++;
                newStore.push(item);
            }
        });
        newStore.sort((a,b) => b.rawDate - a.rawDate);
        this.store = newStore;
    }

    @action
    setLoading(item, loading=true) {
        let index = this.store.findIndex(record => record.title === item.title);
        if (index < 0)
            return;

        let newList = this.store.slice(0);
        newList[index].loading = loading;
        this.store = newList;
    }

    @action
    setData(item, data) {
        let index = this.store.findIndex(record => record.title === item.title);
        if (index < 0)
            return;

        let newList = this.store.slice(0);
        newList[index].loading = false;
        newList[index].data = data;
        this.store = newList;
    }

    @action
    setItem(title) {
        let index = this.store.findIndex(record => record.title === title);
        if (index < 0)
            return;

        //Clears the issues with observable arrays
        this.currItem = JSON.parse(JSON.stringify(this.store[index]));
    }
}

const hydrate = create({
    storage: AsyncStorage,
    jsonify: true,
    debounce: 1000
});

const Records = new RecordStore();
export default Records;

export async function appStartup() {
    await hydrate('Record', Records);
    console.log('Rehydrated Records');
}