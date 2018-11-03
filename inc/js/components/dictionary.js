const Dictionary = { 
		template: `
			<div style="width: 80%; margin: auto auto;">
				<div style="margin: 10px; display: block; text-align: center" class="form-inline">
					<button type="button" class="btn btn-light" v-if="sortOrder == 2" v-on:click="sortOrder=1"><i class="fa fa-sort-down"></i></button>
					
					<button type="button" class="btn btn-light" v-if="sortOrder == 1" v-on:click="sortOrder=2"><i class="fa fa-sort-up"></i></button>
					
					<div class="btn-group">
						<input id="searchinput" v-model="searchPhrase" placeholder="search" type="search" class="form-control" />
						<i v-if="searchPhrase.length > 0" id="searchclear" v-on:click="searchPhrase=''" class="fa fa-times-circle"></i>
					</div>
					<span style="padding-left: 10px">words: <strong>{{dictionaryListData.length}}</strong></span>
				</div>
				<ul id="dictionaryList" class="list-group">
					<dictionary-list-item 
						v-bind:searchPhrase="searchPhrase" 
						v-bind:item="item" 
						v-bind:index="index" 
						v-bind:key="index" 
						v-for="(item, index) in dictionaryListData"
						></dictionary-list-item>
				</ul>
			</div>`,
		data: function() {
			return {
				sortOrder: 1,
				searchPhrase: '',
				sharedDictionaryData,
			}
		},
		computed: {
			dictionaryListData: function() {
				
				var returnData = [];
				var currObj = this;
				
				if(this.sortOrder ==1) {
					returnData = this.sharedDictionaryData.items.sort(function(a, b){
						if(a < b) { return -1; }
						if(a > b) { return 1; }
						return 0;
					})
				}				
				else if(this.sortOrder ==2) {
					returnData = this.sharedDictionaryData.items.sort(function(a, b){
						if(a > b) { return -1; }
						if(a < b) { return 1; }
						return 0;
					})
				}
				
				return returnData.filter(function(value) {
					return value.toLowerCase().indexOf(currObj.searchPhrase.toLowerCase()) > -1;
				});	
			}
		}
	}
