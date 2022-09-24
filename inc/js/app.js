
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
	skippedAnswers: 0,
	incorrectAnswers: 0
}

const userSettings = {

}

var app = Vue.createApp({
	setup() {
		const dictionaryChanges = Vue.ref(0)
		const requestInProgress = Vue.ref(false)
		const servicesAddress = settings.servicesAddress

		const addDictionaryData = function() {
			window.mittEmitter.emit('editWord', {header: "New word", item: null});
			$('#wordModal').modal('toggle');
		}

		const showUserSettings = function() {
			window.mittEmitter.emit('showUserSettings', {});
			$('#userSettingsModal').modal('toggle');
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
					dictionaryChanges.value++;
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
				dictionaryChanges.value = 0;
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
				dictionaryChanges.value++;
				$('#dictionaryList').find('.collapse.show').collapse('hide');
				console.log('saved ' + changedItem.languageFrom);
			} else {
				sharedDictionaryData.items.push(changedItem);
				dictionaryChanges.value++;
				console.log('saved new ' + changedItem);
			}
			
			sharedDictionaryData.items.sort(function(a,b) {return a.languageFrom > b.languageFrom})

			window.mittEmitter.emit('savedWord', changedItem);

			if(dictionaryChanges.value > 0) {
				window.mittEmitter.emit('clearEdit', true);
				if(addAnother)
					window.mittEmitter.emit('editWord', {header: "New word", item: null});
				else
					$('#wordModal').modal('toggle');
			}
		}

		const loadUserSettings = function() {
			var cookie = getCookie('SFUserSettings')
		
			var cachedUserSettings
			if(cookie) {
				cachedUserSettings = JSON.parse(unescape(atob(cookie)))
			}
			
			userSettings.playGoodAnswerSound = cachedUserSettings ? cachedUserSettings.playGoodAnswerSound == true : true
			userSettings.playBadAnswerSound = cachedUserSettings ? cachedUserSettings.playBadAnswerSound == true : true
			userSettings.playSkipAnswerSound = cachedUserSettings ? cachedUserSettings.playSkipAnswerSound == true : true
			userSettings.playGoBackSound = cachedUserSettings ? cachedUserSettings.playGoBackSound == true : true
			userSettings.playGoForthSound = cachedUserSettings ? cachedUserSettings.playGoForthSound == true : true
			userSettings.playVoice = cachedUserSettings ? cachedUserSettings.playVoice == true : true
		}

		Vue.onMounted(function() {
			window.mittEmitter.on('deleteWord', function(item){
				deleteWord(item);
			}); 
			window.mittEmitter.on('saveWord', function(args){
				saveWord(args);
			}); 
			loadUserSettings()
			document.addEventListener('keydown', function(e) {
				window.mittEmitter.emit('manageKeyDown', e);
			});
		})

		loadDictionaryData()

		return {
			addDictionaryData,
			deleteWord,
			loadDictionaryData,
			dictionaryChanges,
			requestInProgress,
			prepareTest,
			saveDictionaryData,
			saveWord,
			showUserSettings
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




	