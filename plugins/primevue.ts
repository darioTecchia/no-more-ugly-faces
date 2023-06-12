import { defineNuxtPlugin } from "#app";
import PrimeVue from "primevue/config";
import Button from "primevue/button";
import Carousel from "primevue/carousel";
import Calendar from "primevue/calendar";
import InputText from "primevue/inputtext";
import Menu from "primevue/Menu";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, { ripple: true });
  //other components that you need
  // nuxtApp.vueApp.component("Button", Button);
  // nuxtApp.vueApp.component("Carousel", Carousel);
  // nuxtApp.vueApp.component("Calendar", Calendar);
  // nuxtApp.vueApp.component("InputText", InputText);
  // nuxtApp.vueApp.component("Menu", Menu);
});