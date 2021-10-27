import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        data : {
            EDIT_RIGHTS: true,
            MASTERS: [
                {
                    ID: '0',
                    NAME: "Мастер",
                    LAST_NAME: " "
                },
            ],
            ASSISTANTS: [
                {
                    ID: '0',
                    NAME: "Ассистент",
                    LAST_NAME: " "
                },
            ],
            SALONS: [
                {
                    ID: "0",
                    NAME: 'Салон'
                }
            ],
            SCHEDULE: [
                {
                    ID: "1",
                    DATE: '2010-10-26T00:00:00',
                    SALON_ID: "0",
                    ASSISTANT_ID: "0",
                    MASTER_ID: "0",
                },

            ]
        }
    },
    getters: {
        getMasterByID: state => id => {
            return state.data.MASTERS.find((el) => el.ID === id)
        },
        getAssistantByID: state => id => {
            return state.data.ASSISTANTS.find((el) => el.ID === id)
        },
        getSalonByID: state => id => {
            return state.data.SALONS.find((el) => el.ID === id)
        },
        getFreeAssistant: state => date => {
            return state.data.ASSISTANTS.filter((el) => !state.data.SCHEDULE.find((rec) => {
                return el.ID === rec.ASSISTANT_ID
                    && rec.StartTime.getDate() === date.getDate()
                    && rec.StartTime.getMonth() === date.getMonth()
                    && rec.StartTime.getYear() === date.getYear()
            }))
        },
        getFreeSalons: state => date => {
            return state.data.SALONS.filter((el) => !state.data.SCHEDULE.find((rec) => {
                return el.ID === rec.SALON_ID
                    && rec.StartTime.getDate() === date.getDate()
                    && rec.StartTime.getMonth() === date.getMonth()
                    && rec.StartTime.getYear() === date.getYear()
            }))
        }
    },
    mutations: {
        setData(state, data) {
            state.data = data;
        },
        addElem(state, data) {
            state.data.SCHEDULE.push(data);
        },
        deleteElem(state, id) {
            state.data.SCHEDULE.splice(state.data.SCHEDULE.indexOf(state.data.SCHEDULE.find((el) => el.ID === id)), 1);
        }
    },
    actions: {
        async deleteEvent(context, id) {
            return Vue.prototype.$axios
                .post('/?controller=workschedule&method=add', id)
                .then((response) => {
                    if (response.data) {
                        return true
                    } else {
                        return false;
                    }
                })
                .catch((error) => {
                    throw new Error("action fetchPreFormData " + error);
                });

        },
        async addEvent(context, payload) {
            return Vue.prototype.$axios
                .post('/?controller=workschedule&method=add', payload)
                .then((response) => {
                    if (response.data) {
                        // return Math.floor(Math.random() * 1000)
                        return response.data;
                    } else {
                        return false;
                    }
                })
                .catch((error) => {
                    throw new Error("action fetchPreFormData " + error);
                });

        },
        async  updateEvent(context, payload) {
            return Vue.prototype.$axios
                .post('/?controller=workschedule&method=update', payload)
                .then((response) => {
                    if (response.data) {
                        return true;
                    } else {
                        return false;
                    }
                })
                .catch((error) => {
                    throw new Error("action fetchPreFormData " + error);
                });
        },
        async fetchData(context) {
            return Vue.prototype.$axios
                .post('/?controller=workschedule&method=fetchData')
                .then((response) => {
                    if (response.data) {
                        let data = response.data;
                        data.SCHEDULE.forEach((record) => {
                                let masterIndex = data.MASTERS.indexOf(data.MASTERS.find((el) => el.ID === record.MASTER_ID))
                                let hours = Math.floor(masterIndex / 60);
                                let minutes = masterIndex % 60;
                                let startDate = new Date(record.DATE);
                                startDate.setHours(hours);
                                startDate.setMinutes(minutes);
                                record.StartTime = startDate
                                record.EndTime = new Date(startDate.getTime() + 60000);
                                record.Subject = record.DATE
                                record.Id = record.ID
                            }
                        )
                        context.commit("setData", data);
                        return true;
                    } else {
                        return false;
                    }
                })
                .catch((error) => {
                  let  data = {
                        EDIT_RIGHTS: true,
                            MASTERS: [
                            {
                                AVATAR: "https://avatars0.githubusercontent.com/u/9064066?v=4&s=460",
                                ID: '0',
                                NAME: "Мастер",
                                LAST_NAME: " "
                            },
                        ],
                            ASSISTANTS: [
                            {
                                ID: '0',
                                NAME: "Ассистент",
                                LAST_NAME: " "
                            },
                        ],
                            SALONS: [
                            {
                                ID: "0",
                                NAME: 'Салон'
                            }
                        ],
                            SCHEDULE: [
                            {
                                ID: "1",
                                DATE: '2010-10-26T00:00:00',
                                SALON_ID: "0",
                                ASSISTANT_ID: "0",
                                MASTER_ID: "0",
                            },

                        ]
                    }
                    context.commit("setData", data);
                    return true;

                });


        }


    },
})
