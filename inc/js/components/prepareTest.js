app.component('prepare-test', {
	template: `
		<div id="prepareTestModal" class="modal fade" tabindex="-1" role="dialog" data-backdrop="static">
			<div class="modal-dialog" role="document">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">{{header}}</h5>
						<button type="button" class="close" data-dismiss="modal" aria-label="Close">
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
					<div class="modal-body">
						<div class="alert alert-success copiedToClipboardAlert" style="display: none;" role="alert">
							Test words shuffled and copied to clipboard!
						</div>
						<div class="form-group">
							<p>
								<form autocomplete="off" >
									<label for="howManyWordsInput">How many words:</label>
									<input class="form-control" id="howManyWordsInput" autocomplete="off" type="number" v-model='howManyWords' style="-webkit-user-modify: read-write-plaintext-only;" >
									<br/>
									<label for="testWhichLanguage">Language:</label>
									<select id="testWhichLanguage" class="form-control" v-model="language"><option v-for="option in languages" v-bind:value="option">{{option}}</option></select>
									<br/>
									<label for="testMode">Mode:</label>
									<select id="testMode" class="form-control" v-model="mode"><option v-for="option in modes" v-bind:value="option">{{option}}</option></select>
									<br/>
									<label for="outputValue">output:</label>
									<select id="outputValue" class="form-control" v-model="output"><option v-for="option in outputs" v-bind:value="option">{{option}}</option></select>
									<br/>
									<div v-if="output == 'clipboard'">
										<label for="separatorValue">separator:</label>
										<select id="separatorValue" class="form-control" v-model="separator"><option v-for="option in separators" v-bind:value="option">{{option}}</option></select>
										<br/>
									</div>
									<button style="display: none" type="submit" @click="onSubmit"></button>
								</form>
							</p>
						</div>
						{{errorMessageText}}
						<textarea style="display: none; height: 1px;" id="testWordsTextArea"></textarea>
					</div>
					<div class="modal-footer">
						<button type="button" v-on:click="prepareTest()" class="btn btn-primary">Prepare test</button>
					</div>
				</div>
			</div>
		</div>
	`,
	setup() {
		const howManyWords = Vue.ref(150)
		const modes = Vue.ref(['all (random)','latest'])
		const languages = Vue.ref([])
		const language = Vue.ref('')
		const separators = Vue.ref(['new line', 'comma'])
		const separator = Vue.ref('new line')
		const outputs = Vue.ref(['clipboard', 'print'])
		const output = Vue.ref('print')
		const header = Vue.ref('')
		const mode = Vue.ref('latest')
		let errorMessage = null
		const errorMessageText = Vue.ref('')

		const onSubmit = function(e) {
			e.preventDefault();
			if(canSave() && !sameAsInitial()) {
				prepareTest()
			}
		}

		const copyToClipBoard = function(shuffledWords) {
			/* Get the text field */
			$("#testWordsTextArea").show()
			var copyText = document.getElementById("testWordsTextArea");
			
			copyText.value = shuffledWords;
			/* Select the text field */
			copyText.select();
			copyText.setSelectionRange(0, 99999); /* For mobile devices */
		  
			/* Copy the text inside the text field */
			document.execCommand("copy");
			$("#testWordsTextArea").hide()
			/* Alert the copied text */
			$(".copiedToClipboardAlert").show("slow")
			setTimeout(function() {
				$(".copiedToClipboardAlert").hide('slow')
			}, 5000)
		}

		const rememberSettings = function() {
			let testCriteria = {
				language: language.value,
				howManyWords: howManyWords.value,
				output: output.value,
				mode: mode.value,
				separator: separator.value
			}
			setCookie('SFTestCriteria', btoa(escape(JSON.stringify(testCriteria))), 365)
		}

		const loadRememberedSettings = function() {
			var cookie = getCookie('SFTestCriteria')
			if(!cookie) {
				return {}
			}
		
			var cachedProperties = JSON.parse(unescape(atob(cookie)))
			if(!cachedProperties) {
				return
			}
	
			if(cachedProperties.language) {
				language.value = cachedProperties.language
			}
			if(cachedProperties.howManyWords) {
				howManyWords.value = cachedProperties.howManyWords
			}
			if(cachedProperties.output) {
				output.value = cachedProperties.output
			}
			if(cachedProperties.mode) {
				mode.value = cachedProperties.mode
			}
			if(cachedProperties.separator) {
				separator.value = cachedProperties.separator
			}
		}

		const prepareTest = function(e) {
			let wordsResults = []
			let propName = 'languageFrom'

			let itemsForTest = sharedDictionaryData.items.slice()

			if(language.value == languagesDropdowns.languageOrigin) {
				propName = 'languageTo'
			}

			if(mode.value == 'latest') {
				// sort by changeDate
				itemsForTest.sort(function(a,b) {return b.changeDate - a.changeDate})
				// take n newest items
			} else {
				shuffleArray(itemsForTest)
			}
			wordsResults = itemsForTest.slice(0, howManyWords.value).map(i => {
				return i[propName]
				})
			
			let separatorLocal = separator.value == 'comma' ? ',' : '\n'
			if(output.value == 'clipboard') {
				wordsResults = wordsResults.join(separatorLocal)
				copyToClipBoard(wordsResults)
			} else if(output.value == 'print') {
				let htmlResultColumns = '<div>'
				wordsResults.forEach(function(wordItem) {
					htmlResultColumns += '<div class="printWord">' + wordItem + '</div>'
				})
				htmlResultColumns += '</div>'
				PrintData(htmlResultColumns)
			}
			rememberSettings()
		}

		const validateEditorValues = function() {
			
			errorMessage = null;
			errorMessageText.value = null
		}

		const fillLanguagesDropdowns = function() {
			languages.value = languagesDropdowns.languages
			language.value = languagesDropdowns.languageForeign;
		}

		Vue.onMounted(function() {
			if(sharedDictionaryData.items && sharedDictionaryData.items.length > 0) {
				fillLanguagesDropdowns();
			}

			window.mittEmitter.on('dataLoaded', function(){
				fillLanguagesDropdowns();
				loadRememberedSettings()
			});

			window.mittEmitter.on('prepareTest', function(popupInfo){
				header.value = popupInfo.header
			});
		})

		return {
			howManyWords,
			separator,
			separators,
			language,
			languages,
			mode,
			modes,
			output,
			outputs,
			onSubmit,
			prepareTest,
			header,
			errorMessageText,
			validateEditorValues
		}
	}
})
