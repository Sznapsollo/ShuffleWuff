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
			
			<div v-bind:style="{height: windowHeight + 'px' }" style="overflow: scroll;overflow-x: hidden;" class="dictionaryListScroller">
				<ul id="dictionaryList" class="list-group">
					<dictionary-list-item 
						v-bind:showTranslated="showTranslated"
						v-bind:searchPhrase="searchPhrase" 
						v-bind:item="item" 
						v-bind:index="index" 
						v-bind:key="item.languageFrom" 
						v-for="(item, index) in dictionaryListDataDisplayed"
						>
					</dictionary-list-item>
					<div v-show="dataLoading" style="width: 100%; text-align: center;"><img src="./inc/loading.gif" style="border-radius: 5px; width: 100px; "></div>
				</ul>
			</div>
		</div>`,
	setup() {
		const windowHeight = Vue.ref(500)
		const searchPhrase = Vue.ref('')
		const sortOrder = Vue.ref(1)
		const dictionaryListData = Vue.ref([])
		const dictionaryListDataDisplayed = Vue.ref([])
		const showTranslated = Vue.ref(true)
		const route = VueRouter.useRoute()
		const dataLoading = Vue.ref(false)
		let showRowsNum = 100
		let scrollPosition = 0

		var requestWarningsScrollHandle
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

			dictionaryListDataDisplayed.value = dictionaryListData.value.slice(0,showRowsNum)
			if(dictionaryListDataDisplayed.value.length < dictionaryListData.value.length) {
				dataLoading.value = true
			} else {
				dataLoading.value = false
			}
		}

		const refreshList = function() {
			// hack to refresh list - just add dummy record and then remove
			dictionaryListDataDisplayed.value.push({});
			dictionaryListDataDisplayed.value.splice(sharedDictionaryData.items.length-1, 1);
			// end hack
		}
		
		Vue.watch(searchPhrase, (searchPhraseValue, oldSearchPhraseValue) => {
			preparaListData()
		})
		
		Vue.watch(sortOrder, (sortOrderValue, oldSortOrderValue) => {
			preparaListData()
		})

		Vue.onUpdated(function() {
			if(scrollPosition) {
				$('.dictionaryListScroller').scrollTop(scrollPosition)
			}
		})

		Vue.onMounted(function() {
			$('.dictionaryListScroller').scroll(function() {
				if(requestWarningsScrollHandle) {
					clearTimeout(requestWarningsScrollHandle)
					requestWarningsScrollHandle = null
				}
				
				requestWarningsScrollHandle = setTimeout(function() {

					let rqsModalBody = '.dictionaryListScroller'
					// did hit bottom
					var modal_scrollTop = $(rqsModalBody).scrollTop();
					var modal_scrollHeight = $(rqsModalBody).prop('scrollHeight');
					var modal_innerHeight = $(rqsModalBody).innerHeight();
					// // Write to console log to debug:
					// console.warn('modal_scrollTop: ' + modal_scrollTop);
					// console.warn('modal_innerHeight: ' + modal_innerHeight);
					// console.warn('modal_scrollHeight: ' + modal_scrollHeight);
				
					// // Bottom reached:
					if (modal_scrollTop + modal_innerHeight >= (modal_scrollHeight - 100)) {
						// console.log('hit bottom');

						if(dictionaryListDataDisplayed.value.length >= dictionaryListData.value.length) {
							return;
						}
						showRowsNum += 100;
						preparaListData();
						// bottom reached
					} else {
						// scrolled
						scrollPosition = modal_scrollTop
					} 
				}, 100)
			});

			windowHeight.value = window.innerHeight - 150
			window.mittEmitter.on('savedWord', function(changedItem) {
				preparaListData()
			}); 
			window.mittEmitter.on('deletedWord', function() {
				preparaListData()
			}); 
			preparaListData()
		})

		return {
			dataLoading,
			dictionaryListData,
			dictionaryListDataDisplayed,
			searchPhrase,
			showTranslated,
			sortOrder,
			windowHeight
		}
	}
}
