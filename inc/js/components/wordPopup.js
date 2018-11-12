Vue.component('word-popup', {
	data: function() {
		return {
			sharedDictionaryData,
			initialText: '',
			itemText: '',
			header: '',
			errorMessage: '',
		}
	},
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
								<form autocomplete="off" onsubmit="return;">
									<input id="wordPopupTextBox" autocomplete="off" type="text" v-bind:class="{'is-invalid':!canSave()}" class="form-control" v-model='itemText' style="-webkit-user-modify: read-write-plaintext-only;" @keyup.enter="enterClicked" placeholder="Your word here">
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
	methods: {
		saveWord: function(addAnother) {
			return this.$root.$emit('saveWord', this.initialText, this.itemText, addAnother);
		},
		canSave: function() {
			return this.errorMessage.length == 0;
		},
		clearForm: function() {
			this.initialText = '';
			this.itemText = '';
			this.header = ''
			console.log('cleared');
		},
		enterClicked(){
			if(this.canSave() && !this.sameAsInitial())
				this.saveWord();
		},
		sameAsInitial: function() {
			return this.itemText.toLowerCase() === this.initialText.toLowerCase();
		}
	},
	watch: {
		itemText: function(val) {
			var currentObj = this;
			if(val.length == 0) {
				this.errorMessage = "Name cannot be empty";
				return;
			}
			
			else if(!this.sameAsInitial()){
				
				var results = sharedDictionaryData.items.filter(function(element, index, array) {
					return (element.toLowerCase() === val.toLowerCase());
				});
				
				if(results.length > 0) {
					this.errorMessage = "Item already exists";
					return;
				}
				
			}
			
			this.errorMessage = "";
		}
	},
	mounted: function() {
		var currentObj = this;
		this.$root.$on('editWord', function(popupInfo){
			currentObj.initialText = popupInfo.item;
			currentObj.itemText = popupInfo.item;
			currentObj.header = popupInfo.header
			
			setTimeout(function(){$('#wordPopupTextBox').focus();},400);
		});
		this.$root.$on('clearEdit', function(){
			currentObj.clearForm();
		})
	}
})
