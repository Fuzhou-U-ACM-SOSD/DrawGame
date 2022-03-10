<template>
  <div class="home">
    <div class="bg"></div>
    <rocker :min="min" :max="max" :ban.sync="ban" :repeat="repeat"></rocker>
    <!-- <fv-command-bar
      background="rgba(0,0,0,0.01)"
      class="tool-bar"
      :options="options"
    >
    </fv-command-bar> -->
    <img class="setting" src="@/assets/res/setting.png" @click="show = !show" />
    <!-- <fv-web-window
      v-model="show"
      title="设置"
      style="width: 380px; height: 180px"
    >
      <div class="window-box">
        <fv-text-box prefix="最小值" v-model="min" class="item"></fv-text-box>
        <fv-text-box prefix="最大值" v-model="max" class="item"></fv-text-box>
      </div>
    </fv-web-window> -->
    <div class="command-bar" :class="{ show: show }">
      <div class="box">
        <div
          v-show="show"
          class="icon ms-Icon ms-Icon--ChevronRight"
          @click="show = !show"
        ></div>
        <div
          v-show="!show"
          class="icon ms-Icon ms-Icon--ChevronLeft"
          @click="show = !show"
        ></div>
        <div class="flex-box">
          <fv-text-box
            underline
            prefix="最小值"
            v-model="min"
            class="item"
            background="transparent"
          ></fv-text-box>
          <fv-text-box
            underline
            prefix="最大值"
            v-model="max"
            class="item"
            background="transparent"
          ></fv-text-box>
          <fv-check-box class="item" v-model="repeat">
            是否重复选号
          </fv-check-box>
          <fv-button
            style="width: 300px"
            background="rgba(255,255,255,0.2)"
            class="item"
            @click="clearBan"
            >清除历史选号</fv-button
          >
          <fv-animated-icon icon="History" class="history item">
          </fv-animated-icon>
          <div class="number-box item">
            <div v-for="(item, index) in ban" :key="index" class="number">
              {{ item }}
            </div>
          </div>
        </div>
      </div>
    </div>
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
      repeat: false,
      showDraw: true,
      ban: [],
      options: [
        {
          name: "设置",
          icon: "Settings",
          func: () => {
            this.show = !this.show;
          },
        },
      ],
    };
  },
  watch: {
    ban(val) {
      console.log(val);
      localStorage.setItem("ban", JSON.stringify(val));
    },
  },
  mounted() {
    if (localStorage.getItem("ban")) {
      try {
        this.ban = JSON.parse(localStorage.getItem("ban"));
        if (!Array.isArray(this.ban)) {
          this.ban = [];
        }
      } catch {
        this.ban = [];
      }
    }
  },
  methods: {
    clearBan() {
      this.ban = [];
    },
  },
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

.command-bar {
  position: absolute;
  bottom: 0;
  height: 50px;
  width: calc(100% - 50px);
  background-color: rgba(255, 190, 184, 0.1);
  backdrop-filter: blur(10px);
  right: 0;
  display: flex;
  align-items: center;
  transform: translate(calc(100% - 36px), 0);
  transition: all 1s;
  .box {
    width: 100%;
    position: relative;
    height: 100%;

    .icon {
      position: absolute;
      top: 50%;
      transform: translate(0, -50%);
      left: 10px;
      cursor: pointer;
      &:hover {
        transition: all 0.3s;
        transform: translate(0, -50%) scale(1.3);
      }
    }
    .history {
      cursor: pointer;
      opacity: 0.8;
      &:hover {
        transition: all 0.3s;
        transform: scale(1.3);
        opacity: 1;
      }
    }
    .flex-box {
      display: flex;
      margin-left: 50px;
      align-items: center;
      height: 100%;
      .item {
        margin-right: 30px;
      }
    }
  }
  &.show {
    transform: translate(0, 0);
  }
  .number-box {
    display: flex;
  }
  .number {
    margin: 0 5px;
  }
}
</style>
