<?php

class Helpers
{
	public static $dictionaryfilepathname = '../dictionary/data.txt';
	public static function Utf8ize($d) {
		if (is_array($d)) {
			foreach ($d as $k => $v) {
				$d[$k] = Helpers::Utf8ize($v);
			}
		} else if (is_string ($d)) {
			return utf8_encode($d);
		}
		return $d;
	}

}
?>
