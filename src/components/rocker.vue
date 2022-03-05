<template>
  <div class="container">
    <!-- 抽奖机 -->
    <div class="draw-box">
      <div class="inner">
        <img ref="box" src="@/assets/res/2.png" class="machine" alt="抽奖机" />
        <!-- 需要控制单独的数字停止，则需要单独的分开计算 -->
        <div ref="number" class="number-field">
          <div
            class="number-col"
            ref="numberCol"
            v-for="(digitgroup, index) in digits"
            :key="`col-${index}`"
          >
            <div class="digit" v-for="d in digitgroup" :key="`${index}-${d}`">
              {{ d }}
            </div>
          </div>
        </div>
        <img
          v-show="!is_runing"
          @click="toggle_state"
          src="@/assets/res/1.png"
          class="machine_button"
          alt="按钮"
        />
        <img
          v-show="is_runing"
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
      default: 99,
      type: [Number, String],
    },
    min: {
      default: 1,
      type: [Number, String],
    },
    ban: {
      default: () => [],
      type: Array,
    },
  },
  data() {
    return {
      number: 0,
      number_timeout: null,
      running_timeout: null,
      history: [0],
      // 防止滚动数字
      prevent_default: (el) => {
        el.preventDefault();
        el.stopPropagation();
        return false;
      },
      // 使用对象方便进行值修改
      digit_count: 3,
      speeds: [],
      speeds_config: {
        min: 20,
        step: 10,
        max: 260,
      },
      digits: [],
      is_runing: false,
      scroll_timeout: null,
      state_lock: false,
    };
  },
  mounted() {
    this.init();
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
    init() {
      // 初始化每个数字的速度
      for (let i = 0; i < this.digit_count; ++i) {
        this.speeds.push({
          value: this.speeds_config.min,
          lock: {
            value: false,
          },
          timeout: null,
          scroll_timeout: null,
          running_lock: false,
        });
        let digits = [];
        for (let j = 0; j < 10; ++j) {
          digits.push((j + 5) % 10);
        }
        this.digits.push(digits);
      }
      this.$nextTick(() => {
        for (let col of this.$refs.numberCol) {
          col.scrollTop = col.scrollHeight / 2;
          const { height } = col
            .querySelector(".digit")
            .getBoundingClientRect();
          // 将数字绑定到中间，利于滚动
          // 对齐偏移量
          let offset = Math.floor(height / 20);
          col.scrollTop = height * 5 + offset;
        }
      });
    },
    // 动态设置数字的位置
    init_number() {
      this.$refs.number.addEventListener("wheel", this.prevent_default);
      window.addEventListener("resize", this.rejust);
      this.number_timeout = setInterval(() => {
        let rect = this.$refs.box.getBoundingClientRect();
        let number = this.$refs.number;
        number.style.fontSize = `${rect.width / 5}px`;
        number.style.lineHeight = number.style.fontSize;
        this.$refs.text.style.fontSize = `${rect.width / 8}px`;
      }, 100);
    },
    rejust() {
      let timeout = setTimeout(() => {
        let rect = this.$refs.box.getBoundingClientRect();
        let number = this.$refs.number;
        number.style.fontSize = `${rect.width / 5}px`;
        number.style.lineHeight = number.style.fontSize;
        this.$refs.text.style.fontSize = `${rect.width / 8}px`;
        for (let col of this.$refs.numberCol) {
          col.scrollTop = col.scrollHeight / 2;
          const { height } = col
            .querySelector(".digit")
            .getBoundingClientRect();
          // 将数字绑定到中间，利于滚动
          // 对齐偏移量
          let offset = Math.floor(height / 20);
          col.scrollTop = height * 5 + offset;
        }
        clearTimeout(timeout);
      }, 50);
    },
    get_random(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    },
    /**
     * @summary 在一直确定高位的情况下，获取下一位的数值范围，初始的范围为[0,9]，由于[min,max]为导致范围改变
     * @param {number} cur 当前的数值，从高位先获取，未获取的数位统一为0，例如只获取百位5，则为500
     * @param {number} i 需要获取的位数
     * @param {Array} range 当前的范围
     */
    get_single_digit_range(cur, i) {
      let maxadd = [9, 99, 999];
      // 首先获取最大值在该位的
      let min = parseInt(this.min);
      let max = parseInt(this.max);
      min = max(cur, min);
      max = min(cur + maxadd[i], max);
      return [this.get_digit(min, i), this.get_digit(max, i)];
    },
    /**
     * @summary 获取千位数内的某个位的数字
     * @param {number} number 数字
     * @param {number} i 位数
     * @returns {number} 返回某个位的数字
     */
    get_digit(number, i) {
      let oct = [1, 10, 100, 1000];
      number = Math.floor(number / oct[i]) % 10;
      return number;
    },
    async linear_change_value(obj, step, target, ms, lock) {
      // 必须确保obj.value+n*step==target
      if (Math.abs(obj.value - target) % Math.abs(step) !== 0) {
        console.error("步数设置错误，必须是差值的整数倍");
        return;
      }
      if (obj.value == target) return;
      if (obj.value > target) {
        step = -Math.abs(step);
      } else {
        step = Math.abs(step);
      }
      if (lock.value) return;
      return await new Promise((resolve) => {
        lock.value = true;
        let timer = setInterval(() => {
          if (obj.value == target) {
            lock.value = false;
            clearInterval(timer);
            resolve();
          }
          obj.value += step;
        }, ms);
      });
    },
    async toggle_state() {
      if (this.state_lock) return;
      // 检测是否有锁
      for (let i = 0; i < this.digit_count; ++i) {
        if (this.speeds[i].lock.value) {
          return;
        }
      }
      this.is_runing = !this.is_runing;
      let func = async (i) => {
        this.running_lock = true;
        await this.next_digit(
          this.$refs.numberCol[i],
          this.digits[i],
          this.speeds[i]
        );
        if (this.speeds[i].is_runing) {
          func(i);
        } else {
          this.running_lock = false;
        }
      };
      if (this.is_runing) {
        for (let i = 0; i < this.digit_count; ++i) {
          this.speeds[i].is_runing = true;
          this.speeds[i].value = this.speeds_config.max;
          // 缓慢启动到快速
          this.linear_change_value(
            this.speeds[i],
            this.speeds_config.step,
            this.speeds_config.min,
            40,
            this.speeds[i].lock
          );
          func(i);
        }
      } else {
        this.state_lock = true;
        let random_number = this.get_random(
          parseInt(this.min),
          parseInt(this.max)
        );
        while (this.ban.findIndex((e) => e == random_number) != -1) {
          random_number = this.get_random(
            parseInt(this.min),
            parseInt(this.max)
          );
        }
        for (let i = 0; i < this.digit_count; ++i) {
          let cur_digit = this.get_digit(random_number, 2 - i);
          await this.linear_change_value(
            this.speeds[i],
            this.speeds_config.step,
            this.speeds_config.max,
            40,
            this.speeds[i].lock
          );
          this.speeds[i].is_runing = false;
          await new Promise((resolve) => {
            let check = setInterval(() => {
              if (!this.speeds[i].running_lock) {
                resolve();
                clearInterval(check);
              }
            }, 100);
          });
          while (cur_digit != this.digits[i][5]) {
            await this.next_digit(
              this.$refs.numberCol[i],
              this.digits[i],
              this.speeds[i]
            );
          }
        }
        this.state_lock = false;
      }
    },
    async next_digit(el, digits, speed) {
      // 先划到下一个数字
      const { height } = el.querySelector(".digit").getBoundingClientRect();
      let offset = 0;
      await this.scroll_from_to(el, el.scrollTop, height * 6 + offset, speed);
      // 利用滚动不变性，动态添加元素而又不改变显示
      let first = digits[0];
      digits.splice(0, 1);
      digits.push(first);
    },
    /**
     * @summary 线性从一个位置滚动到指定的位置
     */
    async scroll_from_to(el, start, end, speed) {
      return await new Promise((resolve) => {
        if (speed.scroll_timeout !== null) {
          clearInterval(speed.scroll_timeout);
          speed.scroll_timeout = null;
        }
        let step = Math.max(Math.floor((end - start) / speed.value), 1);
        let func = () => {
          el.scrollTop = el.scrollTop + step;
          if (speed.scroll_timeout && el.scrollTop >= end) {
            el.scrollTop = end;
            clearInterval(speed.scroll_timeout);
            resolve();
          }
        };
        speed.scroll_timeout = setInterval(func, 1);
      });
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
  width: min(60vh,50vw);
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
    // overflow-y: scroll;
    // 隐藏滚动条
    // -ms-overflow-style: -ms-autohiding-scrollbar;
    // &::-webkit-scrollbar {
    //   display: none;
    // }
    // justify-content: space-around;
    // align-items: center;
    width: 80%;
    top: 17%;
    left: 10%;
    height: 17%;
    font-size: 10rem;
    color: rgb(95, 95, 95);
    font-family: "微软雅黑";
    .number-col {
      width: calc(33% - 2px);
      margin: 0 1px;
      position: relative;
      // background: red;
      height: 100%;
      text-align: center;
      overflow: scroll;
      -ms-overflow-style: -ms-autohiding-scrollbar;
      &::-webkit-scrollbar {
        display: none;
      }
    }
    .number {
      position: relative;
      width: calc(33% - 2px);
      text-align: center;
      margin: 0 1px;
      margin-top: 0px;
      margin-bottom: 50px;
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
