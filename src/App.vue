<template>
  <v-app id="app">
    <div class="d-flex ">
      <v-autocomplete :items="salons"  style="width: 50%"  class="ma-2 mr-5" filled label="Салоны"></v-autocomplete>
      <v-autocomplete :items="masters" style="width: 50%" class="ma-2 "  filled multiple label="Мастера"></v-autocomplete>
    </div>

    <Table></Table>
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
      salons: [
          {text: "Салон 1", value: 1},
          {text: "Салон 2", value: 2},
          {text: "Салон 3", value: 3},
          {text: "Салон 4", value: 4},
          {text: "Салон 5", value: 5},

      ],
      masters: [
          'Мастер 1',
          'Мастер 2',
          'Мастер 3',
          'Мастер 4',
          'Мастер 5',
      ]


    }
  },
  created: async function () {

  }
}
</script>

<style>
html {
  overflow: unset !important;
}
.e-schedule .e-vertical-view .e-left-indent {
  width: 165px !important;
}
.e-top-handler{
  height: 6px!important;
}
.e-appointment {
  /*background-color: rgba(50, 179, 252, 0.84) !important;*/
  /*width: 100%!important;*/
}

.e-schedule .e-vertical-view .e-time-cells-wrap table td, .e-schedule .e-vertical-view .e-work-cells {
  min-height: 7px !important;
  height: 7px !important;
}
</style>

<style src="../src/assets/styles.css"></style>

