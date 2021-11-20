<template>
  <div>
    <ejs-schedule
        v-if="isInit"
        id='Schedule' height='550px' :locale='"ru"' :firstDayOfWeek='1'
        :popupOpen='onPopupOpen'  :cellClick="onCellClick" :eventClick="onEventClick"
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
          <v-subheader v-if="modalState.date" class="d-flex flex-column">
            <span>{{ modalState.MASTER.NAME + " " + modalState.MASTER.LAST_NAME }} </span><span>{{
              modalState.date.getFullYear() + '/' + (1 + modalState.date.getMonth()) + "/" + modalState.date.getDate()
            }}</span>
          </v-subheader>

        </v-card-title>
        <v-card-text>
          <v-container>
            <v-autocomplete
                label="Клиент"
                hint=""
                :items="modalState.CLIENTS"
            ></v-autocomplete>
            <v-autocomplete
                :items="modalState.PETS"
                label="Питомец"
                hint=""
            ></v-autocomplete>
            <v-autocomplete
                label="Услуга"
                hint=""
                :items="modalState.SERVICES"
            ></v-autocomplete>
            <v-autocomplete
                label="Мастер"
                hint=""
                :items="modalState.MASTERS"
            ></v-autocomplete>


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
    <div  style="white-space: normal; " @mouseenter="show" @mouseleave="close" class='template-wrap'>
    <div>
      <b>{{ $store.getters.getServiceByID(data.SERVICE_ID).NAME }}</b>
    </div>
    <div class="py-1"> <span style="opacity: 0.8"> Мастер: {{ $store.getters.getMasterByID(data.MASTER_ID).NAME }}</span></div>

    <div class="py-1">
      <span style="opacity: 0.8">Клиент: {{ data.CLIENT }}</span>
    </div>

    <div class="py-1">
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

    let id = '"Appointment_'+this.data.ID+'"'
    id = `[data-id=${id}]`;

    setTimeout(()=> {if(document.querySelector(id))
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
  data() {
    return {
      majorSlotTemplate: function (e) {
        return {template: majorTemplateVue}
      },

      isInit: false,
      isEditable: false,
      curElem: {},
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

  methods: {

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

      this.curElem = {}
      if (!event.isAllDay) {

        // this.eventSettings.dataSource.find((el) => new Date(el.StartTime).toString() === start.toString())
        this.modalState = {
          show: true,
          title: "Добавить",
          MASTERS: [1, 2, 3, 4, 5],
          CLIENTS: [1, 2, 3, 4, 5],
          PETS: [1, 2, 3, 4, 5],
          SERVICES: [1, 2, 3, 4, 5],

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
    calcHourView(index) {
      let hours = Math.floor(index / 60);
      let minutes = index % 60;
      return `${hours}:${minutes}`;
    }
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
