# ShuffleWuff 

## About

ShuffleWuff is language learning Tool for kids. I build to do fun and efficient English lessons with my son. 

It is Vue.js (3.x) single page app, easily deployable requires just any web server with php support. Does not require database - works entirely on file content (which has its limitation when more users would use it in parallel) but for single lessons is perfect. File format is CSV.

## Demo
**<a href="http://cultrides.com/test/Github/ShuffleWuff" target="_blank">Click here to see Demo</a>** - of course adding new words and deleting existing dictionary items will not work in demo since its data file is shared for everyone. Demo contains example data which is also present in this repository under "dictionary/data.csv". It cannot be changed in demo but you would be able to change it if you hosted ShuffleWuff yourself and your server would have access to "dictionary/data.csv" file.

## How I use it 

So I have english lessons with my son. The way it works is that we have whiteboard and every lesson we use it to write down words that are new or require revisiting. After a couple of lessons table is full and at that point I write down the words - originally I was just putting them on some excel sheet but soon it turned out to be really boring and pointless - I ended up repeating same words and it was not that easy to look through them. So now I am putting new words and phrases into this tool - see "Add new word" navbar option. It allows quick entry/edit and also browsing is convenient - see "Dictionary" navbar option. It does not allow to introduce words that already are in dictionary.

To make remembering words and new phrases more efficient, at the end of every lesson, we make some exercises using "shuffle" mode - see "Shuffle" navbar option. What I do is we shuffle a word and then my son gives me its definition and pronunciation and some examples of how he would use it in some life scenarios. If he does good he gets "Good Score" once or even more depending on what we agreed. If he does not remember the word he should repeat it but gets "Bad Score".

In the end final score is used to determine what fun stuff we would do later on. The better the score the more treat would the young one get. 

There is also an option "Prepare test" which i use to generate some set of words latest or shuffled to check how the student will perform. This option allows to generate set of works in chosen language and copy it to clipboard or straightto printer. Very convinient to check set of words that were on the board for lat week or so and now is time to wipe them down to make place for new ones.

Also there are sounds associated to different buttons. These sounds can be disabled in settings. Sounds are there for one reason - if "student" uses ShuffleWuff with some task to do - he/she cannot cheat by changing unwanted word since sound would give it away.

This is how I do it. Perhaps you will also find it suit the way you teach your kid. Just please remember it is meant to be fun. 

## What you need to run it

You need any webserver to host the site. I host it in my local home network on Raspberry PI but any webserver would. do.

## Where is data stored

Data is stored in plain text csv file. The file is located in **<a href="https://github.com/Sznapsollo/ShuffleWuff/blob/master/dictionary/data.csv" target="_blank">"dictionary/data.csv"</a>** path. Each line is new word and its translation. This GitHub repository contains example file with example data - you can just delete all of it and introduce your content- through ShuffleWuff UI or just by directly changing this file content.

What is worth mentioning is that single text file as datasource is extremely convenient for single uses because it does not require any setup for databases etc.

However if it was used by few "lessons" at the same time and each of the lessons would perform saving at the same time this could lead to some data inconsistencies. If you wanted to run ShuffleWuff in few places at the same time I think it would be better idea to switch it to database data source.

## Notes

ShuffleWuff displays these "play" icons next to each word/phrase. These are links to Google Translator reading API. Unfortunately this API is not official and Google actually blocks it when you run it from any website. So when you click on such icon you will get new tab but most probably it will display "404" error. But fear not! ;-) ... you can actually still hear the work you just have to hit refresh button and if this still does not help (in some cases it works) you just need to focus on tab url and hit enter to sort of introduce url to the tab - then it will definitely work. Perhaps some day I will make it work but so far I did not find working solution and I have not much motivation to do so really...I do not use this option often - it is just feature.

In case you cannot add words - when you add word and click save, the dictionary resets itself - it is probably the case where your webserver has insufficient access rights to dictionary file folder. Change "dictionary" folder permission flags to 755 and that would solve it.

If you want to change paths to translator, services files, change from/to translate dropdown values or define default translate dropdown values - you can change all that in **<a href="https://github.com/Sznapsollo/ShuffleWuff/blob/master/settings.js" target="_blank">"settings.js"</a>** file.

Take care! 
Wanna touch base? office@webproject.waw.pl