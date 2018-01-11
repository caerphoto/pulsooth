/*global Vue */
'use strict';

function getTextOf(id) {
  var el = window.document.getElementById(id);
  if (!el) {
    throw new Error('No element with ID "' + id + '" found.');
  }
  return el.innerHTML;
}

Vue.component('color-patch', {
  template: getTextOf('template-color-patch'),
  props: ['index', 'color']
});

Vue.component('color-picker', {
  template: getTextOf('template-color-picker'),
  props: ['visible'],
  data: function () {
    return {
      hue: 0,
      saturation: 80,
      lightness: 50
    };
  },
  computed: {
    hslColor: function () {
      return `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
    }
  }
});

Vue.component('pulser', {
  template: getTextOf('template-pulser'),
  props: ['color', 'speed'],
  data: function () {
    return {
      isFull: false
    };
  },
  computed: {
    transitionDuration: function () {
      return (11 - this.speed) + 's';
    }
  },
  methods: {
    toggleFull: function () {
      this.isFull = !this.isFull;
    }
  }
});

var app = new Vue({
  el: '#app',
  data: {
    speed: 10,
    cycleMethod: 'loop',
    bounceIncrement: 1,
    colorList: [
      { color: 'hsl(200, 100%, 70%)' },
      { color: 'hsl(40, 100%, 50%)' },
      { color: 'hsl(300, 30%, 85%)' }
    ],
    colorIndex: 0,
    loaded: true,
    timer: null
  },
  computed: {
    currentColor: function () {
      return this.colorList[this.colorIndex].color;
    },
    interval: function () {
      return (11 - this.speed) * 1000;
    }
  },
  methods: {
    addColor: function (hslColor) {
      this.colorList.push({ color: hslColor });
    },
    removeColor: function (index) {
      this.colorIndex = 0;
      this.colorList.splice(index, 1);
    },
    nextColor: function () {
      var newIndex;

      if (this.cycleMethod === 'loop') {
        if (this.colorIndex < this.colorList.length - 1) {
          this.colorIndex += 1;
        } else {
          this.colorIndex = 0;
        }
      } else {
        newIndex = this.colorIndex + this.bounceIncrement;
        if (newIndex < 0) {
          this.bounceIncrement = -this.bounceIncrement;
          this.colorIndex = Math.min(this.colorList.length, 1);
        } else if (newIndex >= this.colorList.length) {
          this.bounceIncrement = -this.bounceIncrement;
          this.colorIndex = Math.max(this.colorList.length - 2, 0);
        } else {
          this.colorIndex = newIndex;
        }
      }
    },
    updateTimerInterval: function () {
      clearInterval(this.timer);
      this.timer = setInterval(this.nextColor.bind(this), this.interval, this);
    }
  },
  created: function () {
    this.updateTimerInterval();
  }
});
