/* todo
	- switch db to csv format
	- save as csv
	- add translation to existing items
	- add changed date to existing items
	- add sort option by changed date
	- add translation to existing items
	- add translation handling to add new word, edit new word, sort by
	- add option to hide translation from dictionary
	- tests generator 
	- tests generator : how many
	- tests generator: fereign or translation
	- tests generator: all/newest (by changed date)
	- dictionary item
*/

const languagesDropdowns = {
	languages: [],
	languageForeign: "",
	languageOrigin: ""
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
			window.mittEmitter.emit('editWord', {header: "New word", item: null});
			$('#wordModal').modal('toggle');
		}

		const prepareTest = function() {
			window.mittEmitter.emit('prepareTest', {header: "Prepare test"});
			$('#prepareTestModal').modal('toggle');
		}

		const deleteWord = function(deleteItem) {
			for(var deleteIndex = 0; deleteIndex < sharedDictionaryData.items.length; deleteIndex++) {
				if(deleteItem == sharedDictionaryData.items[deleteIndex].languageFrom) {
					sharedDictionaryData.items.splice(deleteIndex, 1);
					console.log('deleted ' + deleteItem);
					dictionaryNeedsSaving.value = true;
					window.mittEmitter.emit('deletedWord', {});
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
				languagesDropdowns.languages = [settings.languageForeign, settings.languageOrigin];

				languagesDropdowns.languageForeign = languagesDropdowns.languages[0];
				languagesDropdowns.languageOrigin = languagesDropdowns.languages[1];

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
			let changedItem = args.changedItem
			let addAnother = args.addAnother

			changedItem.languageFrom = changedItem.languageFrom.toLowerCase()
			changedItem.languageTo = changedItem.languageTo.toLowerCase()
			changedItem.changeDate = (new Date()).yyyymmdd()

			let foundItem = sharedDictionaryData.items.find(function(item){return item == changedItem})

			if(foundItem) {
				dictionaryNeedsSaving.value = true;
				$('#dictionaryList').find('.collapse.show').collapse('hide');
				console.log('saved ' + changedItem.languageFrom);
			} else {
				sharedDictionaryData.items.push(changedItem);
				dictionaryNeedsSaving.value = true;
				console.log('saved new ' + changedItem);
			}
			
			sharedDictionaryData.items.sort(function(a,b) {return a.languageFrom > b.languageFrom})

			window.mittEmitter.emit('savedWord', changedItem);

			if(dictionaryNeedsSaving.value) {
				window.mittEmitter.emit('clearEdit', true);
				if(addAnother)
					window.mittEmitter.emit('editWord', {header: "New word", item: null});
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
			prepareTest,
			saveDictionaryData,
			saveWord
		}
	}
})

app.mixin({
	methods: {
		prepareTranslatorVoiceLink: function(value, toLanguage) {
			return settings.translatorVoiceAddress+encodeURI(value.replace(/\_/g, ' '))+'&tl=' + toLanguage + '&client=tw-ob';
		},
		prepareTranslatorLink: function(value, from, to) {
			return settings.translatorAddress+from+'/'+to+'/'+encodeURI(value.replace(/\_/g, ' '));
		}
	}
})




	