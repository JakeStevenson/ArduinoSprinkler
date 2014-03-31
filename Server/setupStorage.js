var storage = require('node-localstorage').LocalStorage;

localStorage = new storage('./storedSchedule');
localStorage.setItem('schedule', JSON.stringify(
	[
		{
			cron: "40 9 * * *",
			zones: [.5,.1,.1,.1]
		},
		{
			cron: "0 7 * * 1-5",
			zones: [20,10,10,10]
		}
	]
	));


console.log(localStorage.getItem('schedule'));
