Vue.use(VueRouter)

// temporary

const sharedDictionaryData = {
  items: [],
  loaded: false
}

const router = new VueRouter({
  mode: 'hash',
  base: '',
  routes: [
    { path: '/dictionary', name: 'dictionary', component: Dictionary },
    { path: '/', name: 'shuffle', component: Shuffle }
  ]
})

var vm = new Vue({
	router,
	data: {
		sharedDictionaryData,
		dictionaryNeedsSaving: false,
		requestInProgress: false
	},
	methods: {
		loadDictionaryData: function() {
			this.requestInProgress = true;
			this.$http.post('/data/Services.php', {
			  service: "CheckDictionaryData",
			  receive: true
			}).then(response => {
				this.sharedDictionaryData.items = response.body.items;
				this.sharedDictionaryData.loaded = true;
				this.requestInProgress = false;
				this.$emit('dataLoaded', true);
			}, 
			response => {
				this.sharedDictionaryData.loaded = true;
				this.requestInProgress = false;
				this.$emit('dataLoaded', false);
				console.log(response);
		  });
		},
		saveDictionaryData: function() {
			this.requestInProgress = true;
			this.$http.post('/data/Services.php', {
			  service: "SaveDictionaryData",
			  items: JSON.stringify(this.sharedDictionaryData.items),
			  receive: true
			}).then(response => {
				this.sharedDictionaryData.loaded = false;
				this.requestInProgress = false;
				this.dictionaryNeedsSaving = false;
				this.loadDictionaryData();
			}, 
			response => {
				this.sharedDictionaryData.loaded = false;
				this.requestInProgress = false;
				this.$emit('dataLoaded', false);
				console.log(response);
		  });
		},
		addDictionaryData: function() {
			this.$root.$emit('editWord', {header: "New word", item: ''});
			$('#wordModal').modal('toggle');
		},
		deleteWord: function(item) {
			item = item.toLowerCase();
			for(var deleteIndex = 0; deleteIndex < this.sharedDictionaryData.items.length; deleteIndex++) {
				if(item === this.sharedDictionaryData.items[deleteIndex].toLowerCase()) {
					this.sharedDictionaryData.items.splice(deleteIndex, 1);
					console.log('deleted ' + item);
					this.dictionaryNeedsSaving = true;
					break;
				}
			}
		},
		saveWord: function(orgItem, changedItem) {
			changedItem = changedItem.toLowerCase();
			if(orgItem.length == 0) {
				this.sharedDictionaryData.items.push(changedItem);
				this.dictionaryNeedsSaving = true;
				
				console.log('saved new ' + changedItem);
			}
			else {
				orgItem = orgItem.toLowerCase();
				for(var saveIndex = 0; saveIndex < this.sharedDictionaryData.items.length; saveIndex++) {
					if(orgItem === this.sharedDictionaryData.items[saveIndex].toLowerCase()) {
						this.sharedDictionaryData.items[saveIndex] = changedItem;
						
						this.dictionaryNeedsSaving = true;
						
						$('#dictionaryList').find('.collapse.show').collapse('hide');
						console.log('saved ' + orgItem + ' to ' + changedItem);
						break;
					}
				}
			}
			
			if(this.dictionaryNeedsSaving) {
				// hack to refresh list - just add dummy record and then remove
				this.sharedDictionaryData.items.push(" ");
				this.sharedDictionaryData.items.splice(this.sharedDictionaryData.items.length-1, 1);
				// end hack
				
				$('#wordModal').modal('toggle');
			}
		},
	},
	created: function() {
		this.loadDictionaryData();
	}, 
	mounted: function() {
		this.$root.$on('deleteWord', function(item){
			this.deleteWord(item);
		}); 
		this.$root.$on('saveWord', function(orgItem, changedItem){
			this.saveWord(orgItem, changedItem);
		}); 
	}
}).$mount('#app')




