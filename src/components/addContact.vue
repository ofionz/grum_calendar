<template>
  <v-dialog
      v-model="model"
      max-width="600px"
      @click:outside="$emit('closed')"
  >
    <v-card>
      <v-card-title>Добавить контакт</v-card-title>
      <v-card-text>
        <v-text-field v-model='phone'    v-mask="'+79#########'" label="Номер телефона"></v-text-field>
        <v-text-field v-model='name' label="Имя"></v-text-field>
        <v-select :items="sources" item-value="id"  item-text="name"
                  v-model="source" label="Откуда узнал о нас"></v-select>
        <v-btn class="mb-5" :color="!pets.length ?'primary':''" @click="pets.push({type: '', breed: '', name: '', breeds: [] })">{{!pets.length ? "Добавить питомца" : "Добавить ещё питомца"}} </v-btn>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px">
          <v-card tile v-for="(pet, index) in pets" width="100%">
            <v-card-text>
              <div class="d-flex">
              <v-card-subtitle> Питомец {{ index + 1 }}</v-card-subtitle>
              <v-btn @click="pets.splice(index,1)" style="margin-left: auto" icon> <v-icon>mdi-delete</v-icon></v-btn>
              </div>
              <v-autocomplete :items="types" item-value="id" @change="changeBreeds (index)" item-text="name"
                        v-model="pet.type" label="Животное"></v-autocomplete>
              <v-autocomplete :disabled="!pet.type" v-model="pet.breed" :items="pet.breeds"  item-text="name" item-value="id"
                        label="Порода"></v-autocomplete>
              <v-text-field :disabled="!pet.breed" v-model="pet.name" label="Кличка"></v-text-field>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn :disabled="!isFormValid" @click="addContact" color="green darken-1"
               text>Добавить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "addContact",


  data() {
    return {
      phone: '',
      source:'',
      sources: [],
      types: [],
      name: '',
      model: true,
      pets: []
    }
  },
  computed: {
    isFormValid() {
      return !!(this.name && this.phone && this.source &&  this.phone.length===12  && !this.pets.filter((el) => !el.type || !el.breed || !el.name).length);

    }
  },
  mounted() {

      this.$axios.post(window.serverUrl +'ajax/?controller=GroomingCalendar&action=getAnimalTypes&ishook=y').then((response) => {
        this.types = response.data;
      })
      this.$axios.post(window.serverUrl +'ajax/?controller=GroomingCalendar&action=getSources&ishook=y').then((response) => {
        this.sources = response.data;
      })

  },
  methods: {

    changeBreeds(index) {

        let payload = {
          id: this.pets[index].type
        };
        this.$axios.post(window.serverUrl +'ajax/?controller=GroomingCalendar&action=getBreeds&ishook=y', payload).then((response) => {
          this.pets[index].breeds = response.data;

        })

    },
    addContact() {
      let payload = {
        phone: this.phone,
        source: this.source,
        name: this.name,
        pets: this.pets,
      };

        this.$axios.post(window.serverUrl +'ajax/?controller=GroomingCalendar&action=addContact&ishook=y', payload).then((response) => {
          payload.id = response.data.id;
          this.$emit('saved', payload);
        })

    }
  }
}
</script>

<style scoped>

</style>
