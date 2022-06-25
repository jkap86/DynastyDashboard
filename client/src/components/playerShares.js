import React, { useState, useEffect } from "react";
import allPlayers from '../allPlayers.json';
import Search from "./search";
import player_default from '../player_default.png';
import PlayerLeagues from "./playerLeagues";
import Lineups from "./lineups";

const PlayerShares = (props) => {
    const [tab, setTab] = useState('All')
    const [players, setPlayers] = useState([])
    const [filters, setFilters] = useState({ positions: [], types: [] })
    const [sortBy, setSortBy] = useState('index')
    const [sortToggle, setSortToggle] = useState(false)
    const [page, SetPage] = useState(1)

    const findOccurrences = (players) => {
        const ps = []
        players.forEach(p => {
            const index = ps.findIndex(obj => {
                return obj.id === p.id
            })
            if (index === -1) {
                ps.push({
                    id: p.id,
                    position: p.id === '0' || allPlayers[p.id] === undefined ? null : ['QB', 'RB', 'WR', 'TE'].includes(allPlayers[p.id].position) ? allPlayers[p.id].position : 'Other',
                    type: p.id === '0' || allPlayers[p.id] === undefined ? null : allPlayers[p.id].years_exp === 0 ? 'R' : 'V',
                    count: 1,
                    leagues: [p.league],
                    wins: p.wins,
                    losses: p.losses,
                    ties: p.ties,
                    fpts: p.fpts,
                    fpts_against: p.fpts_against,
                    isLeaguesHidden: true,
                    isPlayerHidden: false
                })
            } else {
                ps[index].count++
                if (!ps[index].leagues.includes(p.league)) {
                    ps[index].leagues.push(p.league)
                }
                ps[index].wins = ps[index].wins + p.wins
                ps[index].losses = ps[index].losses + p.losses
                ps[index].ties = ps[index].ties + p.ties
                ps[index].fpts = ps[index].fpts + p.fpts
                ps[index].fpts_against = ps[index].fpts_against + p.fpts_against
            }
        })
        return ps
    }

    const getPlayerShares = (players_owned, players_taken) => {
        const po = findOccurrences(players_owned)
        const pt = findOccurrences(players_taken)
        let ap = Object.keys(allPlayers).filter(x => allPlayers[x].status === 'Active').map(player => {
            const match_owned = po.find(x => x.id === player)
            const leagues_owned = match_owned === undefined ? [] : match_owned.leagues
            const match_taken = pt.find(x => x.id === player)
            const leagues_taken = match_taken === undefined ? [] : match_taken.leagues
            const leagues_available = props.leagues.filter(x => leagues_owned.find(y => y.league_id === x.league_id) === undefined &&
                leagues_taken.find(y => y.league_id === x.league_id) === undefined)
            return {
                id: player,
                position: ['QB', 'RB', 'WR', 'TE'].includes(allPlayers[player].position) ? allPlayers[player].position : 'Other',
                type: allPlayers[player].years_exp === 0 ? 'R' : 'V',
                leagues_owned: leagues_owned,
                leagues_taken: leagues_taken,
                leagues_available: leagues_available,
                count: match_owned === undefined ? 0 : match_owned.count,
                wins: match_owned === undefined ? 0 : match_owned.wins,
                losses: match_owned === undefined ? 0 : match_owned.losses,
                ties: match_owned === undefined ? 0 : match_owned.ties,
                fpts: match_owned === undefined ? 0 : match_owned.fpts,
                fpts_against: match_owned === undefined ? 0 : match_owned.fpts_against,
                isPlayerHidden: false,
                isLeaguesHidden: true,
            }
        })
        return ap
    }

    useEffect(() => {
        let playersOwned = props.leagues.map(league => {
            return league.rosters.filter(x => x.players !== null && x.owner_id === props.user.user_id).map(roster => {
                return roster.players.map(player => {
                    return {
                        id: player,
                        league: league,
                        wins: league.record.wins,
                        losses: league.record.losses,
                        ties: league.record.ties,
                        fpts: league.fpts,
                        fpts_against: league.fpts_against
                    }
                })
            })
        }).flat(2)
        let playersTaken = props.leagues.map(league => {
            return league.rosters.filter(x => x.players !== null && x.owner_id !== props.user.user_id).map(roster => {
                return roster.players.map(player => {
                    return {
                        id: player,
                        league: league,
                        wins: league.record.wins,
                        losses: league.record.losses,
                        ties: league.record.ties,
                        fpts: league.fpts,
                        fpts_against: league.fpts_against
                    }
                })
            })
        }).flat(2)
        const p = getPlayerShares(playersOwned, playersTaken)
        setPlayers(p.filter(x => x.leagues_owned.length + x.leagues_taken.length > 0).sort((a, b) => b.count - a.count))

    }, [props.leagues])

    const filterPosition = (e) => {
        let f = filters.positions
        if (e.target.checked) {
            const index = f.indexOf(e.target.name)
            f.splice(index, 1)
        } else {
            f.push(e.target.name)
        }
        setFilters({ ...filters, positions: f })
    }

    const filterYearsExp = (e) => {
        let f = filters.types
        if (e.target.checked) {
            const index = f.indexOf(e.target.name)
            f.splice(index, 1)
        } else {
            f.push(e.target.name)
        }
        setFilters({ ...filters, positions: f })
    }

    const getSearched = (data) => {
        const p = players
        if (data) {
            p.map(player => {
                return player.isPlayerHidden = true
            })
            p.filter(player => data === `${allPlayers[player.id].full_name} ${allPlayers[player.id].position} ${allPlayers[player.id].team === null ? 'FA' : allPlayers[player.id].team}`)
                .map(player => {
                    return player.isPlayerHidden = false
                })
        } else {
            p.map(player => {
                return player.isPlayerHidden = false
            })
        }
        setPlayers([...p])
    }

    const sort = (sort_by) => {
        const t = sortToggle
        const s = sortBy
        if (sort_by === s) {
            setSortToggle(!t)
        } else {
            setSortBy(sort_by)
        }

        let p = players
        switch (sort_by) {
            case 'Count':
                p = t ? p.sort((a, b) => parseInt(a.count) - parseInt(b.count)) : p.sort((a, b) => parseInt(b.count) - parseInt(a.count))
                break;
            case 'Age':
                p = t ? p.sort((a, b) => allPlayers[b.id].age - allPlayers[a.id].age) : p.sort((a, b) => allPlayers[a.id].age - allPlayers[b.id].age)
                break;
            case 'Yrs_Exp':
                p = t ? p.sort((a, b) => allPlayers[b.id].years_exp - allPlayers[a.id].years_exp) : p.sort((a, b) => allPlayers[a.id].years_exp - allPlayers[b.id].years_exp)
                break;
            case 'Record':
                p = t ? p.sort((a, b) => (a.wins / (a.wins + a.losses) - (b.wins / (b.wins + b.losses)))) : p.sort((a, b) => (b.wins / (b.wins + b.losses) - (a.wins / (a.wins + a.losses))))
                break;
            case 'Value':
                p = t ? p.sort((a, b) => parseInt(props.matchPlayer_DV(a.id)) - parseInt(props.matchPlayer_DV(b.id)))
                    : p.sort((a, b) => parseInt(props.matchPlayer_DV(b.id)) - parseInt(props.matchPlayer_DV(a.id)))
                break;
            case 'Projection':
                p = t ? p.sort((a, b) => parseFloat(props.matchPlayer_Proj(a.id)) - parseFloat(props.matchPlayer_Proj(b.id)))
                    : p.sort((a, b) => parseFloat(props.matchPlayer_Proj(b.id)) - parseFloat(props.matchPlayer_Proj(a.id)))
                break;
            default:
                p = p.sort((a, b) => b.count - a.count)
                break;
        }
        SetPage(1)
        setPlayers([...p])
    }

    const showLeagues = (player_id) => {
        let p = players
        p.filter(x => x.id === player_id).map(player => {
            return player.isLeaguesHidden = !player.isLeaguesHidden
        })
        setPlayers([...p])
    }

    return <>
        <div className="player_nav">
            <button className={tab === 'All' ? 'active clickable' : 'clickable'} onClick={() => setTab('All')}>All</button>
            <button className={tab === 'Starters' ? 'active clickable' : 'clickable'} onClick={() => setTab('Starters')}>Starters</button>
            <button className={tab === 'Bench' ? 'active clickable' : 'clickable'} onClick={() => setTab('Bench')}>Bench</button>
            <button className={tab === 'Opponent' ? 'active clickable' : 'clickable'} onClick={() => setTab('Opponent')}>Opponent</button>
        </div>
        {tab === 'All' ?
            <React.Fragment>
                <div className="search_wrapper">
                    <div className="checkboxes">
                        <label className="script">
                            QB
                            <input className="clickable" name="QB" onClick={filterPosition} defaultChecked type="checkbox" />
                        </label>
                        <label className="script">
                            RB
                            <input className="clickable" name="RB" onChange={filterPosition} defaultChecked type="checkbox" />
                        </label>
                        <label className="script">
                            WR
                            <input className="clickable" name="WR" onChange={filterPosition} defaultChecked type="checkbox" />
                        </label>
                        <label className="script">
                            TE
                            <input className="clickable" name="TE" onChange={filterPosition} defaultChecked type="checkbox" />
                        </label>
                        <label className="script">
                            Other
                            <input className="clickable" name="Other" onChange={filterPosition} defaultChecked type="checkbox" />
                        </label>
                        <br />
                        <label className='script'>
                            Vets
                            <input className="clickable" name='V' onChange={(e) => filterYearsExp(e)} defaultChecked type="checkbox" />
                        </label>
                        <label className='script'>
                            Rookies
                            <input className="clickable" name='R' onChange={(e) => filterYearsExp(e)} defaultChecked type="checkbox" />
                        </label>
                    </div>
                    <Search
                        list={players.map(player =>
                            `${allPlayers[player.id].full_name} ${allPlayers[player.id].position} 
                        ${allPlayers[player.id].team === null ? 'FA' : allPlayers[player.id].team}`)}
                        placeholder="Search Player Shares"
                        sendSearched={getSearched}
                        value={''}
                    />
                    <ol className="page_numbers">
                        {Array.from(Array(Math.ceil(players.filter(x => x.isPlayerHidden === false && !filters.types.includes(x.type) && !filters.positions.includes(x.position)).length / 50)).keys()).map(key => key + 1).map(page_number =>
                            <li className={page === page_number ? 'active clickable' : 'clickable'} key={page_number} onClick={() => SetPage(page_number)}>
                                {page_number}
                            </li>
                        )}
                    </ol>
                </div>
                <div className="view_scrollable">
                    <table className="main">
                        <tbody className="fade_in sticky">
                            <tr>
                                <th colSpan={1} className="clickable" onClick={() => sort('Count')}>Count</th>
                                <th colSpan={3}>Player</th>
                                <th colSpan={1} className="clickable" onClick={() => sort('Age')}>Age</th>
                                <th colSpan={3} className="clickable" onClick={() => sort('Record')}>Record</th>
                                <th colSpan={2}>FP</th>
                                <th colSpan={2} className="clickable" onClick={() => sort('Value')}>Value</th>
                                <th colSpan={2} className="clickable" onClick={() => sort('Projection')}>Proj</th>
                            </tr>
                        </tbody>
                        <tbody className="slide_up">
                            {players.filter(x => x.isPlayerHidden === false && !filters.positions.includes(x.position) && !filters.types.includes(x.type))
                                .slice((page - 1) * 50, ((page - 1) * 50) + 50).map((player, index) =>
                                    <React.Fragment key={index}>
                                        <tr onClick={() => showLeagues(player.id)} className={player.isLeaguesHidden ? "hover clickable" : "hover clickable active"}>
                                            <td>{player.count}</td>
                                            <td>
                                                <img
                                                    style={{ animation: `rotation ${Math.random() * 10 + 2}s infinite linear` }}
                                                    className="thumbnail"
                                                    alt="headshot"
                                                    src={`https://sleepercdn.com/content/nfl/players/thumb/${player.id}.jpg`}
                                                    onError={(e) => { return e.target.src = player_default }}
                                                />
                                            </td>
                                            <td colSpan={2} className="left">{allPlayers[player.id].full_name}</td>
                                            <td>{allPlayers[player.id].age}</td>
                                            <td colSpan={3}>
                                                <p className="record">
                                                    {player.wins}-{player.losses}{player.ties === 0 ? null : `-${player.ties}`}
                                                </p>
                                                &nbsp;{
                                                    player.wins + player.losses + player.ties === 0 ? null :
                                                        <em>{(player.wins / (player.wins + player.losses + player.ties)).toFixed(4)}</em>
                                                }
                                            </td>
                                            <td colSpan={2}>{player.fpts}-{player.fpts_against}</td>
                                            <td colSpan={2}>
                                                <em style={{ filter: `invert(${(props.matchPlayer_DV(player.id) / 200) + 50}%) brightness(2)` }}>
                                                    {props.matchPlayer_DV(player.id)}
                                                </em>
                                            </td>
                                            <td colSpan={2}>{props.matchPlayer_Proj(player.id)}</td>
                                        </tr>
                                        {player.isLeaguesHidden ? null :
                                            <tr>
                                                <td colSpan={14}>
                                                    <PlayerLeagues
                                                        leagues_owned={player.leagues_owned}
                                                        leagues_taken={player.leagues_taken}
                                                        leagues_available={player.leagues_available}
                                                        matchPlayer_DV={props.matchPlayer_DV}
                                                        matchPlayer_Proj={props.matchPlayer_Proj}
                                                        matchPick={props.matchPick}
                                                        player={player.id}
                                                    />
                                                </td>
                                            </tr>
                                        }
                                    </React.Fragment>
                                )}
                        </tbody>
                    </table>
                </div>
            </React.Fragment>
            :
            <Lineups
                findOccurrences={findOccurrences}
                leagues={props.leagues}
                matchPlayer_DV={props.matchPlayer_DV}
                matchPlayer_Proj={props.matchPlayer_Proj}
                tab={tab}
                user={props.user}
            />
        }
    </>
}
export default PlayerShares;