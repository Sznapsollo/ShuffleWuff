const Shuffle = { 
		props: [],
		template: `
			<div id="shuffleBox">
				<div class="container result">
					<div v-if="isLoaded">
						<h1 id="shuffledWord" >&nbsp;</h1>
						<a style="display: inline; opacity: 0.5" target="_blank" v-bind:href="prepareTranslatorVoiceLink(word, languageFrom)"><i class="fa fa-2x fa-play-circle-o"></i></a>
						<div>
							<select style="width: 80px" class="btn btn-mini" v-model="languageFrom"><option v-for="option in languages" v-bind:value="option">{{option}}</option></select>
							&nbsp;<a href="#" v-on:click="flipToFrom()">flip</a>&nbsp;
							<select style="width: 80px" class="btn btn-mini" v-model="languageTo"><option v-for="option in languages" v-bind:value="option">{{option}}</option></select>
						</div>
						&nbsp;
						<div>
							<a target="_blank" href="#" v-on:click="editWord()" data-toggle="modal" data-target="#wordModal">edit</a> 
							&nbsp;
							<a target="_blank" v-bind:href="prepareTranslatorLink(word, languageFrom, languageTo)">translate</a> 
							&nbsp;
						</div>
					</div>
					<i v-if="!isLoaded" class="fa fa-cog fa-2x fa-spin"></i>
				</div>
				<div class="container" style="padding-bottom: 0px;">
					Points:<span class="score points" v-bind:class="{ goodScores: scoreLocal.points > 0, badScores: scoreLocal.points < 0 }">{{scoreLocal.points}}</span>
					Word No.:<span class="score">{{scoreLocal.displayed}}</span>
					Score:<span class="score points">{{scoreLocal.score}}%</span>
				</div>
				<div class="container" style="padding-top: 0px;">
					Good:<span class="score goodScores">{{scoreLocal.correctAnswers}}</span>
					Skipped:<span class="score">{{scoreLocal.skippedAnswers}}</span>
					Bad:<span class="score badScores">{{scoreLocal.incorrectAnswers}}</span>
				</div>
				<div class="container">
					<button type="button" class="btn btn-success btn-lg" v-on:click="generatePointsOptions(true)">Good answer</button>
					&nbsp;
					<button type="button" class="btn btn-danger btn-lg" v-on:click="generatePointsOptions(false)">Bad answer</button>
				</div>
				<div class="container" v-if="pointsButtons.length" class="pointsOptions">
					<div v-if="showPointsTimerBarColor" v-bind:style="{background: showPointsTimerBarColor }" style="opacity: 0.6; height: 5px; width: 80%; display: inline-block; animation: shrinkWidth 5.0s both; margin: 0 0 5px 0;"></div>
					<br>
					<button type="button" style="margin: 0 3px 0 3px;" class="btn btn-lg pointsButton" v-for="pointsButton in pointsButtons" v-bind:class="{ 'btn-success': pointsButton.points > 0, 'btn-danger': pointsButton.points < 0}" v-on:click="calculateScore(pointsButton.points)">{{pointsButton.points}}</button>
				</div>
				<div class="container">
					<button type="button" class="btn btn-light" v-on:click="shuffleWord(true)">Shuffle another</button>
					&nbsp;
					<button type="button" class="btn btn-light" v-on:click="shouldCleanScore()">Clean Score</button>
				</div>
				<div v-if="wordsHistory.length || clipboardWord" class="container">
					<a v-if="wordsHistory.length" href="#" v-on:click="goBack()"><i class="fa fa-arrow-left" aria-hidden="true"></i>&nbsp;previous word</a>
					&nbsp;
					<a v-if="clipboardWord" href="#" v-on:click="goForth()">next word&nbsp;<i class="fa fa-arrow-right" aria-hidden="true"></i></a>
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
			const incorrectAnswerStyles = ["shakeEffect"]
			const isLoaded = Vue.ref(false)
			const languages = Vue.ref([])
			const languageFrom = Vue.ref("")
			const languageTo = Vue.ref("")
			const processing = Vue.ref(false)
			const scoreLocal = Vue.ref(score)
			const word = Vue.ref("")
			const showTranslated = Vue.ref(false)
			let shuffledItem = {}
			const wordsHistory = Vue.ref([])
			const pointsButtons = Vue.ref([])
			const clipboardWord = Vue.ref(null)
			let pointsButtonsClearHandle = null
			let showPointsTimerBarColor = Vue.ref(null)

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

			const playVoice = function(readText) {
				try {
					if(!userSettings.playVoice) {
						return
					}
					readText += '';
					if(!readText || !readText.length) {
						return;
					}
					var msg = new SpeechSynthesisUtterance();
					msg.text = readText;
					window.speechSynthesis.speak(msg);
				} catch(e) {
					console.warn('playVoice warn')
				}
			}

			const clearPointsButtons = function() {
				showPointsTimerBarColor.value = null
				if(pointsButtonsClearHandle) {
					clearTimeout(pointsButtonsClearHandle)
					pointsButtonsClearHandle = null
				}
				pointsButtons.value = []
			}

			const generatePointsOptions = function(isCorrect) {
				showPointsTimerBarColor.value = null
				setTimeout(function() {showPointsTimerBarColor.value = isCorrect ? '#218838' : '#c82333'})
				
				if(isCorrect) {
					pointsButtons.value = [
						{points: 10},
						{points: 15},
						{points: 20},
						{points: 25},
						{points: 30}
					]
				} else {
					pointsButtons.value = [
						{points: -5},
						{points: -10},
						{points: -20},
						{points: -30},
						{points: -40}
					]
				}

				if(pointsButtonsClearHandle) {
					clearTimeout(pointsButtonsClearHandle)
					pointsButtonsClearHandle = null
				}

				pointsButtonsClearHandle = setTimeout(function() {
					clearPointsButtons()
				}, 5000)
			}

			const calculateScore = function(points) {
				clearPointsButtons()
				points = Number.isInteger(points) ? points : 0
				var isCorrect = (points > 0)
				scoreLocal.value.attempts++;
				
				if(isCorrect) {
					scoreLocal.value.correctAnswers++;
					if(userSettings.playGoodAnswerSound) {
						playSound('good')
					}
				} else {
					scoreLocal.value.incorrectAnswers++;
					if(userSettings.playBadAnswerSound) {
						playSound('bad')
					}
				}

				playVoice(points)
				
				scoreLocal.value.points += points;
				scoreLocal.value.score = scoreLocal.value.attempts == 0 ? 0 : ((100*scoreLocal.value.correctAnswers)/(scoreLocal.value.attempts)).toFixed(0);
				
				var whatEffect = isCorrect ? randomEffect(correctAnswerStyles) : randomEffect(incorrectAnswerStyles);
				var whatScores = isCorrect ? "goodScores" : "badScores";
				
				$(".result h1").addClass(whatEffect);
				$(".result h1").addClass(whatScores);
				
				setTimeout(function() {
					$(".result h1").removeClass(whatEffect);
					$(".result h1").removeClass(whatScores);
					
					if(automaticShuffle.value) {
						shuffleWord();
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
				clearPointsButtons()
				setTimeout(function () {
					var container = $("#shuffledWord");
					var textToBeShuffled = word.value
					if(showTranslated.value) {
						textToBeShuffled = textToBeShuffled + ' (' + (shuffledItem[propNameTranslated] ? shuffledItem[propNameTranslated] : '---') + ')'
					}
					container.shuffleLetters({
						"text": textToBeShuffled
					});
					$(':focus').blur();
				});
			}

			const goBack = function() {
				if(!wordsHistory.value || !wordsHistory.value.length) {
					return
				}
				clipboardWord.value = word.value
				word.value = wordsHistory.value.pop()
				shuffleLetters();
				if(userSettings.playGoBackSound) {
					playSound('goBack');
				}
			}

			const goForth = function() {
				if(!clipboardWord.value || !clipboardWord.value.length) {
					return
				}
				if(word.value && word.value.length) {
					wordsHistory.value.push(word.value);
				}
				word.value = clipboardWord.value;
				clipboardWord.value = null;
				shuffleLetters();
				if(userSettings.playGoForthSound) {
					playSound('goForth');
				}
			}

			const shuffleWord = function (byUser) {
				if(word.value && word.value.length) {
					wordsHistory.value.push(word.value);
				}
				clipboardWord.value = null;

				let shuffledWord= sharedDictionaryData.items[Math.floor(Math.random()*sharedDictionaryData.items.length)];
				shuffledItem = shuffledWord;
				word.value = shuffledItem[propName] ? shuffledItem[propName] : '---';
				scoreLocal.value.displayed++;

				if(byUser == true) {
					scoreLocal.value.skippedAnswers++;
					if(userSettings.playSkipAnswerSound) {
						playSound('skip');
					}
				}

				shuffleLetters();
			}
			
			const shouldCleanScore = function() {
				if(scoreLocal.value.displayed == 0) {
					return
				}
				var test = confirm('Clean score?')
				if(test) {
					cleanScore()
				}
			}

			const cleanScore = function() {
				$(".score").addClass("hidden");
				
				wordsHistory.value = [];

				setTimeout(function() {
					scoreLocal.value.points = 0;
					scoreLocal.value.attempts = 0;
					scoreLocal.value.score = 0;
					scoreLocal.value.displayed = 0;
					scoreLocal.value.correctAnswers = 0;
					scoreLocal.value.skippedAnswers = 0;
					scoreLocal.value.incorrectAnswers = 0;
					
					$(".score").removeClass("hidden");
				}, 500)
			}

			const manageKeyDown = function(e) {
				try {
					if(!e || !e.key || !window) {
						return
					}

					if(!$("#shuffleBox").is(":visible")) {
						return
					}

					if($('.modal.show').length) {
						return
					}
				
					// console.log('shuffle manageKeyDown ', e.key);

					// There are many cases in switch because Edge and Chrome have different keys' names. I could use keyCodes, but they are harder to read and maintain imo.
					switch (e.key) {
						case '-':
							break;
						case '=':
						case '+':
							break;
						case 'Esc':
						case 'Escape':
							shouldCleanScore();
							break;
						case 'Left':
						case 'ArrowLeft':
							goBack();
							break;
						case 'Right':
						case 'ArrowRight':
							if(clipboardWord.value && clipboardWord.value.length) {
								goForth();
							} else {
								shuffleWord(true)
							}
							break;
						case 'b':
						case 'B':
							if(showPointsTimerBarColor.value && pointsButtons.value && pointsButtons.value.length) {
								calculateScore(pointsButtons.value[0].points)
							} else {
								generatePointsOptions(false);
							}
							break;
						case ' ':
						case 'Enter':
							if(showPointsTimerBarColor.value && pointsButtons.value && pointsButtons.value.length) {
								calculateScore(pointsButtons.value[0].points)
							} else {
								generatePointsOptions(true);
							}
							break
						case 'ArrowUp':
						case 'Up':
							break;
						case 'Down':
						case 'ArrowDown':
							break;
					}
				} catch(e) {
					console.warn('manageKeyDown warn');
				}
			}

			Vue.watch(showTranslated, (showTranslatedValue, oldShowTranslatedValue) => {
				shuffleLetters()
			})

			Vue.onMounted(function() {
				console.log('shuffle mounted')
	
				isLoaded.value = sharedDictionaryData.loaded
				
				if(!shuffledItem.languageFrom && sharedDictionaryData.items && sharedDictionaryData.items.length > 0) {
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
				window.mittEmitter.on('manageKeyDown', manageKeyDown);	
			})
	
			isLoaded.value = sharedDictionaryData.loaded

			return {
				automaticShuffle,
				calculateScore,
				cleanScore,
				clipboardWord,
				editWord,
				fillLanguagesDropdowns,
				flipToFrom,
				generatePointsOptions,
				goBack,
				goForth,
				isLoaded,
				languages,
				languageFrom,
				languageTo,
				pointsButtons,
				processing,
				randomEffect,
				scoreLocal,
				shouldCleanScore,
				showTranslated,
				shuffleLetters,
				shuffleWord,
				showPointsTimerBarColor,
				word,
				wordsHistory
			}
		}
	}
