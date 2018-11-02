Vue.component('dictionary-list-item', {
	props: ['index', 'item', 'searchPhrase'],
	template: `
		<li class="list-group-item">
			<a target="_self" v-bind:href="'#item-'+index" data-toggle="collapse" class="text-dark" style="display: inline-block; width: 90%">
				<i class="glyphicon glyphicon-chevron-right"></i>
				<span v-html="highlight(item)"></span>
			</a>
			<a style="float: right" target="_blank"  v-bind:href="prepareTranslatorLink(item)"><i class="fa fa-play-circle-o"></i></a>
			
			<div class="list-group collapse" v-bind:id="'item-'+index" style="text-align: center">    
				<ul class="list-inline">
					<li class="list-inline-item"><a href="#" v-on:click="editWord(item)" data-toggle="modal" data-target="#wordModal">Edit word</a></li>
					<li class="list-inline-item">
						<a v-if="shouldDelete == 0" v-on:click="shouldDelete=1" class="text-danger">Delete word</a>
						<a v-if="shouldDelete == 1" v-on:click="shouldDelete=2" class="text-danger">Are you sure?</a>
						<a v-if="shouldDelete == 2" v-on:click="deleteWord(item)" class="text-danger">Ok. Click to delete</a>
					</li>
				</ul>
			</div>
		</li>
	`,
	data: function() {
		return {
			sharedDictionaryData,
			shouldDelete: 0
		}
	},
	methods: {
			highlight: function(item) {
				if(!this.searchPhrase) {
					return item;
				}
				return item.replace(new RegExp(this.searchPhrase, "gi"), match => {
					return '<span class="highlightText">' + match + '</span>';
				});
			},
			deleteWord: function(item) {
				this.$root.$emit('deleteWord', item);
				this.shouldDelete = 0;
				$("#item-"+this.index).collapse('toggle');
			},
			editWord: function(item) {
				this.$root.$emit('editWord', {header: "Edit word", item: item});
			}
		},
})
