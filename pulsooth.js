/*global Vue */
'use strict';

function getTextOf(id) {
  var el = window.document.getElementById(id);
  if (!el) {
    throw new Error('No element with ID "' + id + '" found.');
  }
  return el.innerHTML;
}

function intervalFromSpeed(speed) {
  // Return an invertal in seconds based on the given arbitrary speed value.
  speed = Math.min(speed, 10);
  speed = Math.max(speed, 1);
  return (11 - speed) / 2;
}

var eventBus = new Vue();

Vue.component('color-patch', {
  template: getTextOf('template-color-patch'),
  props: ['index', 'color'],
  computed: {
    colorValues: function () {
      // Assume color property is in HSL format
      var values;
      var bareColor;
      if (!/hsl/.test(this.color)) {
        return;
      }

      bareColor = this.color.
        replace('hsl(', '').
        replace(/%/g, '').
        replace(')', '').
        replace(/ /g, '');

      values = bareColor.split(',').map(Number);
      return values;
    }
  },
  methods: {
    emitColorValues: function () {
      eventBus.$emit('color-values', this.colorValues);
    }
  }
});

Vue.component('color-picker', {
  template: getTextOf('template-color-picker'),
  data: function () {
    return {
      hue: 100,
      saturation: 80,
      lightness: 85
    };
  },
  computed: {
    hslColor: function () {
      return `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
    }
  },
  methods: {
    confirmColor: function (event) {
      event.preventDefault();
      this.$emit('confirm-color', this.hslColor);
    }
  },
  created: function () {
    var picker = this;
    eventBus.$on('color-values', function (newValues) {
      picker.hue = newValues[0];
      picker.saturation = newValues[1];
      picker.lightness = newValues[2];
    });
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
      return intervalFromSpeed(this.speed) + 's';
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
    speed: 8,
    cycleMethod: 'loop',
    bounceIncrement: 1,
    colorList: [
      { color: 'hsl(200, 80%, 80%)' },
      { color: 'hsl(40, 100%, 70%)' },
      { color: 'hsl(300, 30%, 85%)' }
    ],
    colorIndex: 0,
    loaded: true,
    animationTimestamp: null
  },
  computed: {
    currentColor: function () {
      return this.colorList[this.colorIndex].color;
    },
    interval: function () {
      return intervalFromSpeed(this.speed) * 1000;
    }
  },
  methods: {
    addColor: function (hslColor) {
      this.colorList.push({ color: hslColor });
    },
    removeColor: function (index) {
      this.colorIndex = 0;
      if (this.colorList.length > 0) {
        this.colorList.splice(index, 1);
      }
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
    checkAnimation: function (timestamp) {
      if (!this.animationTimestamp) {
        this.animationTimestamp = timestamp;
      }

      if (timestamp - this.animationTimestamp > this.interval) {
        this.nextColor();
        this.animationTimestamp = timestamp;
      }
      window.requestAnimationFrame(this.checkAnimation.bind(this));
    },
  },
  created: function () {
    this.checkAnimation(performance.now());
  }
});
