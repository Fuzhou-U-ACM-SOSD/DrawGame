<template>
  <div class="home">
    <div class="bg"></div>
    <rocker :min="min" :max="max"></rocker>
    <fv-command-bar class="tool-bar" :options="options"> </fv-command-bar>
    <fv-web-window
      v-model="show"
      theme="dark"
      title="设置"
      style="
        width: 380px;
        height: 180px;
        background-color: rgba(255, 125, 135, 0.9);
      "
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
      max: "1000",
      show: false,
      options: [
        {
          name: "设置",
          icon: "Settings",
          func: () => {
            this.show = true;
          },
        },
        // {
        //   name: "摇杆",
        //   icon: "CircleFill",
        // },
        // {
        //   name: "转盘",
        //   icon: "CircleFill",
        // },
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
.bg {
  z-index: -1;
  position: absolute;
  height: 100%;
  width: 100%;
  background: url("~@/assets/res/mainbg.jpg");
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
