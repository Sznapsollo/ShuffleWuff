/* todo
	- switch db to csv format
	- add changed date to existing items
	- add sort option by changed date
	- add translation to existing items
	- add translation handling to add new word, edit new word, sort by
	- add option to hide translation from dictionary
	- tests generator 
	- tests generator : how many
	- tests generator: fereign or translation
	- tests generator: all/newest (by changed date)
*/

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

var app = Vue.createApp({
	setup() {
		const dictionaryNeedsSaving = Vue.ref(false)
		const requestInProgress = Vue.ref(false)
		const servicesAddress = settings.servicesAddress

		const addDictionaryData = function() {
			window.mittEmitter.emit('editWord', {header: "New word", item: ''});
			$('#wordModal').modal('toggle');
		}

		const deleteWord = function(item) {
			item = item.toLowerCase();
			for(var deleteIndex = 0; deleteIndex < sharedDictionaryData.items.length; deleteIndex++) {
				if(item === sharedDictionaryData.items[deleteIndex].toLowerCase()) {
					sharedDictionaryData.items.splice(deleteIndex, 1);
					console.log('deleted ' + item);
					dictionaryNeedsSaving.value = true;
					break;
				}
			}
		}

		const loadDictionaryData = function() {
			requestInProgress.value = true;
			axios.post(servicesAddress, {
			  service: "CheckDictionaryData",
			  receive: true
			}).then(response => {
				sharedDictionaryData.items = response.data.items;
				languagesDropdowns.languagesFrom = settings.translateFrom;
				languagesDropdowns.languagesTo = settings.translateTo;

				if(settings.defaultLanguageFrom && settings.defaultTranslateFrom.length > 0) {
					languagesDropdowns.defaultTranslateFrom = settings.defaultTranslateFrom;
				} else if(languagesDropdowns.languagesFrom.length > 0) {
					languagesDropdowns.defaultTranslateFrom = languagesDropdowns.languagesFrom[0];
				}

				if(settings.defaultTranslateTo && settings.defaultTranslateTo.length > 0) {
					languagesDropdowns.defaultTranslateTo = settings.defaultTranslateTo;
				} else if(languagesDropdowns.languagesTo.length > 0) {
					languagesDropdowns.defaultTranslateTo = languagesDropdowns.languagesTo[0];
				}

				sharedDictionaryData.loaded = true;
				requestInProgress.value = false;
				window.mittEmitter.emit('dataLoaded', true);
			}).catch(function (error) {
				sharedDictionaryData.loaded = true;
				requestInProgress.value = false;
				window.mittEmitter.emit('dataLoaded', false);
				console.log(response);
		  });
		}

		const saveDictionaryData = function() {
			requestInProgress.value = true;
			axios.post(servicesAddress, {
			  service: "SaveDictionaryData",
			  items: JSON.stringify(sharedDictionaryData.items),
			  receive: true
			}).then(response => {
				sharedDictionaryData.loaded = false;
				requestInProgress.value = false;
				dictionaryNeedsSaving.value = false;
				loadDictionaryData();
			}).catch(function (error) {
				sharedDictionaryData.loaded = false;
				requestInProgress.value = false;
				window.mittEmitter.emit('dataLoaded', false);
				console.log(response);
		  })
		}

		const saveWord = function(args) {
			if(!args) {args = {}}
			let orgItem = args.orgItem
			let changedItem = args.changedItem
			let addAnother = args.addAnother
			changedItem = changedItem.toLowerCase();
			if(orgItem.length == 0) {
				sharedDictionaryData.items.push(changedItem);
				dictionaryNeedsSaving.value = true;
				
				console.log('saved new ' + changedItem);
			}
			else {
				orgItem = orgItem.toLowerCase();
				for(var saveIndex = 0; saveIndex < sharedDictionaryData.items.length; saveIndex++) {
					if(orgItem === sharedDictionaryData.items[saveIndex].toLowerCase()) {
						sharedDictionaryData.items[saveIndex] = changedItem;
						
						dictionaryNeedsSaving.value = true;
						
						$('#dictionaryList').find('.collapse.show').collapse('hide');
						console.log('saved ' + orgItem + ' to ' + changedItem);
						break;
					}
				}
			}
			
			if(dictionaryNeedsSaving.value) {
				// hack to refresh list - just add dummy record and then remove
				sharedDictionaryData.items.push(" ");
				sharedDictionaryData.items.splice(sharedDictionaryData.items.length-1, 1);
				// end hack
				
				window.mittEmitter.emit('clearEdit', true);
				if(addAnother)
					window.mittEmitter.emit('editWord', {header: "New word", item: ''});
				else
					$('#wordModal').modal('toggle');
			}
		}

		Vue.onMounted(function() {
			window.mittEmitter.on('deleteWord', function(item){
				deleteWord(item);
			}); 
			window.mittEmitter.on('saveWord', function(args){
				saveWord(args);
			}); 
		})

		loadDictionaryData()

		return {
			addDictionaryData,
			deleteWord,
			loadDictionaryData,
			dictionaryNeedsSaving,
			requestInProgress,
			saveDictionaryData,
			saveWord
		}
	}
})

app.mixin({
	methods: {
		prepareTranslatorVoiceLink: function(item) {
			return settings.translatorVoiceAddress+encodeURI(item.replace(/\_/g, ' '))+'&tl=en&client=tw-ob';
		},
		prepareTranslatorLink: function(item, from, to) {
			return settings.translatorAddress+from+'/'+to+'/'+encodeURI(item.replace(/\_/g, ' '));
		}
	}
})




	