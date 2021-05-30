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
								<form autocomplete="off" v-on:submit.prevent="onSubmit" onsubmit="return;">
									<input id="wordPopupTextBox" autocomplete="off" type="text" v-bind:class="{'is-invalid':!canSave()}" class="form-control" v-model='itemText' style="-webkit-user-modify: read-write-plaintext-only;" placeholder="Your word here">
								</form>
							</p>
						</div>
						{{errorMessage}}
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
		const initialText = Vue.ref('')
		const itemText = Vue.ref('')
		const header = Vue.ref('')
		const errorMessage = Vue.ref('')

		const saveWord = function(addAnother) {
			return window.mittEmitter.emit('saveWord', {orgItem: initialText.value, changedItem: itemText.value, addAnother: addAnother});
		}
		
		const canSave = function() {
			return errorMessage.value.length == 0;
		}

		const clearForm = function() {
			initialText.value = '';
			itemText.value = '';
			header.value = ''
			console.log('cleared');
		}

		const sameAsInitial = function() {
			return itemText.value.toLowerCase() === initialText.value.toLowerCase();
		}

		const onSubmit = function() {
			if(canSave() && !sameAsInitial()) {
				saveWord(true);
			}
		}

		Vue.watch(itemText, (itemTextValue, oldItemTextValue) => {
			if(itemTextValue.length == 0) {
				errorMessage.value = "Name cannot be empty";
				return;
			}
			else if(!sameAsInitial()){
				
				var results = sharedDictionaryData.items.filter(function(element, index, array) {
					return (element.toLowerCase() === itemTextValue.toLowerCase());
				});
				if(results.length > 0) {
					errorMessage.value = "Item already exists";
					return;
				}
				
			}
			
			errorMessage.value = "";
		})

		Vue.onMounted(function() {
			window.mittEmitter.on('editWord', function(popupInfo){
				initialText.value = popupInfo.item;
				itemText.value = popupInfo.item;
				header.value = popupInfo.header
				
				setTimeout(function(){$('#wordPopupTextBox').focus();},400);
			});
			window.mittEmitter.on('clearEdit', function(){
				clearForm();
			})
		})

		return {
			canSave,
			clearForm,
			onSubmit,
			initialText,
			itemText,
			header,
			errorMessage,
			sameAsInitial,
			saveWord
		}
	}
})
