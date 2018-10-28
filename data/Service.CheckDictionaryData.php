<?php
error_reporting(E_ALL);
ini_set('display_errors', true);

require_once("Class.Helpers.php");

$fileName = null;
$fileContent = null;

if(isset($input->receive)) {
	if (file_exists(Helpers::$dictionaryfilepathname)) { $fileContent = file_get_contents(Helpers::$dictionaryfilepathname); }
	
	$returnData = new stdClass();

	// for exceptions
	$returnData->items = explode("\n\r\n", $fileContent);

	if(count($returnData->items) <= 1)
		$returnData->items = array_filter(Helpers::Utf8ize(explode("\r\n", $fileContent)));
	
	echo json_encode($returnData);
}
?>
