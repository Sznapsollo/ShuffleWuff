const Dictionary = {
	template: `
		<div style="width: 80%; margin: auto auto;">
			<div style="margin: 10px; display: block; text-align: center" class="form-inline">
				<div class="btn-group">
					<input type="checkbox" name="showTranslated" id="showTranslated" v-model="showTranslated">
					&nbsp;&nbsp;
					<label style="cursor: pointer" for="showTranslated">show translated</label>	
				</div>
				&nbsp;
				<button type="button" class="btn btn-light" v-if="sortOrder == 2" v-on:click="sortOrder=1"><i class="fa fa-sort-down"></i></button>
				<button type="button" class="btn btn-light" v-if="sortOrder == 1" v-on:click="sortOrder=2"><i class="fa fa-sort-up"></i></button>
				&nbsp;
				<div class="btn-group">
					<input id="searchinput" v-model="searchPhrase" placeholder="search" type="search" class="form-control" />
					<i v-if="searchPhrase.length > 0" id="searchclear" v-on:click="searchPhrase=''" class="fa fa-times-circle"></i>
				</div>
				<span style="padding-left: 10px">words: <strong>{{dictionaryListData.length}}</strong></span>
			</div>
			<ul id="dictionaryList" class="list-group">
				<dictionary-list-item 
					v-bind:showTranslated="showTranslated"
					v-bind:searchPhrase="searchPhrase" 
					v-bind:item="item" 
					v-bind:index="index" 
					v-bind:key="item.languageFrom" 
					v-for="(item, index) in dictionaryListData"
					></dictionary-list-item>
			</ul>
		</div>`,
	setup() {
		const searchPhrase = Vue.ref('')
		const sortOrder = Vue.ref(1)
		const dictionaryListData = Vue.ref([])
		const showTranslated = Vue.ref(true)

		let refreshDebounce
		const preparaListData = function() {
			clearTimeout(refreshDebounce)
			refreshDebounce = setTimeout(function() {preparaListDataInner()}, 200)
		}

		const preparaListDataInner = function() {
			console.log('prepare list data')
			var returnData = [];
			if(sortOrder.value == 1) {
				returnData = sharedDictionaryData.items.sort(function(a, b){
					if(a.languageFrom < b.languageFrom) { return -1; }
					if(a.languageFrom > b.languageFrom) { return 1; }
					return 0;
				})
			}				
			else if(sortOrder.value == 2) {
				returnData = sharedDictionaryData.items.sort(function(a, b){
					if(a.languageFrom > b.languageFrom) { return -1; }
					if(a.languageFrom < b.languageFrom) { return 1; }
					return 0;
				})
			}
			
			dictionaryListData.value =  returnData.filter(function(value) {
				let localLanguageFrom = value.languageFrom ? value.languageFrom : ''
				let localLanguageTo = value.languageTo ? value.languageTo : ''
				return (localLanguageFrom.toLowerCase().indexOf(searchPhrase.value.toLowerCase()) > -1) || 
				(localLanguageTo.toLowerCase().indexOf(searchPhrase.value.toLowerCase()) > -1);
			});	
		}

		const refreshList = function() {
			// hack to refresh list - just add dummy record and then remove
			dictionaryListData.value.push({});
			dictionaryListData.value.splice(sharedDictionaryData.items.length-1, 1);
			// end hack
		}
		
		Vue.watch(searchPhrase, (searchPhraseValue, oldSearchPhraseValue) => {
			preparaListData()
		})
		
		Vue.watch(sortOrder, (sortOrderValue, oldSortOrderValue) => {
			preparaListData()
		})

		Vue.onMounted(function() {
			window.mittEmitter.on('savedWord', function(changedItem) {
				preparaListData()
			}); 
			window.mittEmitter.on('deletedWord', function() {
				preparaListData()
			}); 
			preparaListData()
		})

		return {
			dictionaryListData,
			searchPhrase,
			showTranslated,
			sortOrder
		}
	}
}
