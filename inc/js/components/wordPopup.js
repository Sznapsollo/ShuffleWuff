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
		let errorMessage = null
		const errorMessageText = Vue.ref('')

		const saveWord = function(addAnother) {
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

		const validateEditorValues = function() {
			if(!languageFromText.value || languageFromText.value.length == 0) {
				errorMessage = {wordPopupForeignTextBox:"Field From cannot be empty"};
				errorMessageText.value = "Field From cannot be empty"
				return;
			} else if(!languageToText.value || languageToText.value.length == 0) {
				errorMessage = {wordPopupOriginTextBox: "Field To cannot be empty"};
				errorMessageText.value = "Field To cannot be empty"
				return;
			}
			else if(!sameAsInitial()){
				var results = sharedDictionaryData.items.filter(function(element, index, array) {
					return (item != element) && (element.languageFrom.toLowerCase() === languageFromText.value.toLowerCase());
				});
				if(results.length > 0) {
					errorMessage = {wordPopupForeignTextBox: "Item already exists"};
					errorMessageText.value = "Item already exists"
					return;
				}
				
			}
			
			errorMessage = null;
			errorMessageText.value = null
		}

		Vue.watch(languageFromText, (languageFromTextValue, oldLnguageFromTextValue) => {
			validateEditorValues()
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
			validateEditorValues
		}
	}
})
