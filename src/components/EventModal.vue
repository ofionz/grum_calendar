<template>
  <v-dialog
      v-model="modalState.show"
      max-width="600px"
  >
    <v-card v-if="modalState.show">
      <v-card-title class="d-flex flex-column">
        <div>
          <span class="text-h5 ">{{ modalState.title }}</span>
          <v-btn v-if="!modalState.Id" absolute right text @click="$emit('changeModal', modalState)">Заметка</v-btn>
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
          <div class="d-flex ">
            <v-autocomplete

                v-if="!modalState.Id"
                v-mask="'+7(9##)###-##-##'"

                placeholder="+7(9##)###-##-##"
                persistent-placeholder
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

            <div v-if="!modalState.Id" class="ml-5 align-self-end">

              <v-btn v-if="client" @click="showContactModal= true" icon>
                <v-icon>
                  mdi-pencil
                </v-icon>
              </v-btn>
              <v-btn v-else @click="showContactModal= true" large icon>
                <v-icon>
                  mdi-plus
                </v-icon>
              </v-btn>
            </div>
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


          <div class="d-flex align-center">
            <v-select
                item-text="name"
                :items="salesListWithoutAlreadyAdded"
                return-object
                persistent-hint
                :hint="getCurrentSaleMessage"
                v-model="currentSale"
                label="Выберите акцию"
            ></v-select>
            <v-text-field
                v-if="currentSale.changeable"
                v-mask="'######'"
                class="ml-2"
                persistent-hint

                style="max-width: 18%; width: 18%"
                single-line
                v-model="currentSale.value"

                :suffix="currentSale.measure === 'percent' ? '%' : 'руб.'"
            >
            </v-text-field>


            <v-btn @click="addSale" icon>
              <v-icon>
                mdi-plus
              </v-icon>
            </v-btn>
          </div>

          <v-chip-group active-class="primary--text">
            <v-chip
                close
                @click="activeSales.splice(index, 1)"
                @click:close="activeSales.splice(index, 1)"
                close-icon="mdi-delete"
                v-for="(sale, index) in activeSales"
                :key="sale.id"
            >
              {{ sale.name }}
            </v-chip>
          </v-chip-group>


          <div class="d-flex ">
            <v-text-field
                :disabled="!master"
                label="Базовая стоимость"
                hint=""
                v-mask="'######'"
                v-model="price">
            </v-text-field>
            <v-text-field
                :disabled="!master"
                disabled
                label="Итоговая стоимость"
                hint=""
                v-mask="'######'"
                :value="finalPrice">
            </v-text-field>


          </div>


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

          <v-textarea no-resize rows="3" label="Комментарий" v-model="comment">

          </v-textarea>

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
            :disabled="isFormValid()"
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

    <add-contact @closed="showContactModal = false" @saved="savedContact" :client="client"
                 v-if="showContactModal"></add-contact>
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
      activeSales: [],
      comment: '',
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
      salesList: [],
      clients: [],
      pets: [],
      isEditable: false,
      pet: '',
      client: '',
      service: '',
      master: '',
      price: '',
      message: '',
      startTime: '',
      dateMenu: false,
      startDate: '',
      currentSale: {
        id: '',
        value: ''
      },

    }

  },

  computed: {
    getCurrentSaleMessage() {
      let message = '';
      if (this.currentSale.min && this.currentSale.measure === 'number') message += ', минимум который необходимо потратить кэшбека ' + this.currentSale.min + ' рублей';
      if (this.currentSale.min && this.currentSale.measure === 'percent') message += ', максимальный процент по этой акции ' + this.currentSale.min + '%';
      if (this.currentSale.max && this.currentSale.measure === 'number') message += ', баланс кэшбека ' + this.currentSale.max + ' рублей';
      if (this.currentSale.max && this.currentSale.measure === 'percent') message += ', максимальный процент по этой акции ' + this.currentSale.max + '%';
      if (this.currentSale.limit) message += ', можно использовать только на ' + (this.currentSale.limit * 100) + '% от суммы';

      message = message.replace(', ', '')
      message = message ? message[0].toUpperCase() + message.slice(1) : '';
      return message;
    },
    finalPrice() {
      let sum = this.price;
      this.activeSales.forEach((sale) => {
        if (sale.measure === 'number') {
          if (Number(sale.value) > sum * sale.limit) {
            sum -= sum * sale.limit;
          } else if (Number(sale.value) > Number(sale.max)) {
            sum -= Number(sale.max);
          } else sum -= Number(sale.value);
        }
        if (sale.measure === 'percent') {
          if (Number(sale.value) > Number(sale.max)) {
            sum -= sum * Number(sale.max) / 100;
          } else {
            sum -= sum * Number(sale.value) / 100;
          }
        }


      })
      return sum;
    },
    salesListWithoutAlreadyAdded() {
      return this.salesList.filter((el) => !this.activeSales.find((k) => el.id === k.id))
    },
    isAssistentExist() {
      return !!(this.master && this.$store.getters.getHeadElem(this.modalState.start).find((el) => el.id == this.master.id).assistant);
    }
  },
  async created() {
    let stDate = new Date(this.modalState.start)
    this.startDate = (stDate).getFullYear() + '-' + (1 + stDate.getMonth()) + "-" + stDate.getDate()
    this.startTime = (stDate.getHours() < 10 ? "0" + stDate.getHours() : stDate.getHours()) + ':' + (stDate.getMinutes() < 10 ? "0" + stDate.getMinutes() : stDate.getMinutes())

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


      this.$axios.post(window.serverUrl + 'ajax/?controller=GroomingCalendar&action=getPrice&ishook=y', {
        service: this.service.map((el) => el.id),
        salon: this.$store.state.salon,
        date: this.formatDateToSend(this.modalState.start),
        master: this.master.id,
        client: this.client,
      }).then((response) => {
        this.salesList = response.data.salesList;
        this.activeSales = JSON.parse(JSON.stringify(this.modalState.salesList));
        this.activeSales.forEach((act) => {
          let sale = this.salesList.find((oth) => oth.id == act.id);
          if (act.measure === 'number' && sale) {
            sale.max = Number(sale.max) + Number(act.value);
          }
          if (!sale) {
            this.salesList.push(act)
          }
        })
      })


      this.master = JSON.parse(JSON.stringify(this.modalState.master));
      this.price = JSON.parse(JSON.stringify(this.modalState.price));
      this.duration = (this.modalState.EndTime - this.modalState.StartTime) / 1000 / 60;
      this.comment = this.modalState.comment ? this.modalState.comment : '';
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
    search(val) {
      val && val !== this.client && this.querySelections(val)
    },
  },
  methods: {
    addSale() {
      if (Object.keys(this.currentSale).length !== 0) this.activeSales.push(this.currentSale);
      this.currentSale = {}
    },
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
    searchAlghoritm(item, queryText, itemText) {
      return itemText.toLocaleLowerCase().replace(/[{()}-]/g, '').indexOf(queryText.toLocaleLowerCase().replace(/[{()}-]/g, '')) > -1
    },
    formatDateToSend(inner) {
      let date = new Date(inner)
      return date.getFullYear() + "-" + (date.getMonth() < 9 ? '0' + (1 + date.getMonth()) : (1 + date.getMonth())) + "-" + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + 'T' + (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':' + (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()) + '';
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
      this.isAssistentNeeded = false
      this.range = [0, 0];
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
      this.isAssistentNeeded = false
      this.range = [0, 0];

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
      this.isAssistentNeeded = false
      this.range = [0, 0];

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
      this.isAssistentNeeded = false
      this.range = [0, 0];

      let payload = {
        service: this.service.map((el) => el.id),
        salon: this.$store.state.salon,
        date: this.formatDateToSend(this.modalState.start),
        master: this.master.id,
        client: this.client,
      };

      this.$axios.post(window.serverUrl + 'ajax/?controller=GroomingCalendar&action=getPrice&ishook=y', payload).then((response) => {
        this.price = response.data.price;
        this.duration = response.data.duration;
        this.message = response.data.message;
        this.salesList = response.data.salesList;
      })

    },
    isFormValid() {
      if (this.$refs.timefield) {

        return !(this.$refs.timefield.valid && this.service && this.client && this.master && this.pet && this.price)

      }
    },
    async saveElem() {
      let payload = {
        type: 'event',
        salon: this.$store.state.salon,
        start: this.formatDateToSend(this.modalState.start),
        finish: this.formatDateToSend((new Date(this.modalState.start).getTime()) + this.duration * 60 * 1000),
        service: this.service,
        client: this.client,
        master: this.master,
        comment: this.comment,
        pet: this.pet,
        price: this.price,
        isAssistentNeeded: this.isAssistentNeeded,
        master_start: this.formatDateToSend((new Date(this.modalState.start).getTime()) + this.range[0] * 60 * 1000),
        master_finish: this.range[1] ? this.formatDateToSend((new Date(this.modalState.start).getTime()) + this.range[1] * 60 * 1000) : this.formatDateToSend((new Date(this.modalState.start).getTime()) + this.duration * 60 * 1000),
        finalPrice: this.finalPrice,
        activeSales: this.activeSales,
      }
      let id;


      await this.$axios.post(window.serverUrl + 'ajax/?controller=GroomingCalendar&action=addEvent&ishook=y', payload).then((response) => {
        id = response.data.id;
      })


      if (id) {
        payload.Id = id;
        payload.ID = id;
        payload.Subject = id;
        payload.StartTime = new Date(this.modalState.start);
        payload.EndTime = new Date((new Date(this.modalState.start).getTime()) + this.duration * 60 * 1000)
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
        type: 'event',
        id: this.modalState.Id,
        salon: this.$store.state.salon,
        start: this.formatDateToSend(this.modalState.start),
        finish: this.formatDateToSend((new Date(this.modalState.start).getTime()) + this.duration * 60 * 1000),
        service: this.service.map((el) => el.id),
        client: this.client,
        master: this.master,
        pet: this.pet,
        comment: this.comment,
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
        payload.StartTime = new Date(this.modalState.start);
        payload.EndTime = new Date((new Date(this.modalState.start).getTime()) + this.duration * 60 * 1000)
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
