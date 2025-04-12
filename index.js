import { createApp } from "vue";
import { GraffitiLocal } from "@graffiti-garden/implementation-local";
import { GraffitiRemote } from "@graffiti-garden/implementation-remote";
import { GraffitiPlugin } from "@graffiti-garden/wrapper-vue";

const channels = ["designftw"];

createApp({
  data() {
    return {
      myMessage: "",
      sendDisabled: false,
      sentMessageObjects: [],
      messageObjects: [],
    };
  },

  methods: {
    async sendMessage(session) {
      this.sendDisabled = true;
      document.querySelector("span.loading").classList.remove("display-none");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await this.$graffiti.put(
        {
          value: {
            content: this.myMessage,
            published: Date.now(),
          },
          channels,
        },
        session
      );
      this.myMessage = "";
      this.sendDisabled = false;
      document.querySelector("span.loading").classList.add("display-none");
    },

    async getMessages() {
      const messageObjectsIterator = this.$graffiti.discover(channels, {
        value: {
          properties: {
            content: { type: "string" },
            published: { type: "number" },
          },
        },
      });

      const newMessageObjects = [];
      for await (const { object } of messageObjectsIterator) {
        new Promise((resolve) => setTimeout(resolve, 1000));
        newMessageObjects.push(object);
      }

      newMessageObjects.sort((a, b) => a.published - b.published);

      this.messageObjects = newMessageObjects;
    },

    *getMessageObjectsIterator() {
      for (const object of this.sentMessageObjects) {
        yield { object };
      }
    },

    formatActor(actor) {
      return actor.replace("https://id.inrupt.com/", "");
    },
  },
})
  .use(GraffitiPlugin, {
    // graffiti: new GraffitiLocal(),
    graffiti: new GraffitiRemote(),
  })
  .mount("#app");
