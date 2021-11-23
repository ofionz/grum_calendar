<template>
  <div>
    <ejs-schedule
        v-if="isInit"
        :renderCell='onRenderCell'
        id='Schedule' height='550px' :locale='"ru"' :firstDayOfWeek='1'
        :popupOpen='onPopupOpen' :cellClick="onCellClick" :eventClick="onEventClick"
        :showTimeIndicator="false"
        ref="schedule"
        :startHour="startHour" :endHour="endHour" :eventSettings='eventSettings'
        :timeScale='timeScale'>
      <e-views>
        <e-view option='Day' dateFormat='dd-MMM-yyyy'></e-view>
        <e-view option='Week' dateFormat='dd-MMM-yyyy'></e-view>
        <e-view option='Month' dateFormat='dd-MMM-yyyy'></e-view>
      </e-views>
    </ejs-schedule>


    <v-dialog
        v-model="modalState.show"
        max-width="600px"
    >
      <v-card v-if="modalState.show">
        <v-card-title class="d-flex flex-column">
          <span class="text-h5 ">{{ modalState.title }}</span>
          <v-subheader v-if="modalState.start" style="line-height: 1rem" class="d-flex flex-column">
           <span>{{
               modalState.start.getFullYear() + '/' + (1 + modalState.start.getMonth()) + "/" + modalState.start.getDate()
             }}</span>
            <span>{{
                modalState.start.getHours() + ':' + (modalState.start.getMinutes() < 10 ? "0" + modalState.start.getMinutes() : modalState.start.getMinutes())
              }}</span>
          </v-subheader>

        </v-card-title>
        <v-card-text>
          <v-container>
            <v-autocomplete
                v-model="client"
                :loading="loading"
                :items="items"
                @change="pet = ''; master= ''; service=''"
                item-value="id"
                item-text="phone"
                :search-input.sync="search"
                flat
                hide-no-data
                hide-details
                label="Номер телефона клиента"

            >
              <template v-slot:selection="data">
                <span class="mr-2"> {{ data.item.phone }}</span>
                <span>  ({{ data.item.name }})</span>
              </template>
            </v-autocomplete>

            <v-select
                v-if="client"
                :items="clients.find((el)=> el.id === client).pets"
                v-model="pet"
                item-value="id"
                item-text="name"
                label="Питомец"
                hint=""
                @change="changeServices"
            ></v-select>

            <v-select
                v-if="pet"
                label="Услуга"
                hint=""
                item-text="name"
                item-value="id"
                v-model="service"
                :items="services"
                @change="changeMasters"
            ></v-select>
            <v-autocomplete
                v-if="service"
                label="Мастер"
                hint=""
                v-model="master"
                :items="masters"

            ></v-autocomplete>


            <div class="d-flex align-center">
              <v-slider
                  v-if="master"
                  class="mt-8"
                  :thumb-size="32"
                  v-model="duration"
                  label="Длительность"
                  min="0"
                  max="240"
                  thumb-color="primary"
                  thumb-label="always"
                  step="10"
                  @end="isAssistentNeeded = false"

              >
                <template v-slot:thumb-label="props">
               {{ calcHoursMin(props.value) }}
                </template>
              </v-slider>

              <span v-if="master"
                    class="ml-5">Окончание: {{ calcEnd(duration) }}</span>
            </div>
            <v-checkbox v-if="master" label="Необходим помошник" @change="range = [duration/2,duration]" v-model="isAssistentNeeded">

            </v-checkbox>

            <v-range-slider
                class="mt-5"
                v-if="isAssistentNeeded"
                :thumb-size="32"
                min="0"
                :max="duration"
                v-model="range"
                step="10"
                label="Время работы мастера"
                thumb-label="always"
            >
              <template v-slot:thumb-label="props">
                {{ calcEnd(props.value) }}
              </template>

            </v-range-slider>

          </v-container>

        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              :disabled="!isEditable"
              color="red darken-1"
              text
              v-if="curElem.ID "
              @click="deleteElem"
          >
            {{ "Удалить" }}
          </v-btn>
          <v-btn
              :disabled="!curElem.SALON_ID || !isEditable"
              color="green darken-1"
              text

              @click="curElem.ID?updateElem():saveElem()"
          >
            {{ curElem.ID ? "Изменить" : "Добавить" }}
          </v-btn>
          <v-btn
              color="blue darken-1"
              text
              @click="modalState.show = false"
          >
            Закрыть
          </v-btn>

        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script>
import Vue from 'vue';
import {SchedulePlugin, Day, Week, Month} from '@syncfusion/ej2-vue-schedule';
import {loadCldr} from '@syncfusion/ej2-base';
import {createElement} from '@syncfusion/ej2-base';

loadCldr(
    require('cldr-data/supplemental/numberingSystems.json'),
    require('cldr-data/main/ru/ca-gregorian.json'),
    require('cldr-data/main/ru/numbers.json'),
    require('cldr-data/main/ru/timeZoneNames.json')
);
Vue.use(SchedulePlugin);

var majorTemplateVue = Vue.component('TimeTemplate', {
  template: '<div style="position: absolute;left: 0; right: 0;">{{majorSlotTemplate(data.date)}}</div>',
  data() {
    return {
      data: {}
    };
  },
  methods: {
    majorSlotTemplate: function (date) {
      return date.getHours() + ":" + '00';
    }
  }
});


var eventTemplateVue = Vue.component('eventTemplate', {
  template: `
    <div style="white-space: normal; " @mouseenter="show" @mouseleave="close" class='template-wrap'>
    <div>
      <b>{{ data.PHONE }}</b>
    </div>
    <div>
      <b>{{ $store.getters.getServiceByID(data.SERVICE_ID).NAME }}</b>
    </div>
    <div class=""><span style="opacity: 0.8"> Мастер: {{ $store.getters.getMasterByID(data.MASTER_ID).NAME }}</span>
    </div>

    <div class="">
      <span style="opacity: 0.8">Клиент: {{ data.CLIENT }}</span>
    </div>

    <div class="">
      <span style="opacity: 0.8"> Питомец: {{ data.PET }}</span>
    </div>

    </div>`,
  data() {
    return {

      height: 20,
      data: {},
    };

  },

  mounted() {

    let id = '"Appointment_' + this.data.ID + '"'
    id = `[data-id=${id}]`;

    setTimeout(() => {
      if (document.querySelector(id))
        document.querySelector(id).style.backgroundColor = this.$store.getters.getMasterByID(this.data.MASTER_ID).COLOR
    }, 0)
    //
    // setTimeout(()=>this.$refs.wrap.parentElement.parentElement.style.backgroundColor= this.$store.getters.getMasterByID(this.data.MASTER_ID).COLOR, 0)
  },
  methods: {
    show(ev) {
      if (ev.target.clientHeight > ev.target.parentNode.parentNode.clientHeight) {
        ev.target.parentNode.parentNode.style.zIndex = 2000;
        this.height = ev.target.parentNode.parentNode.style.height;
        ev.target.parentNode.parentNode.style.height = ""
      }

    },
    close(ev) {
      ev.target.parentNode.parentNode.style.zIndex = '';
      ev.target.parentNode.parentNode.style.height = this.height;
    },
  }


});


export default {
  name: 'app',
  provide: {
    schedule: [Day, Week, Month]
  },
  components: {},
  computed: {},
  data() {
    return {
      isAssistentNeeded: false,
      range: [ 0, 0],
      duration: 0,
      services: [],
      loading: false,
      items: [],
      search: null,
      masters: [],
      clients: [
        {
          phone: '+7 911 11111111', name: "Василий", id: '1', pets: [
            {id: '1', name: 'Тузик (пудель)'},
            {id: '2', name: "Мурзик (кот)"}

          ]
        },
        {
          phone: '8 981 22222222', name: "Мария", id: '2', pets: [
            {id: '3', name: 'Гена (крокодил)'}
          ]
        },
        {
          phone: '981 33333333', name: "Елена", id: '3', pets: [
            {id: '4', name: 'Жужа (слон)'}
          ]
        },
      ],


      majorSlotTemplate: function (e) {
        return {template: majorTemplateVue}
      },

      isInit: false,
      isEditable: false,
      pet: '',
      client: '',
      service: '',
      master: '',
      modalState: {
        show: false,
        MASTER: {},
      },
      startHour: '09:00',
      endHour: '21:00',
      timeScale: {
        enable: true,
        interval: 60,
        slotCount: 6
      },


      eventSettings: {
        template: function (e) {
          return {
            template: eventTemplateVue
          };
        },
        dataSource: undefined
      }
    }
  },
  watch: {
    search(val) {
      val && val !== this.client && this.querySelections(val)
    },
  },
  methods: {

    calcHoursMin(min) {
      min = Number(min)
      var h = Math.floor(min / 60);
      var m = Math.floor(min % 60);
      var hDisplay = h > 0 ? h + ':' : "";
      var mDisplay = m > 0 ? m  : "00";
      if (!h && !m) {
        return 0
      }
      return hDisplay + mDisplay;
    },
    calcEnd(time) {
      let res = new Date(this.modalState.start);
      res.setMinutes(res.getMinutes() + time);

      return res.getHours() + ':' + (res.getMinutes() < 10 ? "0" + res.getMinutes() : res.getMinutes());
    },
    onRenderCell(argr) {
      if (argr.elementType === "monthCells") {
        let ele = createElement('div', {
          innerHTML: "Мастер №" + (Math.floor(Math.random() * 3) + 1),
          className: 'templatewrap'
        });
        (argr.element).appendChild(ele);
      }

    },
    changeMasters() {
      this.master = '';
      this.masters = [];
      switch (this.service) {
        case "1":
        case "2":
        case "4":
        case "5":
          this.masters = ['Мастер по пуделям и кошкам', "Мастер по всем"];
          break;
        case "7":
        case "8":
          this.masters = ["Мастер по крокодилам", "Мастер по всем"];
          break;
        case "9":
        case "10":
          this.masters = ["Мастер по слонам", "Мастер по всем"];
          break;

      }
    },
    changeServices() {
      this.master = '';
      this.service = '';
      this.masters = [];
      switch (this.pet) {
        case "1":
          this.services = [{id: '1', name: 'Стрижка пуделя'}, {id: '2', name: "Мойка пуделя"}, {
            id: '3',
            name: "Комплекс"
          }];
          break;
        case "2":
          this.services = [{id: '4', name: "Стрижка кошки"}, {id: '5', name: "Мойка кошки"}, {
            id: '6',
            name: "Маникюр"
          }];
          break;
        case "3":
          this.services = [{id: '7', name: 'Чесание хвоста'}, {id: '8', name: "Чистка зубов"}];
          break;
        case "4":
          this.services = [{id: '9', name: "Завивка хобота"}, {id: '10', name: "Завивка хвоста"}];
          break;
      }
    },
    querySelections(v) {
      this.loading = true
      setTimeout(() => {
        this.items = this.clients.filter(e => {
          return (e.phone || '').toLowerCase().indexOf((v || '').toLowerCase()) > -1
        })
        this.loading = false
      }, 300)
    },
    async deleteElem() {
      if (await this.$store.dispatch('deleteEvent', this.curElem.ID)) {
        this.$refs.schedule.deleteEvent(this.curElem.ID);
        this.$store.commit("deleteElem", this.curElem.ID);
        let index = this.eventSettings.dataSource.indexOf(this.eventSettings.dataSource.find(elem => elem.Id === this.curElem.ID));
        this.modalState = {};
        this.modalState.show = false;
        if (index > -1) {
          this.eventSettings.dataSource.splice(index, 1);
        }
      }
    },
    async saveElem() {
      let payload = {
        DATE: this.curElem.DATE.getFullYear() + "-" + (1 + this.curElem.DATE.getMonth()) + "-" + this.curElem.DATE.getDate() + 'T00:00:00.000Z',
        MASTER_ID: this.curElem.MASTER_ID,
        SALON_ID: this.curElem.SALON_ID,
        SERVICE_ID: this.curElem.SERVICE_ID != '0' ? this.curElem.SERVICE_ID : '',
      }

      let id = await this.$store.dispatch('addEvent', payload);
      if (id) {
        payload.Id = id;
        payload.ID = id;
        payload.Subject = id;
        payload.StartTime = new Date(this.curElem.DATE);
        payload.EndTime = new Date(this.curElem.DATE.getTime() + 60000)
        this.$refs.schedule.addEvent(payload);
        this.$store.commit("addElem", payload);
        this.modalState = {}
        this.modalState.show = false;
      }
    },
    async updateElem() {

      let payload = {
        ID: this.curElem.ID,
        DATE: this.curElem.DATE.getFullYear() + "-" + (1 + this.curElem.DATE.getMonth()) + "-" + this.curElem.DATE.getDate() + 'T00:00:00.000Z',
        MASTER_ID: this.curElem.MASTER_ID,
        SALON_ID: this.curElem.SALON_ID,
        SERVICE_ID: this.curElem.SERVICE_ID != '0' ? this.curElem.SERVICE_ID : '',
      }
      let result = await this.$store.dispatch('updateEvent', payload);
      if (result) {
        this.$refs.schedule.deleteEvent(this.curElem.ID);
        this.$store.commit("deleteElem", this.curElem.ID);
        let index = this.eventSettings.dataSource.indexOf(this.eventSettings.dataSource.find(elem => elem.Id === this.curElem.ID));
        if (index > -1) {
          this.eventSettings.dataSource.splice(index, 1);
        }
        payload.Id = this.curElem.ID;
        payload.ID = this.curElem.ID;
        payload.Subject = this.curElem.ID;
        payload.StartTime = new Date(this.curElem.DATE);
        payload.EndTime = new Date(this.curElem.DATE.getTime() + 60000)
        this.$refs.schedule.addEvent(payload);
        this.$store.commit("addElem", payload);
        this.modalState = {}
        this.modalState.show = false;
      }
    },
    onCellClick(event) {
      console.log(event)
      this.curElem = {}
      if (!event.isAllDay) {

        // this.eventSettings.dataSource.find((el) => new Date(el.StartTime).toString() === start.toString())
        this.modalState = {
          show: true,
          title: "Добавить",
          start: event.startTime
        };
      }
    },
    onEventClick(ev) {
      this.curElem = {
        DATE: ev.event.StartTime,
        ID: ev.event.ID,
        SERVICE_ID: ev.event.SERVICE_ID,
        SALON_ID: ev.event.SALON_ID,
        MASTER_ID: ev.event.MASTER_ID,
      }

      let assistants = ev.event.SERVICE_ID ? [this.$store.getters.getServiceByID(ev.event.SERVICE_ID)].concat(this.$store.getters.getFreeAssistant(ev.event.StartTime)) : this.$store.getters.getFreeAssistant(ev.event.StartTime);

      this.modalState = {
        show: true,
        title: "Подробности",
        MASTER: this.$store.getters.getMasterByID(ev.event.MASTER_ID),
        date: ev.event.StartTime
      };
    },
    onPopupOpen: function (args) {
      args.cancel = true;
      return args

    },

  },

  mounted: async function () {
    this.$store.dispatch('fetchData').then(() => {
      // this.endHour = this.calcHourView(this.$store.state.data.MASTERS.length)
      this.eventSettings.dataSource = this.$store.state.data.SCHEDULE
      this.isEditable = this.$store.state.data.EDIT_RIGHTS
      this.isInit = true;
    }).then(() => {
      Array.from(document.getElementsByClassName('e-tbar-btn-text')).find((el) => el.textContent === 'Today').textContent = "Сегодня";
      Array.from(document.getElementsByClassName('e-tbar-btn-text')).find((el) => el.textContent === 'Day').textContent = "День";
      Array.from(document.getElementsByClassName('e-tbar-btn-text')).find((el) => el.textContent === 'Week').textContent = "Неделя";
      Array.from(document.getElementsByClassName('e-tbar-btn-text')).find((el) => el.textContent === 'Month').textContent = "Месяц";
      let scheduleObj = document.getElementById('Schedule').ej2_instances[0];
      scheduleObj.timeScale.majorSlotTemplate = this.majorSlotTemplate;
      scheduleObj.dataBind();

    });


  }


}

</script>

<style lang="scss">
.e-time-cells {
  white-space: normal !important;
}
</style>
