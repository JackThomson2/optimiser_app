import { observable, action, computed } from 'mobx';
import { create, persist } from 'mobx-persist';
import { AsyncStorage } from 'react-native';

class RecordStore {
    @persist
    @observable
    store = [];

    @action
    addItems(items) {
        let counter = this.store.length;
        items.forEach(item => {
            let matches = this.store.filter(record => record.title === item.title);
            if (matches.length === 0) {
                item.key = counter.toString();
                item.data = null;
                item.loading = false;
                counter++;
                this.store.push(item);
            }
        });
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
        console.log(data);
        this.store = newList;
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
    await hydrate('User', General);
    console.log('Rehydrated Records');
}