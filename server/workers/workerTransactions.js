const express = require('express');
const router = express.Router();
const axios = require('axios')

const getDraftPicks = (league, roster_id, season, traded_picks) => {
    let original_picks = []
    let y = league.status === 'in_season' ? 1 : 0
    Array.from(Array(3).keys()).map(x => x + y).map(year => {
        return Array.from(Array(league.settings.draft_rounds).keys()).map(x => x + 1).map(round => {
            return original_picks.push({
                season: (parseInt(season) + parseInt(year)).toString(),
                round: round,
                roster_id: roster_id,
                previous_owner_id: roster_id,
                owner_id: roster_id
            })
        })
    })
    traded_picks.filter(x => x.owner_id === roster_id).map(pick => {
        return original_picks.push(pick)
    })
    traded_picks.filter(x => x.previous_owner_id === roster_id).map(pick => {
        const index = original_picks.findIndex(obj => {
            return obj.owner_id === pick.previous_owner_id && obj.roster_id === pick.roster_id && obj.season === pick.season && obj.round === pick.round
        })
        return original_picks.splice(index, 1)
    })

    return league.status === 'in_season' ? original_picks.filter(x => x.season >= season + y) : original_picks
}

const getTransactions = async (username, season) => {
    const user = await axios.get(`https://api.sleeper.app/v1/user/${username}`).catch((err) => console.log(err))
    let transactions = []
    const leagues = await axios.get(`https://api.sleeper.app/v1/user/${user.data.user_id}/leagues/nfl/${season}`).catch((err) => console.log(err))

    await Promise.all(leagues.data.map(async league => {
        const [users, rosters, traded_picks] = await Promise.all([
            await axios.get(`https://api.sleeper.app/v1/league/${league.league_id}/users`).catch((err) => console.log(err)),
            await axios.get(`https://api.sleeper.app/v1/league/${league.league_id}/rosters`).catch((err) => console.log(err)),
            await axios.get(`https://api.sleeper.app/v1/league/${league.league_id}/traded_picks`).catch((err) => console.log(err))
        ])
        rosters.data = rosters.data.map(roster => {
            const roster_user = users.data.find(x => x.user_id === roster.owner_id)
            return {
                ...roster,
                username: roster_user === undefined ? 'Orphan' : roster_user.display_name,
                draft_picks: league.settings.type === 2 ? getDraftPicks(league, roster.roster_id, season, traded_picks.data) : []
            }
        })

        await Promise.all(Array.from(Array(17).keys()).map(async week => {
            const t = await axios.get(`https://api.sleeper.app/v1/league/${league.league_id}/transactions/${week + 1}`).catch((err) => { return { data: [] } })
            t.data.map(transaction => {
                const traders = transaction.roster_ids.map(rid => {
                    const r = rosters.data.find(x => x.roster_id === rid)
                    const u = users.data.find(x => x.user_id === r?.owner_id)
                    return {
                        roster_id: rid,
                        owner_id: u === undefined ? null : u.owner_id,
                        avatar: u === undefined ? null : u.avatar,
                        username: u === undefined ? 'Orphan' : u.display_name,
                        roster: r
                    }
                })
                const picks = transaction.draft_picks.map(pick => {
                    const r = rosters.data.find(x => x.roster_id === pick.roster_id)
                    const u = users.data.find(x => x.user_id === r.owner_id)
                    return {
                        ...pick,
                        original_username: u === undefined ? 'Orphan' : u.display_name
                    }
                })
                return transactions.push({
                    ...transaction,
                    league_name: league.name,
                    league_avatar: league.avatar,
                    league_id: league.league_id,
                    users: traders,
                    draft_picks: picks,
                    scoring_settings: league.scoring_settings,
                    isTransactionHidden: false,
                    isLeagueHidden: true
                })

            })
        }))
    }))


    return transactions
}



router.get('/transactions', async (req, res, next) => {
    const username = req.query.username
    const state = await axios.get(`https://api.sleeper.app/v1/state/nfl`, { timeout: 3000 })
    const season = state.data.league_season
    const result = await getTransactions(username, season)
    res.send(result)
    next
})

module.exports = router