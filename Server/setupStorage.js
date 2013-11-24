var storage = require('node-localstorage').LocalStorage;

localStorage = new storage('./scratch');
localStorage.setItem('schedule', JSON.stringify(
	[{
		cron: "42 * * * *",
		zones: [.2,.1,.1,.1]
		}
	]
	));


console.log(localStorage.getItem('schedule'));
