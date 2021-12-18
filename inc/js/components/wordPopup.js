app.component('word-popup', {
	template: `
		<div id="wordModal" class="modal fade" tabindex="-1" role="dialog" data-backdrop="static">
			<div class="modal-dialog" role="document">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">{{header}}</h5>
						<button type="button" class="close" data-dismiss="modal" aria-label="Close">
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
					<div class="modal-body">
						<div class="form-group">
							<p>
								<form autocomplete="off" >
									<input id="wordPopupForeignTextBox" autocomplete="off" type="text" v-bind:class="{'is-invalid':!canSaveField('wordPopupForeignTextBox')}" class="form-control" v-model='languageFromText' style="-webkit-user-modify: read-write-plaintext-only;" placeholder="Your foreign word here">
									<ul v-if="searchWords.length" style="    list-style-type: none;padding: 0;color: #333333;font-size: 10pt;">
										<li style="padding: 3px 0 3px 0; color: #666666;">
											Showing {{ searchWords.length }} of {{ allSearchWordsCount }} words containing this phraze
										</li>
										<li style="cursor: pointer;" v-for="word in searchWords" :key="word.languageFrom" @click="selectAutocompleteWord(word.languageFrom)">
											<span v-html="word.languageFrom.replaceAll(languageFromText,'<b>' + languageFromText + '</b>')"></span>
										</li>
									</ul>
									<br/>
									<input id="wordPopupOriginTextBox" autocomplete="off" type="text" v-bind:class="{'is-invalid':!canSaveField('wordPopupOriginTextBox')}" class="form-control" v-model='languageToText' style="-webkit-user-modify: read-write-plaintext-only;" placeholder="Your origin word here">
									<button style="display: none" type="submit" @click="onSubmit"></button>
								</form>
							</p>
						</div>
						{{errorMessageText}}
					</div>
					<div class="modal-footer">
						<button type="button" :disabled="!canSave() || sameAsInitial()" v-on:click="saveWord(false)" class="btn btn-primary">Save changes</button>
						<button type="button" :disabled="!canSave() || sameAsInitial()" v-on:click="saveWord(true)" class="btn btn-secondary">Add another</button>
						<!--<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>-->
					</div>
				</div>
			</div>
		</div>
	`,
	setup() {
		let item = {}
		const languageFromText = Vue.ref('')
		const languageToText = Vue.ref('')
		const header = Vue.ref('')
		const allSearchWordsCount = Vue.ref(0)
		const searchWords = Vue.ref([])
		let errorMessage = null
		const errorMessageText = Vue.ref('')

		const saveWord = function(addAnother) {
			validateEditorValues()
			if(!canSave() || sameAsInitial()) {
				return
			}
			item = item ? item : {}
			item.languageFrom = languageFromText.value
			item.languageTo = languageToText.value
			return window.mittEmitter.emit('saveWord', {changedItem: item, addAnother: addAnother});
		}

		const canSaveField = function(fieldId) {
			if(errorMessage && errorMessage[fieldId]) {
				return false
			}
			return true
		}

		const canSave = function(fieldId) {
			return errorMessage == null
		}

		const clearForm = function() {
			item = {};
			languageFromText.value = ''
			languageToText.value = ''
			header.value = ''
			console.log('cleared');
		}

		const sameAsInitial = function() {
			if(!item) {
				return false
			}
			item.languageFrom = item.languageFrom && item.languageFrom.toLowerCase ? item.languageFrom : ''
			item.languageTo = item.languageTo && item.languageTo.toLowerCase ? item.languageTo : ''
			return item.languageFrom.toLowerCase() === languageFromText.value.toLowerCase() && item.languageTo.toLowerCase() === languageToText.value.toLowerCase();
		}

		const onSubmit = function(e) {
			e.preventDefault();
			validateEditorValues()
			if(canSave() && !sameAsInitial()) {
				saveWord(true);
			}
		}

		const selectAutocompleteWord = function(autocompleteWord) {
			languageFromText.value = autocompleteWord
		}

		const validateEditorValues = function() {
			if(!languageFromText.value || languageFromText.value.length == 0) {
				errorMessage = {wordPopupForeignTextBox:"Field From cannot be empty"};
				errorMessageText.value = "Field From cannot be empty"
				return;
			}
			
			if(!sameAsInitial()){
				var results = sharedDictionaryData.items.filter(function(element, index, array) {
					return (item != element) && (element.languageFrom.toLowerCase() === languageFromText.value.toLowerCase());
				});
				if(results.length > 0) {
					errorMessage = {wordPopupForeignTextBox: "Item already exists"};
					errorMessageText.value = "Item already exists"
					return;
				}
				
			} 
			
			if(!languageToText.value || languageToText.value.length == 0) {
				errorMessage = {wordPopupOriginTextBox: "Field To cannot be empty"};
				errorMessageText.value = "Field To cannot be empty"
				return;
			}
			
			errorMessage = null;
			errorMessageText.value = null
		}

		Vue.watch(languageFromText, (languageFromTextValue, oldLnguageFromTextValue) => {
			validateEditorValues()
			var autocompleteMatches = 0;
			allSearchWordsCount.value = 0
			if(languageFromText.value && languageFromText.value.length) {
				var dataToBeSearched = sharedDictionaryData.items.slice() 
				var searchWordsTemp = dataToBeSearched.filter(function(element, index, array) {
					if(element.languageFrom.toLowerCase().includes(languageFromText.value.toLowerCase())) {
						allSearchWordsCount.value++
						if(autocompleteMatches < 5) {
							autocompleteMatches++
							return element
						}
					}
					return null
				});
				searchWords.value = searchWordsTemp ? searchWordsTemp.slice() : []
			} else {
				searchWords.value = []
			}
		})

		Vue.watch(languageToText, (languageToTextValue, oldLnguageToTextValue) => {
			validateEditorValues()
		})

		Vue.onMounted(function() {
			window.mittEmitter.on('editWord', function(popupInfo){
				item = popupInfo.item;
				languageFromText.value = item ? item.languageFrom : ''
				languageToText.value = item ? item.languageTo : ''
				header.value = popupInfo.header
				
				setTimeout(function(){$('#wordPopupForeignTextBox').focus();},400);
			});
			window.mittEmitter.on('clearEdit', function(){
				clearForm();
			})
		})

		return {
			allSearchWordsCount,
			canSave,
			canSaveField,
			clearForm,
			onSubmit,
			languageFromText,
			languageToText,
			header,
			errorMessageText,
			sameAsInitial,
			saveWord,
			searchWords,
			selectAutocompleteWord,
			validateEditorValues
		}
	}
})
