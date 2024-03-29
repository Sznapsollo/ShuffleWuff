app.component('user-settings-popup', {
	template: `
		<div id="userSettingsModal" class="modal fade" tabindex="-1" role="dialog" data-backdrop="static">
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
									<div class="container">
										<input type="checkbox" name="playGoodAnswerSound" id="playGoodAnswerSound" v-model="playGoodAnswerSound">
										&nbsp;
										<label style="cursor: pointer" for="playGoodAnswerSound">Play good answer sound</label>
									</div>
									<div class="container">
										<input type="checkbox" name="playBadAnswerSound" id="playBadAnswerSound" v-model="playBadAnswerSound">
										&nbsp;
										<label style="cursor: pointer" for="playBadAnswerSound">Play bad answer sound</label>
									</div>
									<div class="container">
										<input type="checkbox" name="playSkipAnswerSound" id="playSkipAnswerSound" v-model="playSkipAnswerSound">
										&nbsp;
										<label style="cursor: pointer" for="playSkipAnswerSound">Play skip answer sound</label>
									</div>
									<div class="container">
										<input type="checkbox" name="playGoBackSound" id="playGoBackSound" v-model="playGoBackSound">
										&nbsp;
										<label style="cursor: pointer" for="playGoBackSound">Play previous word sound</label>
									</div>
									<div class="container">
										<input type="checkbox" name="playGoForthSound" id="playGoForthSound" v-model="playGoForthSound">
										&nbsp;
										<label style="cursor: pointer" for="playGoForthSound">Play next word sound</label>
									</div>
									<div class="container">
										<input type="checkbox" name="playVoice" id="playVoice" v-model="playVoice">
										&nbsp;
										<label style="cursor: pointer" for="playVoice">Read points per action</label>
									</div>

									<button style="display: none" type="submit" @click="onSubmit"></button>
								</form>
							</p>
						</div>
						{{errorMessageText}}
					</div>
					<div class="modal-footer">
						<button type="button" :disabled="!canSave()" v-on:click="saveUserSettings()" class="btn btn-primary">Save changes</button>
					</div>
				</div>
			</div>
		</div>
	`,
	setup() {
		const header = Vue.ref('Settings')
		let errorMessage = null
		const errorMessageText = Vue.ref('')
		const playGoodAnswerSound = Vue.ref(false)
		const playBadAnswerSound = Vue.ref(false)
		const playSkipAnswerSound = Vue.ref(false)
		const playGoBackSound = Vue.ref(false)
		const playGoForthSound = Vue.ref(false)
		const playVoice = Vue.ref(false)

		const saveUserSettings = function(addAnother) {
			userSettings.playGoodAnswerSound = playGoodAnswerSound.value
			userSettings.playBadAnswerSound = playBadAnswerSound.value
			userSettings.playSkipAnswerSound = playSkipAnswerSound.value
			userSettings.playGoBackSound = playGoBackSound.value
			userSettings.playGoForthSound = playGoForthSound.value
			userSettings.playVoice = playVoice.value
			setCookie('SFUserSettings', btoa(escape(JSON.stringify(userSettings))), 365)
			$('#userSettingsModal').modal('toggle');
		}

		const canSave = function(fieldId) {
			return errorMessage == null
		}

		const onSubmit = function(e) {
			e.preventDefault();
			if(canSave()) {
				saveUserSettings();
			}
		}

		Vue.onMounted(function() {
			window.mittEmitter.on('showUserSettings', function(popupInfo){
				playGoodAnswerSound.value = userSettings.playGoodAnswerSound
				playBadAnswerSound.value = userSettings.playBadAnswerSound
				playSkipAnswerSound.value = userSettings.playSkipAnswerSound
				playGoBackSound.value = userSettings.playGoBackSound
				playGoForthSound.value = userSettings.playGoForthSound
				playVoice.value = userSettings.playVoice
			});
		})

		return {
			canSave,
			onSubmit,
			playGoodAnswerSound,
			playBadAnswerSound,
			playSkipAnswerSound,
			playGoBackSound,
			playGoForthSound,
			playVoice,
			header,
			errorMessageText,
			saveUserSettings,
		}
	}
})
