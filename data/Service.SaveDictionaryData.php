<?php
error_reporting(E_ALL);
ini_set('display_errors', true);

require_once("Class.Helpers.php");

$fileName = null;
$fileContent = null;

if(isset($input->receive) && isset($input->items)) {
	$items = array_unique(json_decode($input->items));
	$filepathname = Helpers::$dictionaryfilepathname;
	
	if (file_exists(Helpers::$dictionaryfilepathname)) { $fileContent = file_get_contents(Helpers::$dictionaryfilepathname); }
	
	if($fileContent) {
		$date = new DateTime();
		$backupfilepathname = str_replace("data.txt",$date->format("YmdHis")."_data.txt", $filepathname);
		file_put_contents($backupfilepathname, $fileContent);
	}
	
	$textToFile = "";
	foreach($items as $word) {
		
		$textToFile .= strtolower($word)."\r\n";
	}
	
	file_put_contents($filepathname, $textToFile);
	
	$returnData = new stdClass();
	echo json_encode($returnData);
}
?>
