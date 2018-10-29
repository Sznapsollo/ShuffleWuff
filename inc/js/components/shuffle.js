const Shuffle = { 
		template: `
			<div id="shuffleBox">
				<div class="container result">
					<div v-if="sharedDictionaryData.loaded">
						<h1 id="shuffledWord" >&nbsp;</h1>
						<a style="display: inline; opacity: 0.5" target="_blank" v-bind:href="'https://translate.google.com/translate_tts?ie=UTF-8&q='+encodeURI(word)+'&tl=en&client=tw-ob'"><i class="fa fa-2x fa-play-circle-o"></i></a>
					</div>
					<i v-if="!sharedDictionaryData.loaded" class="fa fa-cog fa-2x fa-spin"></i>
				</div>
				<div class="container">
					Points:<span class="score points" v-bind:class="{ goodScores: points > 0, badScores: points < 0 }">{{points}}</span>
					Attempts:<span class="score">{{attempts}}</span>
					Score:<span class="score points">{{score}}%</span>
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
					<label for="checkbox_id">Shuffle automatically after score</label>
				</div>
			</div>`,
		data: function() {
			return {
				word : "",
				attempts: 0,
				points: 0,
				score: 0,
				goodPoints: 10,
				minusPoints: 5,
				correctAnswers: 0,
				incorrectAnswers: 0,
				automaticShuffle: true,
				sharedDictionaryData
			}
		},
		methods: {
			calculateScore: function(isCorrect) {
				var currObject = this;
				
				if(isCorrect)
					this.correctAnswers++;
				else
					this.incorrectAnswers++;
				
				this.points = this.correctAnswers*this.goodPoints - this.incorrectAnswers*this.minusPoints;
				this.score = this.attempts == 0 ? 0 : ((100*this.correctAnswers)/(this.attempts)).toFixed(0);
				
				var whatEffect = isCorrect ? "spinEffect" : "shakeEffect";
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
			shuffleWord: function () {
				var currObj = this;
				this.word = sharedDictionaryData.items[Math.floor(Math.random()*sharedDictionaryData.items.length)];
				this.attempts++;

				setTimeout(function () {
					var container = $("#shuffledWord");
					container.shuffleLetters({
						"text": currObj.word
					});
					});
			},
			cleanScore: function() {
				this.points = 0;
				this.attempts = 0;
				this.score = 0;
				this.correctAnswers = 0;
				this.incorrectAnswers = 0;
			}
		},
		created: function() {
			if(this.sharedDictionaryData.items && this.sharedDictionaryData.items.length > 0) {
				this.shuffleWord();
			}
		},
		mounted: function() {
			var currentObj = this;
			this.$root.$on('dataLoaded', function(){
				currentObj.shuffleWord();
			}) 
		}
	}
