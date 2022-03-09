<template>
  <div class="home">
    <div class="bg"></div>
    <rocker :min="min" :max="max"></rocker>
    <!-- <fv-command-bar
      background="rgba(0,0,0,0.01)"
      class="tool-bar"
      :options="options"
    >
    </fv-command-bar> -->
    <img class="setting" src="@/assets/res/setting.png" @click="show = true" />
    <fv-web-window
      v-model="show"
      title="设置"
      style="width: 380px; height: 180px"
    >
      <div class="window-box">
        <fv-text-box prefix="最小值" v-model="min" class="item"></fv-text-box>
        <fv-text-box prefix="最大值" v-model="max" class="item"></fv-text-box>
      </div>
    </fv-web-window>
  </div>
</template>

<script>
import Rocker from "../components/rocker.vue";
export default {
  name: "Home",
  components: {
    Rocker,
  },
  data() {
    return {
      min: "0",
      max: "99",
      show: false,
      options: [
        {
          name: "设置",
          icon: "Settings",
          func: () => {
            this.show = true;
          },
        },
      ],
    };
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
.home {
  position: relative;
  height: 100vh;
  overflow: hidden;
  width: 100vw;
}
.setting {
  z-index: 1;
  position: absolute;
  bottom: 10px;
  left: 10px;
  width: 32px;
  cursor: pointer;
  &:hover {
    transform: rotate(720deg) scale(0.72);
    transition: all 1s;
  }
}
.bg {
  z-index: -1;
  position: absolute;
  height: 100%;
  width: 100%;
  background: url("~@/assets/res/11bg.png");
  background-size: 100%;
  background-repeat: no-repeat;
}
.tool-bar {
  position: absolute;
  bottom: 0;
}
.window-box {
  margin-top: 50px;
  .item {
    margin: 10px;
  }
  .item-group {
    margin: 10px;
    display: flex;
    justify-content: space-around;
  }
}
</style>
