const workerpool = require('workerpool')
const axios = require('axios')
const cheerio = require('cheerio')

const getMaddenRatings = async () => {
    let elements = []
    const page = await axios.get('https://www.ea.com/games/madden-nfl/player-ratings')
    let $ = cheerio.load(page.data)
    
    elements = $('.eapl-local-nav__sub-nav-toggle-text').length
    return elements
}


workerpool.worker({
    getMaddenRatings: getMaddenRatings
})