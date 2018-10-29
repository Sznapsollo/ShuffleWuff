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
					Score:<span class="score points" v-bind:class="{ goodScores: score > 0, badScores: score < 0 }">{{score}}</span>
					Words displayed:<span class="score">{{wordsDisplayed}}</span>
				</div>
				<div class="container">
					<button type="button" class="btn btn-success btn-lg" v-on:click="changeScore(addPoints)">Good answer</button>
					<button type="button" class="btn btn-danger btn-lg" v-on:click="changeScore(minusPoints)">Bad answer</button>
				</div>
				<div class="container">
					<button type="button" class="btn btn-light" v-on:click="shuffleWord()">Shuffle another</button>
					<button type="button" class="btn btn-light" v-on:click="cleanScore()">Clean Score</button>
				</div>
			</div>`,
		data: function() {
			return {
				word : "",
				wordsDisplayed: 0,
				score: 0,
				addPoints: 10,
				minusPoints: -5,
				sharedDictionaryData
			}
		},
		methods: {
			changeScore: function(points) {
				this.score += points;
				
				var whatEffect = points >=0 ? "spinEffect" : "shakeEffect";
				var whatScores = points >=0 ? "goodScores" : "badScores";
				
				$(".result h1").addClass(whatEffect);
				$(".result h1").addClass(whatScores);
				
				setTimeout(function() {
					$(".result h1").removeClass(whatEffect);
					$(".result h1").removeClass(whatScores);
					}, 1000)
				
			},
			shuffleWord: function () {
				var currObj = this;
				this.word = sharedDictionaryData.items[Math.floor(Math.random()*sharedDictionaryData.items.length)];
				this.wordsDisplayed++;

				setTimeout(function () {
					var container = $("#shuffledWord");
					container.shuffleLetters({
						"text": currObj.word
					});
					});
			},
			cleanScore: function() {
				this.score = 0;
				this.wordsDisplayed = 0;
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
