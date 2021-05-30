app.component('test', {
	setup() {
		const count = Vue.ref(0)
		const test = Vue.ref('121')
		return {
			count,
			test
		}
	},
	template: `
		{{test}}
	  <button @click="count++">
		You clicked me {{ count }} times.
	  </button>`
  })