<?php
error_reporting(E_ALL);
ini_set('display_errors', true);

require_once("Class.Helpers.php");

$fileName = null;
$fileContent = null;

function jsonToCsv ($json, $csvFilePath = false, $boolOutputFile = false) {
    
    // See if the string contains something
    if (empty($json)) { 
      die("The JSON string is empty!");
    }
    
    // If passed a string, turn it into an array
    if (is_array($json) === false) {
      $json = json_decode($json, true);
    }
	
	$boolEchoCsv = true;
	$strTempFile = 'csvOutput' . date("U") . ".csv";
    // If a path is included, open that file for handling. Otherwise, use a temp file (for echoing CSV string)
    if ($csvFilePath !== false) {
      $f = fopen($csvFilePath,'w+');
      if ($f === false) {
        die("Couldn't create the file to store the CSV, or the path is invalid. Make sure you're including the full path, INCLUDING the name of the output file (e.g. '../save/path/csvOutput.csv')");
      }
    }
    
    $firstLineKeys = false;
    foreach ($json as $line) {
      if (empty($firstLineKeys)) {
        $firstLineKeys = array_keys($line);
        fputcsv($f, $firstLineKeys);
        $firstLineKeys = array_flip($firstLineKeys);
      }
      
      // Using array_merge is important to maintain the order of keys acording to the first element
      fputcsv($f, array_merge($firstLineKeys, $line));
    }
    fclose($f);
  }

if(isset($input->receive) && isset($input->items)) {
	// $items = json_decode($input->items);
	$filepathname = Helpers::$dictionaryfilepathname;
	
	if (file_exists(Helpers::$dictionaryfilepathname)) { $fileContent = file_get_contents(Helpers::$dictionaryfilepathname); }
	
	if($fileContent) {
		$date = new DateTime();
		$backupfilepathname = str_replace("data.csv",$date->format("YmdHis")."_data.csv", $filepathname);
		file_put_contents($backupfilepathname, $fileContent);
	}
	
	// $textToFile = "";
	// foreach($items as $word) {
		
	// 	$textToFile .= strtolower($word)."\r\n";
	// }
	
	// file_put_contents($filepathname, $textToFile);
	
	jsonToCSV($input->items, Helpers::$dictionaryfilepathname);

	$returnData = new stdClass();
	echo json_encode($returnData);
}
?>
