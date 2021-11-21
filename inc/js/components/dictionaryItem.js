app.component('dictionary-list-item', {
	props: ['index', 'item', 'searchPhrase', 'showTranslated'],
	template: `
		<li class="list-group-item">
			{{index+1}}.&nbsp;
			<a target="_self" v-bind:href="'#item-'+index" data-toggle="collapse" class="text-dark" style="display: inline-block; width: 90%">
				<i class="glyphicon glyphicon-chevron-right"></i>
				<span v-html="highlight(itemLanguageFrom)"></span>
				<span v-if="showTranslated">
					&nbsp;&nbsp;-&nbsp;&nbsp;
					<span v-html="highlight(itemLanguageTo)"></span>
				</span>
			</a>
			<a style="float: right" target="_blank" v-bind:href="prepareTranslatorVoiceLink(word, languageFrom)"><i class="fa fa-play-circle-o"></i></a>
			<div class="list-group collapse" v-bind:id="'item-'+index" style="text-align: center">  
				<div style="padding: 10px;">
					<a target="_blank" v-bind:href="prepareTranslatorLink(word, languageFrom, languageTo)">translate</a> 
					&nbsp;
					<select class="btn btn-mini" v-model="languageFrom"><option v-for="option in languages" v-bind:value="option">{{option}}</option></select>
					&nbsp;<a href="#" v-on:click="flipToFrom()">flip</a>&nbsp;
					<select class="btn btn-mini" v-model="languageTo"><option v-for="option in languages" v-bind:value="option">{{option}}</option></select>
				</div>
				<div>
					<ul class="list-inline">
						<li class="list-inline-item"><a href="#" v-on:click="editWord()" data-toggle="modal" data-target="#wordModal">edit</a></li>
						<li class="list-inline-item">
							<a v-if="shouldDelete == 0" v-on:click="shouldDelete=1" class="text-danger">delete</a>
							<a v-if="shouldDelete == 1" v-on:click="shouldDelete=2" class="text-danger">Are you sure?</a>
							<a v-if="shouldDelete == 2" v-on:click="deleteWord()" class="text-danger">Ok. Click to delete</a>
						</li>
					</ul>
				</div>
			</div>
		</li>
	`,
	setup: function(props, context) {
		const shouldDelete = Vue.ref(0)
		const languages = Vue.ref([])
		const languageFrom = Vue.ref('')
		const languageTo = Vue.ref('')
		const word = Vue.ref(props.item.languageFrom)
		const item = props.item
		const propName = Vue.ref("languageFrom")
		const itemLanguageFrom = Vue.ref(props.item.languageFrom)
		const itemLanguageTo = Vue.ref(props.item.languageTo)

		const highlight = function(item) {
			if(!props.searchPhrase) {
				return item;
			}
			return item.replace(new RegExp(props.searchPhrase, "gi"), match => {
				return '<span class="highlightText">' + match + '</span>';
			});
		}
		
		const flipToFrom = function() {
			let temp = languageTo.value;
			languageTo.value = languageFrom.value
			languageFrom.value = temp
			if(propName.value == 'languageFrom') {
				propName.value = 'languageTo'
			} else {
				propName.value = 'languageFrom'
			}
			word.value = item[propName.value] ? item[propName.value] : '---'
		}

		const fillLanguagesDropdowns = function() {
			languages.value = languagesDropdowns.languages
			languageFrom.value = languagesDropdowns.languageForeign;
			languageTo.value = languagesDropdowns.languageOrigin;
		}

		const deleteWord = function() {
			window.mittEmitter.emit('deleteWord', item.languageFrom);
			shouldDelete.value = 0;
			$("#item-" + props.index).collapse('toggle');
		}

		const editWord = function() {
			window.mittEmitter.emit('editWord', {header: "Edit word", item: Vue.toRaw(item)});
		}

		Vue.onMounted(function() {
			fillLanguagesDropdowns();
		})

		return {
			deleteWord,
			editWord,
			flipToFrom,
			highlight,
			itemLanguageFrom,
			itemLanguageTo,
			languageFrom,
			languages,
			languageTo,
			propName,
			shouldDelete,
			word
		}
	}
})
