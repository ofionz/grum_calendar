<template>
  <v-dialog
      v-model="modalState.show"
      max-width="600px"
  >
    <v-card v-if="modalState.show">
      <v-card-title class="d-flex flex-column">
        <div>
          <span class="text-h5 ">Заметка</span>
          <v-btn v-if="!modalState.Id" absolute right text @click="$emit('changeModal', modalState)">Запись клиента
          </v-btn>
        </div>
        <v-subheader v-if="modalState.start" style="line-height: 1rem" class="d-flex flex-column">
          <div class="d-flex justify-center">
            <v-menu
                v-model="dateMenu"
                :close-on-content-click="false"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                    v-model="startDate"
                    style="width: 33%; max-width: 33%; padding-top: 0"

                    prepend-icon="mdi-calendar"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                    :rules="[value => !!value || 'Заполните поле дата']"
                ></v-text-field>
              </template>
              <v-date-picker
                  v-model="startDate"
                  @input="dateMenu = false"
              ></v-date-picker>
            </v-menu>
            <v-text-field
                prepend-icon="mdi-clock-time-four-outline"
                v-mask="timeMask"
                ref="timefield"
                v-model="startTime"
                style="width: 33%; max-width: 33%; padding-top: 0"
                :rules="[
                          value => !!value || '' ,
                         (value) =>  value.length >= 5 || ''
                      ]"
            ></v-text-field>
          </div>
        </v-subheader>

      </v-card-title>
      <v-card-text>
        <v-container>
          <div class="d-flex flex-column">
            <v-text-field
                v-model="title"
                flat
                label="Заголовок"
                hint="Поле обязательно для заполнения"
                class="pb-3"
            >

            </v-text-field>

            <v-textarea no-resize rows="3" label="Текст" v-model="description">

            </v-textarea>
            <div class="d-flex align-center">
              <v-slider

                  class="mt-8"
                  :thumb-size="32"
                  v-model="duration"
                  label="Длительность"
                  min="10"
                  max="420"
                  thumb-color="primary"
                  thumb-label="always"
                  step="10"
              >
                <template v-slot:thumb-label="props">
                  {{ calcHoursMin(props.value) }}
                </template>
              </v-slider>
              <span
                  class="ml-5">Окончание: {{ calcEnd(duration) }}</span>
            </div>
          </div>

          <v-autocomplete
              clearable
              return-object
              label="Мастер"
              hint=""
              item-text="name"
              item-value="id"
              v-model="master"
              :items="masters"

          ></v-autocomplete>

        </v-container>

      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
            color="red darken-1"
            text
            v-if="modalState.Id"
            @click="deleteElem"
        >
          {{ "Удалить" }}
        </v-btn>
        <v-btn
            color="green darken-1"
            text
            :disabled="!title || !$refs.timefield.valid "
            @click="modalState.Id?updateElem():saveElem()"
        >
          {{ modalState.Id ? "Сохранить изменения" : "Добавить" }}
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
</template>

<script>


export default {
  name: "EventModal",

  props: {
    modalState: {}
  },
  data() {
    return {
      masters: [],
      title: '',
      description: '',
      master: '',
      duration: 0,
      startTime: '',
      dateMenu: false,
      startDate: '',
    }

  },

  async created() {
    let stDate = new Date(this.modalState.start)
    this.startDate = (stDate).getFullYear() + '-' + (1 + stDate.getMonth()) + "-" + stDate.getDate()
    this.startTime = (stDate.getHours() < 10 ? "0" + stDate.getHours() : stDate.getHours()) + ':' + (stDate.getMinutes() < 10 ? "0" + stDate.getMinutes() : stDate.getMinutes())

    let payload = {
      type: 'note',
      salon: this.$store.state.salon,
      date: this.formatDateToSend(this.modalState.start),
    };
    await this.$axios.post(window.serverUrl + 'ajax/?controller=GroomingCalendar&action=getMasters&ishook=y', payload).then((response) => {
      this.masters = response.data;
    })
    if (this.modalState.Id) {
      this.title = this.modalState.title;
      this.description = this.modalState.description;
      this.duration = (this.modalState.EndTime - this.modalState.StartTime) / 1000 / 60;
      if (this.modalState.master && this.modalState.master.id) {
        if (!this.masters.find((el) => el.id === this.modalState.master.id)) {
          this.masters.push(JSON.parse(JSON.stringify(this.modalState.master)))
        }
        this.master = JSON.parse(JSON.stringify(this.modalState.master));
      }

    }
  },
  watch: {
    startDate(el) {
      el = el.split('-')
      this.modalState.start = new Date(this.modalState.start).setFullYear(el[0], (el[1] - 1), el[2])
    },
    startTime(el) {
      if (el.length === 5) {
        el = el.split(':').map(elem => elem.replace(/\D+/g, ""))
        if (el.length === 2 && el[0].length === 2 && el[1].length === 2) {
          this.modalState.start = new Date(this.modalState.start).setHours(Number.parseInt(el[0]), Number.parseInt(el[1]))
        }
      }
    },
  },
  methods: {

    timeMask(value) {

      const hours = [
        /[0-2]/,
        value.charAt(0) === '2' ? /[0-3]/ : /[0-9]/,
      ];
      const minutes = [/[0-5]/, /[0-9]/];
      return value.length > 2
          ? [...hours, ':', ...minutes]
          : hours;
    },
    calcHoursMin(min) {
      min = Number(min)
      var h = Math.floor(min / 60);
      var m = Math.floor(min % 60);
      var hDisplay = h > 0 ? h + ':' : "";
      var mDisplay = m > 0 ? m : "00";
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
    formatDateToSend(inner) {
      let date = new Date(inner)
      return date.getFullYear() + "-" + (1 + date.getMonth()) + "-" + date.getDate() + 'T' + (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':' + (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()) + '';
    },
    async saveElem() {
      let payload = {
        type: 'note',
        salon: this.$store.state.salon,
        title: this.title,
        description: this.description,
        start: this.formatDateToSend(this.modalState.start),
        finish: this.formatDateToSend((new Date(this.modalState.start).getTime()) + this.duration * 60 * 1000),
        master: this.master,
      }
      let id;


      await this.$axios.post(window.serverUrl + 'ajax/?controller=GroomingCalendar&action=addNote&ishook=y', payload).then((response) => {
        id = response.data.id;
      })


      if (id) {
        payload.Id = id;
        payload.id = id;
        payload.ID = id;
        payload.Subject = id;
        payload.StartTime = new Date (this.modalState.start);
        payload.EndTime =new Date ((new Date(this.modalState.start).getTime()) + this.duration * 60 * 1000)
        this.$emit('addEvent', payload)
        this.$store.commit("addEvent", payload);
      }

    },
    async deleteElem() {
      let result;

      await this.$axios.post(window.serverUrl + 'ajax/?controller=GroomingCalendar&action=deleteNote&ishook=y', {id: this.modalState.Id}).then((response) => {
        result = response.data;
      })


      if (result) {
        this.$store.commit("deleteElem", this.modalState.Id);
        this.$emit('deleteEvent', {Id: this.modalState.Id});
      }
    },
    async updateElem() {

      let payload = {
        type: 'note',
        id: this.modalState.Id,
        salon: this.$store.state.salon,
        title: this.title,
        description: this.description,
        start: this.formatDateToSend(this.modalState.start),
        finish: this.formatDateToSend((new Date(this.modalState.start).getTime()) + this.duration * 60 * 1000),
        master: this.master,
      }
      let result;
      await this.$axios.post(window.serverUrl + 'ajax/?controller=GroomingCalendar&action=editNote&ishook=y', payload).then((response) => {
        result = response.data;
      })


      if (result) {
        this.$store.commit("deleteElem", this.modalState.Id);
        payload.ID = this.modalState.Id;
        payload.Id = this.modalState.Id;
        payload.Subject = this.modalState.Id;
        payload.StartTime = payload.start;
        payload.EndTime = payload.finish;
        this.$emit('deleteEvent', payload)
        this.$store.commit("addEvent", payload);
        this.$emit('addEvent', payload);
      }
    },
  },
}
</script>

<style scoped>

</style>
