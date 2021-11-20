import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        data: {
            EDIT_RIGHTS: true,
            MASTERS: [
                {
                    ID: '0',
                    NAME: "Мастер 1",
                    LAST_NAME: " "
                },
            ],
            ASSISTANTS: [
                {
                    ID: '0',
                    NAME: "Помощник",
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
                    SERVICE_ID: "0",
                    MASTER_ID: "0",
                },

            ]
        }
    },
    getters: {
        getMasterByID: state => id => {
            return state.data.MASTERS.find((el) => el.ID == id)
        },
        getClientByID: state => id => {
            let assist = state.data.CLIENTS.find((el) => el.ID == id);

            return assist;
        },
        getServiceByID: state => id => {
            let assist = state.data.SERVICES.find((el) => el.ID == id);
            return assist;
        },
        getSalonByID: state => id => {
            return state.data.SALONS.find((el) => el.ID == id)
        },
        getFreeAssistant: state => date => {
            return state.data.ASSISTANTS.filter((el) => !state.data.SCHEDULE.find((rec) => {
                return el.ID == rec.SERVICE_ID
                    && rec.StartTime.getDate() === date.getDate()
                    && rec.StartTime.getMonth() === date.getMonth()
                    && rec.StartTime.getYear() === date.getYear()
            }))
        },
        getFreeSalons: state => date => {
            return state.data.SALONS.filter((el) => {
                    return (Number.parseInt(el.MASTERS_COUNT_VALUE) - state.data.SCHEDULE.filter((rec) => {
                        return el.ID == rec.SALON_ID
                            && rec.StartTime.getDate() === date.getDate()
                            && rec.StartTime.getMonth() === date.getMonth()
                            && rec.StartTime.getYear() === date.getYear()
                    }).length > 0)

                }
            )

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
                .post('/ajax/?controller=workschedule&action=delete&ishook=y', {ID: id})
                .then((response) => {
                    return !!response.data;
                })
                .catch((error) => {
                    throw new Error("action fetchPreFormData " + error);
                });

        },
        async addEvent(context, payload) {

            return Vue.prototype.$axios
                .post('/ajax/?controller=workschedule&action=add&ishook=y', payload)
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
        async updateEvent(context, payload) {
            return Vue.prototype.$axios
                .post('/ajax/?controller=workschedule&action=update&ishook=y', payload)
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
            let data = {
                EDIT_RIGHTS: true,
                MASTERS: [
                    {
                        COLOR: 'yellow',
                        AVATAR: "https://avatars0.githubusercontent.com/u/9064066?v=4&s=460",
                        ID: '1',
                        NAME: "Мастер 1",
                        LAST_NAME: " "
                    }, {
                          COLOR: "#7ffa19",
                        AVATAR: "https://avatars0.githubusercontent.com/u/9064066?v=4&s=460",
                        ID: '2',
                        NAME: "Мастер 2",
                        LAST_NAME: " "
                    }, {
                        COLOR: "#12dbfc",
                        AVATAR: "https://avatars0.githubusercontent.com/u/9064066?v=4&s=460",
                        ID: '3',
                        NAME: "Мастер 3",
                        LAST_NAME: " "
                    },
                ],
                ASSISTANTS: [
                    {
                        ID: '3',
                        NAME: "Пудель",
                        LAST_NAME: " "
                    },
                ],
                SERVICES: [
                    {
                        ID: '3',
                        NAME: "Стрижка кошки налысо",
                    },
                    {
                        ID: '2',
                        NAME: "Стрижка пуделя",
                    },
                    {
                        ID: '4',
                        NAME: "Стрижка сербернара",
                    },
                ],

                SCHEDULE: [
                    {
                        ID: "1",
                        START: '2021-11-19T12:00:00',
                        END: '2021-11-19T12:50:00',
                        SERVICE_ID: "2",
                        MASTER_ID: "1",
                        CLIENT: "Сергей",
                        PET: "Артемон",
                    },
                    {
                        ID: "2",
                        START: '2021-11-18T13:00:00',
                        END: '2021-11-18T15:00:00',
                        SERVICE_ID: "3",
                        MASTER_ID: "2",
                        CLIENT: "Татьяна",
                        PET: "Тузик",
                    },
                    {
                        ID: "30",
                        START: '2021-11-17T11:00:00',
                        END: '2021-11-17T13:00:00',
                        SERVICE_ID: "4",
                        MASTER_ID: "3",
                        CLIENT: "Василий",
                        PET: "Бобик",
                    },

                ]
            }

            data.ASSISTANTS.push({
                ID: '0',
                NAME: "Без помощника",
                LAST_NAME: ""
            })
            data.SCHEDULE.forEach((record) => {

                    let startDate = new Date(record.START);
                    record.StartTime = startDate
                    record.EndTime = new Date(record.END);
                    record.Subject = record.DATE
                    record.Id = record.ID
                    record.SERVICE_ID = record.SERVICE_ID ? record.SERVICE_ID : "";
                }
            )
            context.commit("setData", data);


            // return Vue.prototype.$axios
            //     .post('/ajax/?controller=workschedule&action=fetchdata&ishook=y')
            //     .then((response) => {
            //         if (response.data) {
            //
            //             let data = response.data;
            //             data.ASSISTANTS.push({
            //                 ID: '0',
            //                 NAME: "Без помощника",
            //                 LAST_NAME: ""
            //             })
            //             data.SCHEDULE.forEach((record) => {
            //                     let masterIndex = data.MASTERS.indexOf(data.MASTERS.find((el) => el.ID === record.MASTER_ID))
            //                     let hours = Math.floor(masterIndex / 60);
            //                     let minutes = masterIndex % 60;
            //                     let startDate = new Date(record.DATE);
            //                     startDate.setHours(hours);
            //                     startDate.setMinutes(minutes);
            //                     record.StartTime = startDate;
            //                     record.EndTime = new Date(startDate.getTime() + 60000);
            //                     record.Subject = record.DATE;
            //                     record.SERVICE_ID = record.SERVICE_ID ? record.SERVICE_ID : "";
            //                     record.Id = record.ID
            //                 }
            //             )
            //             context.commit("setData", data);
            //             return true;
            //         } else {
            //             return false;
            //         }
            //     })
            //     .catch((error) => {
            //         console.log(error)
            //         let data = {
            //             EDIT_RIGHTS: true,
            //             MASTERS: [
            //                 {
            //                     AVATAR: "https://avatars0.githubusercontent.com/u/9064066?v=4&s=460",
            //                     ID: '0',
            //                     NAME: "Мастер",
            //                     LAST_NAME: " "
            //                 },
            //             ],
            //             ASSISTANTS: [
            //                 {
            //                     ID: '0',
            //                     NAME: "Помощник",
            //                     LAST_NAME: " "
            //                 },
            //             ],
            //             SALONS: [
            //                 {
            //                     ID: "0",
            //                     NAME: 'Салон'
            //                 }
            //             ],
            //             SCHEDULE: [
            //                 {
            //                     ID: "1",
            //                     DATE: '2010-10-26T00:00:00',
            //                     SALON_ID: "0",
            //                     SERVICE_ID: "0",
            //                     MASTER_ID: "0",
            //                 },
            //
            //             ]
            //         }
            //         context.commit("setData", data);
            //         return true;
            //
            //     });


        }


    },
})
