const Shuffle = { 
		template: `
			<div id="shuffleBox">
				<div class="container result">
					<div v-if="sharedDictionaryData.loaded">
						<h1 id="shuffledWord" >&nbsp;</h1>
						<a style="display: inline; opacity: 0.5" target="_blank" v-bind:href="prepareTranslatorVoiceLink(word)"><i class="fa fa-2x fa-play-circle-o"></i></a>
						<div>
							<a target="_blank" href="#" v-on:click="editWord(word)" data-toggle="modal" data-target="#wordModal">edit</a> 
							&nbsp;
							<a target="_blank" v-bind:href="prepareTranslatorLink(word, languageFrom, languageTo)">translate</a> 
							&nbsp;
							<select class="btn btn-mini" v-model="languageFrom"><option v-for="option in languagesDropdowns.languagesFrom" v-bind:value="option">{{option}}</option></select>
							&nbsp;-&nbsp;
							<select class="btn btn-mini" v-model="languageTo"><option v-for="option in languagesDropdowns.languagesTo" v-bind:value="option">{{option}}</option></select>
						</div>
					</div>
					<i v-if="!sharedDictionaryData.loaded" class="fa fa-cog fa-2x fa-spin"></i>
				</div>
				<div class="container">
					Points:<span class="score points" v-bind:class="{ goodScores: score.points > 0, badScores: score.points < 0 }">{{score.points}}</span>
					Word No.:<span class="score">{{score.displayed}}</span>
					Score:<span class="score points">{{score.score}}%</span>
				</div>
				<div class="container">
					<button type="button" class="btn btn-success btn-lg" v-on:click="calculateScore(true)">Good answer</button>
					<button type="button" class="btn btn-danger btn-lg" v-on:click="calculateScore(false)">Bad answer</button>
				</div>
				<div class="container">
					<button type="button" class="btn btn-light" v-on:click="shuffleWord()">Shuffle another</button>
					<button type="button" class="btn btn-light" v-on:click="cleanScore()">Clean Score</button>
				</div>
				<div class="container">
					<input type="checkbox" name="automatic_shuffle" id="automatic_shuffle_chbx" v-model="automaticShuffle">
					<label style="cursor: pointer" for="automatic_shuffle_chbx">Shuffle automatically after score</label>
				</div>
			</div>`,
		data: function() {
			return {
				processing: false,
				word : "",
				goodPoints: 10,
				minusPoints: 5,
				automaticShuffle: true,
				sharedDictionaryData,
				score,
				correctAnswerStyles: ["spinRightEffect","spinLeftEffect"],
				incorrectAnswerStyles: ["shakeEffect"],
				languagesDropdowns,
				languageFrom: "",
				languageTo: ""
			}
		},
		methods: {
			calculateScore: function(isCorrect) {
				var currObject = this;
				this.score.attempts++;
				
				if(isCorrect)
					this.score.correctAnswers++;
				else
					this.score.incorrectAnswers++;
				
				this.score.points = this.score.correctAnswers*this.goodPoints - this.score.incorrectAnswers*this.minusPoints;
				this.score.score = this.score.attempts == 0 ? 0 : ((100*this.score.correctAnswers)/(this.score.attempts)).toFixed(0);
				
				var whatEffect = isCorrect ? this.randomEffect(this.correctAnswerStyles) : this.randomEffect(this.incorrectAnswerStyles);
				var whatScores = isCorrect ? "goodScores" : "badScores";
				
				$(".result h1").addClass(whatEffect);
				$(".result h1").addClass(whatScores);
				
				setTimeout(function() {
					$(".result h1").removeClass(whatEffect);
					$(".result h1").removeClass(whatScores);
					
					if(currObject.automaticShuffle) {
						currObject.shuffleWord();
					}
				}, 1000)
			},
			editWord: function(item) {
				this.$root.$emit('editWord', {header: "Edit word", item: item});
			},
			fillLanguagesDropdowns: function() {
				this.languageFrom = this.languagesDropdowns.defaultTranslateFrom;
				this.languageTo = this.languagesDropdowns.defaultTranslateTo;
			},
			randomEffect: function(items) {
				return items[Math.floor(Math.random()*items.length)];
			},
			shuffleWord: function () {
				var currObj = this;
				this.word = sharedDictionaryData.items[Math.floor(Math.random()*sharedDictionaryData.items.length)];
				this.score.displayed++;

				this.shuffleLetters(this);
			},
			shuffleLetters: function(currObj, word) {
				setTimeout(function () {
					var container = $("#shuffledWord");
					container.shuffleLetters({
						"text": currObj.word
					});
				});
			},
			cleanScore: function() {
				var currentObj = this;
				$(".score").addClass("hidden");
				
				setTimeout(function() {
					currentObj.score.points = 0;
					currentObj.score.attempts = 0;
					currentObj.score.score = 0;
					currentObj.score.displayed = 0;
					currentObj.score.correctAnswers = 0;
					currentObj.score.incorrectAnswers = 0;
					
					$(".score").removeClass("hidden");
				}, 500)
			}
		},
		created: function() {
			if(this.sharedDictionaryData.items && this.sharedDictionaryData.items.length > 0) {
				this.shuffleWord();
				this.fillLanguagesDropdowns();
			}
		},
		mounted: function() {
			var currentObj = this;
			this.$root.$on('dataLoaded', function(){
				currentObj.shuffleWord();
				currentObj.fillLanguagesDropdowns();
			});
			this.$root.$on('saveWord', function(orgItem, changedItem, addAnother){
				if(currentObj.word == orgItem) {
					currentObj.word = changedItem;
					currentObj.shuffleLetters(currentObj);
				}
			});	
		}
	}
