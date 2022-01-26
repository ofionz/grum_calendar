<template>
  <div>
    <ejs-schedule
        v-if="isInit"
        :renderCell='onRenderCell'
        id='Schedule' height='550px' :locale='"ru"' :firstDayOfWeek='1'
        :popupOpen='onPopupOpen' :cellClick="onCellClick" :cellDoubleClick="onDoubleCellClick"
        :navigating="onDateChange" :eventClick="onEventClick"
        :dragStop="onDrag"
        :showTimeIndicator="false"
        ref="schedule"
        :dateHeaderTemplate='dateHeaderTemplate'
        :startHour="startHour" :endHour="endHour" :eventSettings='eventSettings'
        :timeScale='timeScale'

    >
      <e-views>
        <e-view option='Day' dateFormat='dd-MMM-yyyy'></e-view>
        <e-view option='Week' dateFormat='dd-MMM-yyyy'></e-view>
        <e-view option='Month' dateFormat='dd-MMM-yyyy'></e-view>
      </e-views>
    </ejs-schedule>
    <EventModal v-if="modalState.show" @addEvent="addEvent" @changeModal="onDoubleCellClick" @deleteEvent="deleteEvent"
                :modal-state="modalState"></EventModal>
    <NoteModal v-if="noteModalState.show" @addEvent="addEvent" @changeModal="onCellClick" @deleteEvent="deleteEvent"
               :modal-state="noteModalState"></NoteModal>


  </div>
</template>

<script>
import Vue from 'vue';
import {SchedulePlugin, Day, Week, Month, DragAndDrop, DragEventArgs} from '@syncfusion/ej2-vue-schedule';
import {loadCldr} from '@syncfusion/ej2-base';
import {createElement} from '@syncfusion/ej2-base';
import EventModal from "./EventModal";
import NoteModal from "./NoteModal";

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

var eventTooltipTemplateVue = Vue.component('eventTooltipTemplate', {

  render() {
    if (this.data.type === 'event') {
      return <div className='tooltip-wrap'>
        <div className='time'>Начало : {this.data.StartTime.toLocaleString()} </div>
        <div className='time'>Конец : {this.data.EndTime.toLocaleString()} </div>
        <div>Клиент: {this.data.client.phone + ' (' + this.data.client.name + ')'}</div>
        <div>
          Услуги:
          {this.data.service.map((elem, index) => {
            return <span key={index}>{elem.name} </span>
          })}
        </div>
        <div> Мастер: {this.data.master.name}</div>
        <div> Питомец: {this.data.pet.name + ' (' + this.data.pet.breed + ')'}</div>
      </div>
    } else return <div style="line-height: 10px; padding-top: 2px; display: flex; flex-direction: column"
                       class="d-flex flex-column">
      <div style="margin-bottom: 3px" class='time'>Начало : {this.data.StartTime.toLocaleString()} </div>
      <div style="margin-bottom: 3px" class='time'>Конец : {this.data.EndTime.toLocaleString()} </div>
      <span style="margin-bottom: 3px">Заголовок: {this.data.title}</span>
      <span>Текст: {this.data.description}</span>
    </div>;
  },
  data() {
    return {
      data: {}
    };
  },

});


var eventTemplateVue = Vue.component('eventTemplate', {
// <hr style="position: absolute; top: 64%;width: 100%;">
  data() {
    return {
      isshow: false,
      height: 20,
      data: {},
    };
  },


  mounted() {

    let id = '"Appointment_' + this.data.id + '"'
    id = `[data-id=${id}]`;

    setTimeout(() => {

      if (document.querySelector(id) && this.data.master && this.data.master.color) {
        document.querySelector(id).style.backgroundColor = this.data.master.color;
      } else if (document.querySelector(id) && this.data.type === 'note') {

        document.querySelector(id).style.backgroundColor = '#f0f800';
      }
    }, 0)

  },
  methods: {
    makeLightColor(clr) {
      if (!clr) return
      var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      clr = clr.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
      });
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(clr);
      result = {
        r: Math.floor(parseInt(result[1], 16) + parseInt(result[1], 16) * 0.2),
        g: Math.floor(parseInt(result[2], 16) + parseInt(result[2], 16) * 0.2),
        b: Math.floor(parseInt(result[3], 16) + parseInt(result[3], 16) * 0.2)
      };
      return `rgb(${result.r > 255 ? 255 : result.r}, ${result.g > 255 ? 255 : result.g}, ${result.b > 255 ? 255 : result.b})`;
    },
    show(ev) {
      this.isshow = true;
      ev.target.parentNode.parentNode.style.overflow = 'unset';
      if (ev.target.clientHeight > ev.target.parentNode.parentNode.clientHeight) {
        ev.target.parentNode.parentNode.style.zIndex = 2000;
        this.height = ev.target.parentNode.parentNode.style.height;
        ev.target.parentNode.parentNode.style.height = ""
      }

    },
    close(ev) {
      this.isshow = false;
      ev.target.parentNode.parentNode.style.overflow = 'hidden';

      // ev.target.parentNode.style.height = '100%';
      ev.target.parentNode.parentNode.style.zIndex = '';
      ev.target.parentNode.parentNode.style.height = this.height;
    },
  },
  render() {
    if (this.data.type === 'event') {
      return <div
          style={"white-space: normal; border-bottom: #fff solid 1px; height:100%; background-color: " + this.makeLightColor(this.data.master.color)}
          class='template-wrap'>
        <div style="line-height: 9px; padding-top: 2px" class="d-flex flex-column">
          <b>{this.data.client.phone + ' (' + this.data.client.name + ')'}</b>
          {this.data.service.map((elem, index) => {
            return <b key={index}>{elem.name} </b>
          })}
        </div>
      </div>
    } else return <div style="line-height: 9px; padding-top: 2px; font-size: 8px; white-space: break-spaces;"
                       class="d-flex flex-column">
      <span>{this.data.title}</span>
      <span style="margin-top: 4px">{this.data.description}</span>
    </div>;
  },
});

// <div className="e-header-day">Чт</div>
// <div className="e-header-date e-navigate" role="link">25</div>
var dateHeaderTemplateVue = Vue.component('demo', {
  template: ' <div class="d-flex "> <div class="e-header-date e-navigate mr-2" role="link"><span>{{data.date.getDate()}}</span>' +
      ' <span style="font-size: 10px">{{getDateHeaderText()}}</span>' +
      '</div> <div class="d-flex flex-column" style="line-height: 10px; font-size: 9px">' +
      '<div v-for="(row, index) in  rows" class="d-flex flex-column  master-field" >    <span class="master-field-square" :style="`background-color:`+ row.color"></span> <span  >{{row.name}}</span> <span v-if="row.assistant" >{{row.assistant}}</span><span class="master-field-underline" :style="`border-bottom: 1px solid `+ row.color"></span></div>' + '</div></div>',
  data() {
    return {
      data: {},
      rows: []
    };
  },
  created() {
    this.rows = this.$store.getters.getHeadElem(this.data.date);
  },
  methods: {

    getDateHeaderText: function () {
      let days = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
      return days[this.data.date.getDay()];

    },

  }
});


export default {
  name: 'app',
  provide: {
    schedule: [Day, Week, Month, DragAndDrop]
  },
  components: {EventModal, NoteModal},
  computed: {},
  data() {
    return {
      modalState: {
        show: false,
      },
      noteModalState: {
        show: false,
      },
      dateHeaderTemplate: function (e) {
        return {template: dateHeaderTemplateVue}
      },
      majorSlotTemplate: function (e) {
        return {template: majorTemplateVue}
      },
      isInit: false,
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
        dataSource: undefined,
        enableTooltip: true,
        tooltipTemplate: function (e) {
          return {
            template: eventTooltipTemplateVue
          };
        }
      }
    }
  },

  methods: {
    addEvent(data) {
      this.$refs.schedule.addEvent(data)
      this.modalState = {};
      this.modalState.show = false;
      this.noteModalState = {};
      this.noteModalState.show = false;
    },
    deleteEvent(data) {
      this.$refs.schedule.deleteEvent(data.Id);
      let index = this.eventSettings.dataSource.indexOf(this.eventSettings.dataSource.find(elem => elem.Id === data.Id));
      if (index > -1) {
        this.eventSettings.dataSource.splice(index, 1);
      }
      this.modalState = {};
      this.modalState.show = false;
      this.noteModalState = {};
      this.noteModalState.show = false;
    },
    onRenderCell(argr) {
      if (argr.elementType === "monthCells") {
        argr.element.classList.add('MonthCell')
        let head = this.$store.getters.getHeadElem(argr.date)
        if (!head.length) return
        let cont = createElement('div', {
          className: 'd-flex flex-column head-cont'
        })
        head.forEach((el) => {
          let ele = createElement('div', {
            innerHTML: `<span class="master-field-square" style="background-color: ${el.color}"> <span style="padding-left: 10px">${el.name}</span></span> ` + (el.assistant ? (`<span style="padding-left: 10px;padding-top: 2px;">${el.assistant}</span>`) : "") + `<span class="master-field-underline" style="margin-bottom: 3px; margin-top: 3px; border-bottom: 1px solid ${el.color}"></span>`,
            className: 'd-flex flex-column '
          });
          cont.appendChild(ele);
        })

        argr.element.appendChild(cont);

      }


    },

    onDateChange(ev) {
      // console.log(ev)
    },
    onCellClick(event) {

      if (!event.isAllDay) {
        // this.eventSettings.dataSource.find((el) => new Date(el.StartTime).toString() === start.toString())
        this.noteModalState = {show: false}
        this.modalState = {
          show: true,
          title: "Запись клиента",
          start: event.startTime ? event.startTime : event.start
        };
      }
    },
    formatDateToSend(inner) {
      let date = new Date(inner)
      return date.getFullYear() + "-" + (1 + date.getMonth()) + "-" + date.getDate() + 'T' + (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':' + (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()) + '';
    },
    onDoubleCellClick(event) {

      if (!event.isAllDay) {
        // this.eventSettings.dataSource.find((el) => new Date(el.StartTime).toString() === start.toString())
        this.modalState = {show: false}
        this.noteModalState = {
          show: true,
          title: "Добавить заметку",
          start: event.startTime ? event.startTime : event.start
        };
      }
    },
    async onDrag(ev) {
      let oldData = JSON.parse(JSON.stringify(ev.data))

      let payload = {
        type: 'event',
        id: ev.data.Id,
        salon: this.$store.state.salon,
        start: this.formatDateToSend(ev.data.StartTime),
        finish: this.formatDateToSend(ev.data.EndTime),
        service: ev.data.service.map((el) => el.id),
        client: ev.data.client,
        master: ev.data.master,
        pet: ev.data.pet,
        comment: ev.data.comment,
        price: ev.data.price,
        // isAssistentNeeded: this.isAssistentNeeded,
      }

      await this.$axios.post(window.serverUrl + 'ajax/?controller=GroomingCalendar&action=editEvent&ishook=y', payload).then((response) => {
        if (!response || !response.data || response.data.error) {
          this.$store.commit("deleteElem", payload.Id);
          oldData.StartTime = oldData.start
          oldData.EndTime = oldData.finish
          this.deleteEvent(oldData)
          this.$store.commit("addEvent", oldData);
          this.addEvent(oldData)
        } else {
          this.$store.commit("deleteElem", payload.Id);
          this.deleteEvent(oldData)
          this.$store.commit("addEvent", oldData);
          this.addEvent(oldData)
        }
      })


    },
    onEventClick(ev) {

      if (ev.event.type === 'event') {
        this.modalState = {
          show: true,
          title: "Подробности",
          date: ev.event.StartTime,
          ...ev.event
        };
      } else if (ev.event.type === 'note') {
        this.noteModalState = {
          show: true,
          title: "Заметка",
          date: ev.event.StartTime,
          ...ev.event
        };
      }

    },
    onPopupOpen: function (args) {
      args.cancel = true;
      return args

    },
  },

  mounted: async function () {
    await this.$store.getters.getPromiseEvents().then(() => {
      this.eventSettings.dataSource = this.$store.state.data
      this.isInit = true;
    }).then(() => {
      Array.from(document.getElementsByClassName('e-tbar-btn-text')).find((el) => el.textContent === 'Today').textContent = "Сегодня";
      Array.from(document.getElementsByClassName('e-tbar-btn-text')).find((el) => el.textContent === 'Day').textContent = "День";
      Array.from(document.getElementsByClassName('e-tbar-btn-text')).find((el) => el.textContent === 'Week').textContent = "Неделя";
      Array.from(document.getElementsByClassName('e-tbar-btn-text')).find((el) => el.textContent === 'Month').textContent = "Месяц";
      let scheduleObj = document.getElementById('Schedule').ej2_instances[0];
      scheduleObj.timeScale.majorSlotTemplate = this.majorSlotTemplate;
      scheduleObj.dataBind();

    })
  }


}

</script>

<style lang="scss">
.e-time-cells {
  white-space: normal !important;
}
</style>
