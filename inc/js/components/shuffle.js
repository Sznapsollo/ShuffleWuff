const Shuffle = { 
		props: [],
		template: `
			<div id="shuffleBox">
				<div class="container result">
					<div v-if="isLoaded">
						<h1 id="shuffledWord" >&nbsp;</h1>
						<a style="display: inline; opacity: 0.5" target="_blank" v-bind:href="prepareTranslatorVoiceLink(word, languageFrom)"><i class="fa fa-2x fa-play-circle-o"></i></a>
						<div>
							<a target="_blank" href="#" v-on:click="editWord()" data-toggle="modal" data-target="#wordModal">edit</a> 
							&nbsp;
							<a target="_blank" v-bind:href="prepareTranslatorLink(word, languageFrom, languageTo)">translate</a> 
							&nbsp;
							<select style="width: 80px" class="btn btn-mini" v-model="languageFrom"><option v-for="option in languages" v-bind:value="option">{{option}}</option></select>
							&nbsp;<a href="#" v-on:click="flipToFrom()">flip</a>&nbsp;
							<select style="width: 80px" class="btn btn-mini" v-model="languageTo"><option v-for="option in languages" v-bind:value="option">{{option}}</option></select>
						</div>
					</div>
					<i v-if="!isLoaded" class="fa fa-cog fa-2x fa-spin"></i>
				</div>
				<div class="container">
					Points:<span class="score points" v-bind:class="{ goodScores: scoreLocal.points > 0, badScores: scoreLocal.points < 0 }">{{scoreLocal.points}}</span>
					Word No.:<span class="score">{{scoreLocal.displayed}}</span>
					Score:<span class="score points">{{scoreLocal.score}}%</span>
				</div>
				<div class="container">
					<button type="button" class="btn btn-success btn-lg" v-on:click="calculateScore(true)">Good answer</button>
					&nbsp;
					<button type="button" class="btn btn-danger btn-lg" v-on:click="calculateScore(false)">Bad answer</button>
				</div>
				<div class="container">
					<button type="button" class="btn btn-light" v-on:click="shuffleWord()">Shuffle another</button>
					&nbsp;
					<button type="button" class="btn btn-light" v-on:click="cleanScore()">Clean Score</button>
				</div>
				<div class="container">
					<input type="checkbox" name="automatic_shuffle" id="automatic_shuffle_chbx" v-model="automaticShuffle">
					&nbsp;
					<label style="cursor: pointer" for="automatic_shuffle_chbx">shuffle automatically after score</label>
				</div>
				<div class="container">
					<input type="checkbox" name="showTranslated" id="showTranslated" v-model="showTranslated">
					&nbsp;
					<label style="cursor: pointer" for="showTranslated">show translated</label>
				</div>
			</div>`,
		setup(props, context) {

			const automaticShuffle = Vue.ref(true)
			const correctAnswerStyles = ["spinRightEffect","spinLeftEffect"]
			const goodPoints = Vue.ref(10)
			const incorrectAnswerStyles = ["shakeEffect"]
			const isLoaded = Vue.ref(false)
			const languages = Vue.ref([])
			const languageFrom = Vue.ref("")
			const languageTo = Vue.ref("")
			const minusPoints = Vue.ref(5)
			const processing = Vue.ref(false)
			const scoreLocal = Vue.ref(score)
			const word = Vue.ref("")
			const showTranslated = Vue.ref(false)
			let shuffledItem = {}

			const randomEffect = function(items) {
				return items[Math.floor(Math.random()*items.length)];
			}
			let propName = "languageFrom"
			let propNameTranslated = "languageTo"

			const flipToFrom = function() {
				let temp = languageTo.value;
				languageTo.value = languageFrom.value
				languageFrom.value = temp
				if(propName == 'languageFrom') {
					propName = 'languageTo'
					propNameTranslated = 'languageFrom'
				} else {
					propName = 'languageFrom'
					propNameTranslated = 'languageTo'
				}
				word.value = shuffledItem[propName] ? shuffledItem[propName] : '---'
				shuffleLetters();
			}

			const calculateScore = function(isCorrect) {
				var currObject = this;
				scoreLocal.value.attempts++;
				
				if(isCorrect)
					scoreLocal.value.correctAnswers++;
				else
					scoreLocal.value.incorrectAnswers++;
				
				scoreLocal.value.points = scoreLocal.value.correctAnswers*goodPoints.value - scoreLocal.value.incorrectAnswers*minusPoints.value;
				scoreLocal.value.score = scoreLocal.value.attempts == 0 ? 0 : ((100*scoreLocal.value.correctAnswers)/(scoreLocal.value.attempts)).toFixed(0);
				
				var whatEffect = isCorrect ? randomEffect(correctAnswerStyles) : randomEffect(incorrectAnswerStyles);
				var whatScores = isCorrect ? "goodScores" : "badScores";
				
				$(".result h1").addClass(whatEffect);
				$(".result h1").addClass(whatScores);
				
				setTimeout(function() {
					$(".result h1").removeClass(whatEffect);
					$(".result h1").removeClass(whatScores);
					
					if(automaticShuffle.value) {
						currObject.shuffleWord();
					}
				}, 1000)
			}
			
			const editWord = function() {
				window.mittEmitter.emit('editWord', {header: "Edit word", item: shuffledItem});
			}
			
			const fillLanguagesDropdowns = function() {
				languages.value = languagesDropdowns.languages
				languageFrom.value = languagesDropdowns.languageForeign;
				languageTo.value = languagesDropdowns.languageOrigin;
			}
			
			const shuffleLetters = function() {
				setTimeout(function () {
					var container = $("#shuffledWord");
					var textToBeShuffled = word.value
					if(showTranslated.value) {
						textToBeShuffled = textToBeShuffled + ' (' + (shuffledItem[propNameTranslated] ? shuffledItem[propNameTranslated] : '---') + ')'
					}
					container.shuffleLetters({
						"text": textToBeShuffled
					});
				});
			}

			const shuffleWord = function () {
				let shuffledWord= sharedDictionaryData.items[Math.floor(Math.random()*sharedDictionaryData.items.length)];
				shuffledItem = shuffledWord
				word.value = shuffledItem[propName] ? shuffledItem[propName] : '---'
				scoreLocal.value.displayed++;

				shuffleLetters();
			}
			
			const cleanScore = function() {
				$(".score").addClass("hidden");
				
				setTimeout(function() {
					scoreLocal.value.points = 0;
					scoreLocal.value.attempts = 0;
					scoreLocal.value.score = 0;
					scoreLocal.value.displayed = 0;
					scoreLocal.value.correctAnswers = 0;
					scoreLocal.value.incorrectAnswers = 0;
					
					$(".score").removeClass("hidden");
				}, 500)
			}

			Vue.watch(showTranslated, (showTranslatedValue, oldShowTranslatedValue) => {
				shuffleLetters()
			})

			Vue.onMounted(function() {
				console.log('shuffle mounted')
	
				isLoaded.value = sharedDictionaryData.loaded
				
				if(sharedDictionaryData.items && sharedDictionaryData.items.length > 0) {
					shuffleWord();
					fillLanguagesDropdowns();
				}
	
				window.mittEmitter.on('dataLoaded', function(){
					isLoaded.value = sharedDictionaryData.loaded
					shuffleWord();
					fillLanguagesDropdowns();
				});
				window.mittEmitter.on('savedWord', function(changedItem){
					if(shuffledItem == changedItem) {
						word.value = shuffledItem[propName]
						shuffleLetters();
					}
				});	
			})
	
			isLoaded.value = sharedDictionaryData.loaded

			return {
				automaticShuffle,
				calculateScore,
				cleanScore,
				editWord,
				fillLanguagesDropdowns,
				flipToFrom,
				goodPoints,
				isLoaded,
				languages,
				languageFrom,
				languageTo,
				minusPoints,
				processing,
				randomEffect,
				scoreLocal,
				showTranslated,
				shuffleLetters,
				shuffleWord,
				word,
			}
		}
	}
