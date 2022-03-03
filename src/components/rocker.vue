<template>
  <div class="container">
    <!-- 抽奖机 -->
    <div class="draw-box">
      <div class="inner">
        <img ref="box" src="@/assets/res/2.png" class="machine" alt="抽奖机" />
        <div ref="number" class="number-field">
          <div class="number" v-for="index in 3" :key="index">
            <div
              :style="{ transition: `transform ${speed}ms linear` }"
              v-for="(item, l) in history"
              :key="`${index}-${l}`"
            >
              {{ get_digit(history[l], 3 - index) }}
            </div>
          </div>
        </div>
        <img
          v-if="cur_state == 0"
          @click="toggle_state"
          src="@/assets/res/1.png"
          class="machine_button"
          alt="按钮"
        />
        <img
          v-else
          @click="toggle_state"
          src="@/assets/res/3.png"
          class="machine_button"
          alt="按钮"
        />
        <div ref="text" class="text">摇摇大快乐</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "rocker",
  props: {
    max: {
      default: 999,
      type: [Number, String],
    },
    min: {
      default: 1,
      type: [Number, String],
    },
  },
  data() {
    return {
      speed: 100,
      cur_state: 0,
      number: 0,
      number_timeout: null,
      running_timeout: null,
      history: [0],
      lock: false,
      stop_speed: 300,
      start_speed: 50,
      step_speed: 5,
      prevent_default: (el) => {
        el.preventDefault();
        el.stopPropagation();
        return false;
      },
    };
  },
  mounted() {
    this.init_number();
  },
  beforeDestroy() {
    this.$refs.number.removeEventListener("wheel", this.prevent_default);
    window.removeEventListener("resize", this.rejust);
    if (this.number_timeout) {
      clearInterval(this.number_timeout);
    }
    if (this.running_timeout) {
      clearTimeout(this.running_timeout);
    }
  },
  methods: {
    get_digit(number, i) {
      let oct = [1, 10, 100, 1000];
      number = Math.floor(number / oct[i]) % 10;
      return number;
    },
    toggle_state() {
      if (this.lock) return;
      this.cur_state = (this.cur_state + 1) & 1;
      if (this.cur_state == 1) {
        this.speed = this.start_speed;
        let func = () => {
          this.next_random();
          this.running_timeout = setTimeout(func, this.speed);
        };
        this.running_timeout = setTimeout(func, this.speed);
      } else {
        this.lock = true;
        //   当按住停止时，速度慢慢减慢最终停止
        let timeout = setInterval(() => {
          if (this.speed == this.stop_speed) {
            clearTimeout(this.running_timeout);
            this.running_timeout = null;
            clearInterval(timeout);
            this.lock = false;
            // 删除历史
            setTimeout(() => {
              this.history = [this.history[this.history.length - 1]];
              this.rejust();
            }, this.speed);
          } else {
            this.speed += this.step_speed;
          }
        }, 50);
      }
    },
    // 动态设置数字的位置
    init_number() {
      this.$refs.number.addEventListener("wheel", this.prevent_default);
      window.addEventListener("resize", this.rejust);
      this.number_timeout = setInterval(() => {
        let rect = this.$refs.box.getBoundingClientRect();
        let number = this.$refs.number;
        number.style.fontSize = `${rect.width / 5}px`;
        this.$refs.text.style.fontSize = `${rect.width / 8}px`;
        number.style.lineHeight = number.style.fontSize;
      }, 100);
    },
    rejust() {
      let timeout = setTimeout(() => {
        let rect = this.$refs.box.getBoundingClientRect();
        let number = this.$refs.number;
        number.style.fontSize = `${rect.width / 5}px`;
        this.$refs.text.style.fontSize = `${rect.width / 8}px`;
        number.style.lineHeight = number.style.fontSize;
        let { height } = this.$refs.number.getBoundingClientRect();
        this.$refs.number.scrollTop =
          this.$refs.number.scrollHeight - height * 1.1;
        clearTimeout(timeout);
      }, 100);
    },
    /**
     * @summary 等概率获取下个随机数
     */
    next_random() {
      let random = Math.floor(
        parseInt(this.min) +
          Math.random() * (parseInt(this.max) - parseInt(this.min) + 1)
      );
      this.number = random;
      this.history.push(this.number);
      let { height } = this.$refs.number.getBoundingClientRect();

      this.scroll_from_to(
        this.$refs.number,
        this.$refs.number.scrollTop,
        this.$refs.number.scrollHeight - height / 8,
        this.speed
      );
    },
    scroll_from_to(el, start, end, ms) {
      let step = Math.max(Math.floor((end - start) / ms) * 1, 1);
      let timeout = null;
      let func = () => {
        el.scrollTop = el.scrollTop + step;
        if (timeout && el.scrollTop >= end) {
          el.scrollTop = end;
          clearInterval(timeout);
        }
      };
      timeout = setInterval(func, 1);
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  position: relative;
  //   display: flex;
  width: 100%;
  height: 100%;
}
.draw-box {
  position: absolute;
  width: max(36vw, 60vh);
  //   left: 32%;
  left: 50%;
  transform: translate(-50%, -50%);
  top: 50%;
  //   background: red;
  .inner {
    position: relative;
  }
  .text {
    position: absolute;
    top: 80%;
    font-weight: bold;
    letter-spacing: 10px;
    width: 100%;
    text-align: center;
    color: rgb(180, 75, 13);
  }
  .machine {
    width: 100%;
    margin: 0 auto;
  }
  .number-field {
    position: absolute;
    display: flex;
    padding: 0;
    // background: red;
    overflow-y: scroll;
    // 隐藏滚动条
    -ms-overflow-style: -ms-autohiding-scrollbar;
    &::-webkit-scrollbar {
      display: none;
    }
    // justify-content: space-around;
    // align-items: center;
    width: 80%;
    top: 17%;
    left: 10%;
    height: 17%;
    font-size: 10rem;
    color: rgb(95, 95, 95);
    font-family: "微软雅黑";
    // transition: all 10ms linear;
    .number {
      position: relative;
      width: calc(33% - 2px);
      text-align: center;
      margin: 0 1px;
      margin-top: 0px;
      margin-bottom: 50px;
      //   transform: translateY(18vw);
    }
  }
  .machine_button {
    position: absolute;
    width: 20%;
    top: 58%;
    cursor: pointer;
    left: 40%;
    transition: all 0s;
    &:hover {
      opacity: 0.8;
    }
    &:active {
      margin-top: 1%;
      transform: scale(0.8);
      opacity: 0.6;
      transition: all 200ms linear;
    }
  }
}
</style>
