import MVVM from './mvvm'

const vm = new MVVM({
  el: document.getElementById('app'),
  data: {
    msg: "Hello World!"
  },
  computed: {
    msgLength(){
      return this.msg.length
    }
  },
  methods: {
    reverse() {
      this.msg = this.msg.split('').reverse().join('')
    }
  }
})

window.vm = vm