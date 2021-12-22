import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        head: [],
        salon: '',
        data: []
    },
    getters: {
        getHeadElem: state => indate => {


            return state.head.filter((el) => {
                let date2 = new Date(indate);
                let date = new Date(el.date);
                return date.getDate() === date2.getDate() &&
                    date.getFullYear() === date2.getFullYear() &&
                    date.getMonth() === date2.getMonth()
            });
        },
        getPromiseEvents: state => () => {
            return new Promise((resolve) => resolve(state.data));
        },

    },
    mutations: {
        setSalon(state, data) {
            state.salon = data;
        },
        setEvents(state, data) {
            state.data = data;
        },
        setHead(state, data) {
            state.head = data;
        },
        addEvent(state, data) {
            state.data.push(data);
        },


        deleteElem(state, id) {
            state.data.splice(state.data.indexOf(state.data.find((el) => el.ID === id)), 1);
        }
    },
    actions: {

        async fetchEvents(context, payload) {
            return Vue.prototype.$axios
                .post(window.serverUrl + 'ajax/?controller=GroomingCalendar&action=getCalendarEvents&ishook=y', payload)
                .then((response) => {
                    if (response.data) {
                        let data = response.data;

                        data.forEach((record) => {
                                record.StartTime = new Date(record.start);
                                record.EndTime = new Date(record.finish);
                                record.Subject = record.service
                                record.Id = record.id
                            }
                        )

                        context.commit("setEvents", data);
                        return true;
                    } else {
                        return false;
                    }
                })
                .catch((error) => {
                    console.log(error)
                });
        },
        async fetchHead(context, payload) {

            return Vue.prototype.$axios
                .post(window.serverUrl + 'ajax/?controller=GroomingCalendar&action=fetchheaderData&ishook=y', payload)
                .then((response) => {
                    if (response.data) {
                        context.commit("setHead", response.data);
                        return true
                    }
                })
                .catch((error) => {
                    console.log(error)
                });


        },
        async fetchInitData(context) {
            return Vue.prototype.$axios
                .post(window.serverUrl + 'ajax/?controller=GroomingCalendar&action=fetchInitData&ishook=y')
                .then((response) => {
                    if (response.data) {
                        return response.data;

                    } else {
                        return false;
                    }
                })
                .catch((error) => {
                    console.log(error)
                });


        }


    },
})
