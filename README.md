Allow a mongo user to 'tag' and 'save' commonly-used queries, so they can be recalled and run at will, even across sessions

Download control-rq.js.zip and extract it to a location of your choice.
In your mongo client, (at the shell), load control-rq.js using something like the following:

Krishnans-MacBook-Pro:control-rq km$ mongo
MongoDB shell version: 2.2.1
connecting to: test
> load('control-rq.js')
