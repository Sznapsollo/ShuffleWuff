$(document).ready(function()
{
	var $dictionaryList = $('#dictionaryList');
	$dictionaryList.on('show.bs.collapse','.collapse', function() {
		$dictionaryList.find('.collapse.show').collapse('hide');
	});
});


Date.prototype.yyyymmdd = function() {
	var mm = this.getMonth() + 1; // getMonth() is zero-based
	var dd = this.getDate();
  
	return [this.getFullYear(),
			(mm>9 ? '' : '0') + mm,
			(dd>9 ? '' : '0') + dd
		   ].join('');
};

  /* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function PrintData(data)
{
    var mywindow = window.open('', 'PRINT', 'height=400,width=600');

	mywindow.document.write('<html><head><title>' + document.title  + '</title>');
	mywindow.document.write('<link rel="stylesheet" href="inc/css/styles.css" />');
    mywindow.document.write('</head><body >');
    mywindow.document.write(data);
    mywindow.document.write('</body></html>');

    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10*/

	// without timeou there are no styles so going with it for now
	setTimeout(function() {
		mywindow.print();
    	mywindow.close();	
	}, 100)
    
    return true;
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
        c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
        }
    }
    return "";
}

var sounds = {}
function playSound(type) {
    try {
        let soundFile
        if(!sounds[type]) {
            switch(type) {
                case 'good':
                    sounds[type] = new Audio('inc/sounds/bellbike.wav')
                    break;
                case 'bad':
                    sounds[type] = new Audio('inc/sounds/fart.wav')
                    break;
                case 'skip':
                    sounds[type] = new Audio('inc/sounds/combteeth.wav')
                    break;
            }
        }
        if(sounds[type]) {
            if (sounds[type].paused) {
                sounds[type].play();
            } else{
                sounds[type].currentTime = 0
            }
        }
    } catch(e) {
        console.warn('playAlertSound warn')
    }
}