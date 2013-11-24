var storage = require('node-localstorage').LocalStorage;

localStorage = new storage('./scratch');
localStorage.setItem('schedule', JSON.stringify(
	[{
		at: {
			hour: [07, 21],
			minute: 0 
		},
		zones: [.2,.1,.1,.1]
		},
	{
		at: {
			hour: [09, 21],
			minute: 0 
		},
		zones: [.2,.1,.1,.1]
		}
	]
	));


console.log(localStorage.getItem('schedule'));
