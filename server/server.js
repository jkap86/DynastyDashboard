const express = require('express')
const path = require('path')
const app = express()
const compression = require('compression')
const cors = require('cors')
const axios = require('axios')
const fs = require('fs')
const http = require('http');
const projections = require('./workers/workerProjections')
const projections_weekly = require('./workers/workerProjections_Weekly')
const dv = require('./workers/workerDV')
const leagues = require('./workers/workerLeagues')
const { Worker, isMainThread } = require('worker_threads');

app.use(compression())
app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, '../client/build')));

setInterval(() => {
	http.get('http://dynastydashboard.herokuapp.com/');
}, 1000 * 60 * 29)

const getAllPlayers = async () => {
	let allplayers = await axios.get('https://api.sleeper.app/v1/players/nfl', { timeout: 3000 })
	let ap = JSON.stringify(allplayers.data)
	fs.writeFileSync('../client/src/allPlayers.json', ap)
	app.set('allplayers', ap)
}
getAllPlayers()
setInterval(getAllPlayers, 1000 * 60 * 60 * 24)

app.get('/user', async (req, res) => {
	const username = req.query.username
	try {
		const user = await axios.get(`https://api.sleeper.app/v1/user/${username}`, { timeout: 3000 })
		res.send(user.data)
	} catch (error) {
		res.send(error)
	}
})

app.get('/dynastyvalues', dv)

app.get('/projections', projections)

app.get('/projections_weekly', projections_weekly)

app.get('/leagues', leagues)

app.get('/transactions', async (req, res, next) => {
	if (isMainThread) {
		const username = req.query.username
		const state = await axios.get(`https://api.sleeper.app/v1/state/nfl`, { timeout: 3000 })
		const season = state.data.league_season
		const worker = new Worker('./workerTransactions.js', {
			workerData: {
				username: username,
				season: season
			}
		});
		worker.on('message', result => {
			res.send(result)
		})
	}

})

app.get('*', async (req, res) => {
	res.sendFile(path.join(__dirname, '../client/build/index.html'));
})

const port = process.env.PORT || 5000
app.listen(port, () => {
	console.log(`server running on port ${port}`);
});