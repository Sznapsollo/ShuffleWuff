Vue.use(VueRouter)

Vue.mixin({
	methods: {
		prepareTranslatorVoiceLink: function(item) {
			return settings.translatorVoiceAddress+encodeURI(item.replace(/\_/g, ' '))+'&tl=en&client=tw-ob';
		},
		prepareTranslatorLink: function(item, from, to) {
			return settings.translatorAddress+from+'/'+to+'/'+encodeURI(item.replace(/\_/g, ' '));
		}
	}
})

const languagesDropdowns = {
	languagesFrom: [],
	languagesTo: [],
	defaultTranslateFrom: "",
	defaultTranslateTo: ""
}

const sharedDictionaryData = {
	items: [],
	loaded: false
}

const score = {
	displayed: 0,
	attempts: 0,
	points: 0,
	score: 0,
	correctAnswers: 0,
	incorrectAnswers: 0
}

const router = new VueRouter({
	mode: 'hash',
	base: '',
	routes: [
		{ path: '/dictionary', name: 'dictionary', component: Dictionary },
		{ path: '/about', name: 'about', component: About },
		{ path: '/', name: 'shuffle', component: Shuffle }
	]
})

var vm = new Vue({
	router,
	data: {
		sharedDictionaryData,
		languagesDropdowns,
		dictionaryNeedsSaving: false,
		requestInProgress: false,
		servicesAddress: settings.servicesAddress
	},
	methods: {
		loadDictionaryData: function() {
			this.requestInProgress = true;
			this.$http.post(this.servicesAddress, {
			  service: "CheckDictionaryData",
			  receive: true
			}).then(response => {
				this.sharedDictionaryData.items = response.body.items;
				this.languagesDropdowns.languagesFrom = settings.translateFrom;
				this.languagesDropdowns.languagesTo = settings.translateTo;

				if(settings.defaultLanguageFrom && settings.defaultTranslateFrom.length > 0)
					this.languagesDropdowns.defaultTranslateFrom = settings.defaultTranslateFrom;
				else if(this.languagesDropdowns.languagesFrom.length > 0)
					this.languagesDropdowns.defaultTranslateFrom = this.languagesDropdowns.languagesFrom[0];

				if(settings.defaultTranslateTo && settings.defaultTranslateTo.length > 0)
					this.languagesDropdowns.defaultTranslateTo = settings.defaultTranslateTo;
				else if(this.languagesDropdowns.languagesTo.length > 0)
					this.languagesDropdowns.defaultTranslateTo = this.languagesDropdowns.languagesTo[0];

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
			this.$http.post(this.servicesAddress, {
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
		saveWord: function(orgItem, changedItem, addAnother) {
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
				
				this.$emit('clearEdit', true);
				if(addAnother)
					this.$root.$emit('editWord', {header: "New word", item: ''});
				else
					$('#wordModal').modal('toggle');
			}
		}
	},
	created: function() {
		this.loadDictionaryData();
	}, 
	mounted: function() {
		this.$root.$on('deleteWord', function(item){
			this.deleteWord(item);
		}); 
		this.$root.$on('saveWord', function(orgItem, changedItem, addAnother){
			this.saveWord(orgItem, changedItem, addAnother);
		}); 
	}
}).$mount('#app')




	