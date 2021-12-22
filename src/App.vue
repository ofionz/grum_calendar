<template>
  <v-app id="app">
    <v-alert  style="position: absolute;  z-index: 999999999; top: 50vh; left: 45vw" :value="alert" transition="scale-transition"  prominent type="error">
    {{error}}
    </v-alert>
    <div  class="d-flex ">
      <v-autocomplete :items="salons" item-text="name" item-value="id" @change="fetchData" v-model="selectedSalon"
                      style="width: 50%" class="ma-2 mr-5" filled label="Салоны"></v-autocomplete>
      <v-autocomplete :items="masters" item-text="name" item-value="id" @change="fetchData" multiple v-model="selectedMaster"
                      style="width: 50%" class="ma-2 " filled label="Мастера"></v-autocomplete>
    </div>

    <Table v-if="renderKey" :key="renderKey"></Table>
  </v-app>
</template>

<script>
import Table from "./components/Table";

export default {
  components: {
    Table
  },
  data: () => {
    return {
      error: '',
      alert: false,
      renderKey: 0,
      selectedSalon: '',
      selectedMaster: [],
      salons: [],
      masters: []
    }
  },
  methods: {
    onError (text) {
    this.error = text;
    this.alert = true;
    setTimeout (() => this.alert = false, 3000)
    },
    async fetchTableData() {
      return await this.$store.dispatch('fetchEvents',{salon: this.selectedSalon, master:  this.selectedMaster}).then((el,) => {
        if (el) {
          return true;
        }
        else console.log("Ошибка получения данных")
      })
    } ,
    async fetchHead() {
      return await this.$store.dispatch('fetchHead', {salon: this.selectedSalon, master:  this.selectedMaster}).then((el) => {
        if (el) {
          return true;
        }
        else console.log("Ошибка получения данных")
      })
    } ,
    async fetchData() {
      if (await this.fetchTableData() && await this.fetchHead()) {
        this.$store.commit('setSalon', this.selectedSalon)
        this.renderKey++;
      }

    }
  },
  created: async function () {
    this.$event_bus.$on ('error', this.onError)
    await this.$store.dispatch('fetchInitData').then((el) => {
      this.salons = el.salons;
      this.selectedSalon = this.salons[0];
      this.masters = el.masters;
      this.fetchData();

    })
  }
}
</script>

<style>
html {
  overflow: unset !important;
}

.master-field{
  flex-direction: column!important;
  display: flex!important;
  position: relative;
}
.master-field:not(:last-child){
  margin-bottom: 5px;
}
.master-field span{
  color:#4e4e4e!important;
  padding-left: 10px;
}
.master-field .master-field-underline,  .master-field .master-field-square{
  position: absolute;
  display: block;
  content: "";
  padding: 0!important;
}
.master-field-square{
  height: 6px;
  width: 6px;
  top: 2px;
}
.master-field-underline{
  width: 86%;
  height: 0;
  top: auto;
  right: 0;
  bottom: -2px;
}

.MonthCell .e-appointment-wrapper {
  display: none;
}
.head-cont {
  padding: 4px;
  line-height: 10px; font-size: 9px
}

.template-wrap  {
  padding: 2px;
  font-size: 8px;
  box-shadow: 0 0 3px -1px #4e4e4e inset;
  color: #4e4e4e;
}

.template-wrap .d-flex{
  padding-top: 0;
  gap: 5px;
}


.e-schedule .e-vertical-view .e-left-indent {
  width: 165px !important;
}

.e-top-handler {
  height: 6px !important;
}

.e-appointment {
  /*background-color: rgba(50, 179, 252, 0.84) !important;*/
  /*width: 100%!important;*/
}

.e-appointment-details {
  padding: 0 !important;
  height: 100%;
}

.e-schedule .e-vertical-view .e-time-cells-wrap table td, .e-schedule .e-vertical-view .e-work-cells {
  min-height: 7px !important;
  height: 7px !important;
}

[data-tooltip] {
  position: relative;
}

[data-tooltip]::after {
  content: attr(data-tooltip);
  position: absolute;
  width: 300px;
  left: 0;
  top: 0;
  background: #3989c9;
  color: #fff;
  padding: 0.5em;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  opacity: 0;
  transition: 1s;
  z-index: 99;
}

[data-tooltip]:hover::after {
  opacity: 1;
  top: 2em;
}
</style>

<style src="../src/assets/styles.css"></style>

