<?php
error_reporting(E_ALL);
ini_set('display_errors', true);

require_once("Class.Helpers.php");

$fileName = null;
$fileContent = null;

function csv_to_array($filename='', $delimiter=',')
{
    if(!file_exists($filename) || !is_readable($filename))
        return FALSE;

    $header = NULL;
    $data = array();
    if (($handle = fopen($filename, 'r')) !== FALSE)
    {
        while (($row = fgetcsv($handle, 1000, $delimiter)) !== FALSE)
        {
            if(!$header) {
				$header = $row;
			}
            else {
				$data[] = array_combine($header, array_pad($row, 3, null));
			}
        }
        fclose($handle);
    }
    return $data;
}

if(isset($input->receive)) {
	//if (file_exists(Helpers::$dictionaryfilepathname)) { $fileContent = file_get_contents(Helpers::$dictionaryfilepathname); }
	
	$returnData = new stdClass();
	$returnData->items = csv_to_array(Helpers::$dictionaryfilepathname);

	// for exceptions
	//$returnData->items = explode("\n\r\n", $fileContent);

	//if(count($returnData->items) <= 1)
	//	$returnData->items = array_filter(Helpers::Utf8ize(explode("\r\n", $fileContent)));
	
	echo json_encode($returnData);
}
?>
