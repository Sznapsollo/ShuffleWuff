<?php
error_reporting(E_ALL);
ini_set('display_errors', true);

$request = file_get_contents('php://input');
$input = json_decode($request);

if(isset($input->service))
{
	switch($input->service) 
	{
		case "CheckDictionaryData":
			require_once("Service.CheckDictionaryData.php");
			break;
		case "SaveDictionaryData":
			require_once("Service.SaveDictionaryData.php");
			break;
	}
}

?>
