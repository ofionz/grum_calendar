<template>
  <v-dialog
      v-model="modalState.show"
      max-width="600px"
  >
    <v-card v-if="modalState.show">
      <v-card-title class="d-flex flex-column">
        <div>
          <span class="text-h5 ">{{ modalState.title }}</span>
          <v-btn v-if="!modalState.Id" absolute right text  @click="$emit('changeModal', modalState)">Заметка</v-btn>
        </div>
        <v-subheader v-if="modalState.start" style="line-height: 1rem" class="d-flex flex-column">
          <!--           TODO убрать это говно когда будет время!-->
          <span>{{

              (new Date(modalState.start)).getFullYear() + '/' + (1 + new Date(modalState.start).getMonth()) + "/" + new Date(modalState.start).getDate()
            }}</span>
          <span>{{
              new Date(modalState.start).getHours() + ':' + (new Date(modalState.start).getMinutes() < 10 ? "0" + new Date(modalState.start).getMinutes() : new Date(modalState.start).getMinutes())
            }}</span>
        </v-subheader>

      </v-card-title>
      <v-card-text>
        <v-container>
          <div class="d-flex ">
            <v-autocomplete
                v-if="!modalState.Id"
                v-mask="'+7(9##)###-##-##'"
                :filter="searchAlghoritm"
                v-model="client"
                :loading="loading"
                :items="items"
                @change="changePets"
                return-object
                item-value="id"
                item-text="phone"
                :search-input.sync="search"
                flat
                hide-no-data
                hide-details
                label="Номер телефона клиента"
                class="pb-3"
            >
              <template v-slot:item="data">

                <template>
                  <span class="mr-2"> {{ data.item.phone }}</span>
                  <span>  ({{ data.item.name }})</span>
                </template>
              </template>

              <template v-slot:selection="data">
                <span class="mr-2"> {{ data.item.phone }}</span>
                <span>  ({{ data.item.name }})</span>
              </template>
            </v-autocomplete>

            <v-btn v-if="!modalState.Id" @click="showContactModal= true" icon large class="ml-5 align-self-end">
              <v-icon>
                mdi-plus
              </v-icon>
            </v-btn>

            <span v-else> {{ client.phone + ' (' + client.name + ')' }}</span>
          </div>
          <v-select
              :disabled="!client || !pets.length"
              :items="pets"
              v-model="pet"
              return-object
              item-value="id"
              item-text="name"
              label="Питомец"
              hint=""
              @change="changeServices"
          ></v-select>

          <v-autocomplete
              :disabled="!pet ||!services.length"
              label="Услуга"
              hint=""
              return-object
              item-text="name"
              item-value="id"
              v-model="service"
              :items="services"
              @change="changeMasters"
              multiple
          ></v-autocomplete>
          <v-autocomplete
              return-object
              :disabled="!service"
              label="Мастер"
              hint=""
              item-text="name"
              item-value="id"
              @change="fetchPriceAndDuration"
              v-model="master"
              :items="masters"

          ></v-autocomplete>

          <v-text-field
              :disabled="!master"
              label="Стоимость"
              hint=""
              v-mask="'######'"
              v-model="price">
          </v-text-field>


          <div class="d-flex align-center">
            <v-slider
                :disabled="!master"
                class="mt-8"
                :thumb-size="32"
                v-model="duration"
                label="Длительность"
                min="10"
                max="420"
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
          <div v-if="message" v-html="message"></div>
          <v-checkbox v-if="isAssistentExist" :disabled="!master" label="Необходим помощник"
                      @change="range = [duration/2,duration]"
                      v-model="isAssistentNeeded">

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

    <add-contact @closed="showContactModal = false" @saved="savedContact" v-if="showContactModal"></add-contact>
  </v-dialog>
</template>

<script>
import AddContact from "./addContact";

export default {
  name: "EventModal",
  components: {AddContact},
  props: {
    modalState: {}
  },
  data() {
    return {
      showContactModal: false,
      curElem: {},
      isAssistentNeeded: false,
      range: [0, 0],
      duration: 0,
      services: [],
      loading: false,
      items: [],
      search: null,
      masters: [],
      clients: [
        {
          phone: '+791111111111', name: "Василий", id: '1',
        },
        {
          phone: '+798122222222', name: "Мария", id: '2'
        },
        {
          phone: '+798133333333', name: "Елена", id: '3'
        },
      ],
      pets: [],
      isEditable: false,
      pet: '',
      client: '',
      service: '',
      master: '',
      price: '',
      message: '',

    }

  },
  computed: {
    isAssistentExist() {

      return !!(this.master && this.$store.getters.getHeadElem(this.modalState.start).find((el) => el.id == this.master.id).assistant);
    }
  },
  async created() {
    if (this.modalState.Id) {
      this.clients.push(JSON.parse(JSON.stringify(this.modalState.client)));
      this.client = JSON.parse(JSON.stringify(this.modalState.client));
      await this.$axios.post(window.serverUrl + 'ajax/?controller=contact&action=getContactPets&ishook=y', {id: this.client.id}).then((response) => {
        this.pets = response.data;
        this.loading = false;
      })
      this.pet = JSON.parse(JSON.stringify(this.modalState.pet))
      await this.$axios.post(window.serverUrl + 'ajax/?controller=GroomingCalendar&action=getServicesByPet&ishook=y', {id: this.pet.id}).then((response) => {
        this.services = response.data;
      })
      this.service = JSON.parse(JSON.stringify(this.modalState.service));

      let payload = {
        type: 'event',
        service: this.service.map((el) => el.id),
        salon: this.$store.state.salon,
        date: this.formatDateToSend(this.modalState.start),
      };

      this.$axios.post(window.serverUrl + 'ajax/?controller=GroomingCalendar&action=getMasters&ishook=y', payload).then((response) => {
        this.masters = response.data;
      })

      if (!this.masters.find((el) => el.id === this.modalState.master.id)) {
        this.masters.push(JSON.parse(JSON.stringify(this.modalState.master)))
      }
      this.master = JSON.parse(JSON.stringify(this.modalState.master));
      this.price = JSON.parse(JSON.stringify(this.modalState.price));
      this.duration = (this.modalState.EndTime - this.modalState.StartTime) / 1000 / 60;
      if (this.modalState.master_start && this.modalState.master_finish) {
        let ms_strt = new Date(this.modalState.master_start);
        let ms_fnsh = new Date(this.modalState.master_finish);
        if (this.modalState.StartTime.getTime() !== ms_strt.getTime() || this.modalState.EndTime.getTime() !== ms_fnsh.getTime())
          this.isAssistentNeeded = true;
        this.range[0] = (ms_strt.getTime() - this.modalState.StartTime.getTime()) / 1000 / 60;
        this.range[1] = (ms_fnsh.getTime() - this.modalState.StartTime.getTime()) / 1000 / 60;
      }
    }
  },
  watch: {
    search(val) {
      val && val !== this.client && this.querySelections(val)
    },
  },
  methods: {
    searchAlghoritm(item, queryText, itemText) {
      return itemText.toLocaleLowerCase().replace(/[{()}-]/g, '').indexOf(queryText.toLocaleLowerCase().replace(/[{()}-]/g, '')) > -1
    },
    formatDateToSend(inner) {
      let date = new Date(inner)
      return date.getFullYear() + "-" + (1 + date.getMonth()) + "-" + date.getDate() + 'T' + (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':' + (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()) + '';
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

    savedContact(data) {
      this.showContactModal = false;
      this.items.push(data);
      this.client = data;
      this.changePets()
    },
    querySelections(v) {
      this.loading = true
      v = v.replace(/[{()}-]/g, '');
      this.$axios.post(window.serverUrl + 'ajax/?controller=contact&action=getcontactsbyphone&ishook=y', {phone: v}).then((response) => {
        this.items = response.data;
        this.loading = false;
      })
    },
    async changePets() {
      this.pet = '';
      this.master = '';
      this.service = ''

      await this.$axios.post(window.serverUrl + 'ajax/?controller=contact&action=getContactPets&ishook=y', {id: this.client.id}).then((response) => {
        this.pets = response.data;
        this.loading = false;
        if (this.pets.length === 1) {
          this.pet = this.pets[0]
          this.changeServices();
        }
      })

    },


    async changeServices() {
      this.master = '';
      this.service = '';
      this.masters = [];

      this.$axios.post(window.serverUrl + 'ajax/?controller=GroomingCalendar&action=getServicesByPet&ishook=y', {id: this.pet.id}).then((response) => {
        this.services = response.data;
        if (this.services.length === 1 && !this.modalState.Id) {
          this.service = this.services[0]
          this.changeMasters();
        }
      })

    },
    async changeMasters() {
      this.master = '';
      this.masters = [];

      let payload = {
        type: 'event',
        service: this.service.map((el) => el.id),
        salon: this.$store.state.salon,
        date: this.formatDateToSend(this.modalState.start),
      };
      this.$axios.post(window.serverUrl + 'ajax/?controller=GroomingCalendar&action=getMasters&ishook=y', payload).then((response) => {
        this.masters = response.data;
        if (this.masters.length === 1) {
          this.master = this.masters[0]
          this.fetchPriceAndDuration();
        }
      })

    },
    async fetchPriceAndDuration() {


      let payload = {
        service: this.service.map((el) => el.id),
        salon: this.$store.state.salon,
        date: this.formatDateToSend(this.modalState.start),
        master: this.master.id,
      };

      this.$axios.post(window.serverUrl + 'ajax/?controller=GroomingCalendar&action=getPrice&ishook=y', payload).then((response) => {
        this.price = response.data.price;
        this.duration = response.data.duration;
        this.message = response.data.message;
      })

    },
    async saveElem() {
      let payload = {
        salon: this.$store.
            state.salon,
        start: this.formatDateToSend(this.modalState.start),
        finish: this.formatDateToSend((new Date(this.modalState.start).getTime()) + this.duration * 60 * 1000),
        service: this.service,
        client: this.client,
        master: this.master,
        pet: this.pet,
        price: this.price,
        isAssistentNeeded: this.isAssistentNeeded,
        master_start: this.formatDateToSend((new Date(this.modalState.start).getTime()) + this.range[0] * 60 * 1000),
        master_finish: this.range[1] ? this.formatDateToSend((new Date(this.modalState.start).getTime()) + this.range[1] * 60 * 1000) : this.formatDateToSend((new Date(this.modalState.start).getTime()) + this.duration * 60 * 1000),
      }
      let id;


      await this.$axios.post(window.serverUrl + 'ajax/?controller=GroomingCalendar&action=addEvent&ishook=y', payload).then((response) => {
        id = response.data.id;
      })


      if (id) {
        payload.Id = id;
        payload.ID = id;
        payload.Subject = id;
        payload.StartTime = payload.start;
        payload.EndTime = payload.finish;
        this.$emit('addEvent', payload)
        this.$store.commit("addEvent", payload);
      }

    },
    async deleteElem() {
      let result;

      await this.$axios.post(window.serverUrl + 'ajax/?controller=GroomingCalendar&action=deleteEvent&ishook=y', {id: this.modalState.Id}).then((response) => {
        result = response.data;
      })


      if (result) {
        this.$store.commit("deleteElem", this.modalState.Id);
        this.$emit('deleteEvent', {Id: this.modalState.Id});
      }
    },
    async updateElem() {

      let payload = {
        id: this.modalState.Id,
        salon: this.$store.state.salon,
        start: this.formatDateToSend(this.modalState.start),
        finish: this.formatDateToSend((new Date(this.modalState.start).getTime()) + this.duration * 60 * 1000),
        service: this.service.map((el) => el.id),
        client: this.client,
        master: this.master,
        pet: this.pet,
        price: this.price,
        isAssistentNeeded: this.isAssistentNeeded,
      }
      if (this.isAssistentNeeded) {
        payload.master_start = this.formatDateToSend((new Date(this.modalState.start).getTime()) + this.range[0] * 60 * 1000);
        payload.master_finish = this.range[1] ? this.formatDateToSend((new Date(this.modalState.start).getTime()) + this.range[1] * 60 * 1000) : this.formatDateToSend((new Date(this.modalState.start).getTime()) + this.duration * 60 * 1000);
      } else {
        payload.master_start = payload.start
        payload.master_finish = payload.finish
      }
      let result;


      await this.$axios.post(window.serverUrl + 'ajax/?controller=GroomingCalendar&action=editEvent&ishook=y', payload).then((response) => {
        result = response.data;
      })


      if (result) {
        this.$store.commit("deleteElem", this.modalState.Id);
        payload.service = this.service;
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
