$(document).ready(function()
{
	var $dictionaryList = $('#dictionaryList');
	$dictionaryList.on('show.bs.collapse','.collapse', function() {
		$dictionaryList.find('.collapse.show').collapse('hide');
	});
});
