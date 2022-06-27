const express = require('express')
const router = express.Router()
const axios = require('axios')
const cheerio = require('cheerio')


const getProjections_Weekly = async (week) => {
    let projections = []
    const page_QB = await axios.get(`https://www.fantasypros.com/nfl/projections/qb.php?week=${week}`)

    let $ = cheerio.load(page_QB.data)
    $('.js-tr-game-select').each((index, element) => {
        let name = $(element).find("td").first().text().trim().split(' ')
        let team = name.pop()
        name = name.join(' ')
        let searchName = name.replace('Jr', '').replace('III', '').replace('II', '').replace('IV', '').replace(/[^0-9a-z]/gi, '').toLowerCase()
        let fpts = $(element).find("td").last().text()
        projections.push({
            name: name,
            position: 'QB',
            team: team,
            searchName: searchName,
            value: parseFloat(fpts),
            updated_value: parseFloat(fpts),
            isPlayerHidden: false
        })
    })

    const page_FLEX = await axios.get(`https://www.fantasypros.com/nfl/projections/flex.php?week=draft&scoring=PPR&week=${week}`)

    $ = cheerio.load(page_FLEX.data)
    $('.js-tr-game-select').each((index, element) => {
        let name = $(element).find("td").first().text().trim().split(' ')
        let team = name.pop()
        name = name.join(' ')
        let position = $(element).find("td").eq(1).text().slice(0, 2).trim()
        let searchName = name.replace('Jr.', '').replace('III', '').replace('II', '').replace('IV', '').replace(/[^0-9a-z]/gi, '').toLowerCase()
        let fpts = $(element).find("td").last().text()
        projections.push({
            name: name,
            position: position,
            team: team,
            searchName: searchName,
            value: parseFloat(fpts),
            updated_value: parseFloat(fpts),
            isPlayerHidden: false
        })
    })

    return projections.sort((a, b) => b.value - a.value)
}

router.get('/projections_weekly', async (req, res, next) => {
    const state = await axios.get(`https://api.sleeper.app/v1/state/nfl`, { timeout: 3000 })
    const week = Math.max(state.data.display_week, 1)
    const projections = await getProjections_Weekly(week)
    res.send(projections)
    next
})

module.exports = router