import React, { useState, useEffect } from "react";
import Search from "./search";
import allPlayers from '../allPlayers.json';
import LineupLeagues from "./lineupLeagues";
import player_default from '../player_default.png';

const Lineups = (props) => {
    const [players, setPlayers] = useState([])
    const [filters, setFilters] = useState({ positions: [], types: [] })
    const [sortToggle, setSortToggle] = useState(false)
    const [sortBy, setSortBy] = useState('index')
    const [page, SetPage] = useState(1)

    useEffect(() => {
        let starting_players = props.leagues.filter(x => x.userRoster.players !== null).map(league => {
            return league.userRoster.starters.map(starter => {
                return {
                    id: starter,
                    league: league,
                    wins: league.record.wins,
                    losses: league.record.losses,
                    ties: league.record.ties,
                    fpts: league.fpts,
                    fpts_against: league.fpts_against
                }
            })
        }).flat()

        let bench_players = props.leagues.filter(x => x.userRoster.players !== null).map(league => {
            return league.userRoster.players.filter(x => !league.userRoster.starters.includes(x)).map(bench_player => {
                return {
                    id: bench_player,
                    league: league,
                    wins: league.record.wins,
                    losses: league.record.losses,
                    ties: league.record.ties,
                    fpts: league.fpts,
                    fpts_against: league.fpts_against
                }
            })
        }).flat()

        let opponent_players = props.leagues.filter(x => x.matchup_opponent !== undefined).map(league => {
            return league.matchup_opponent.starters.map(starter => {
                return {
                    id: starter,
                    league: league,
                    wins: league.record.wins,
                    losses: league.record.losses,
                    ties: league.record.ties,
                    fpts: league.fpts,
                    fpts_against: league.fpts_against
                }
            })
        }).flat()
        let s = props.findOccurrences(starting_players)
        let bp = props.findOccurrences(bench_players)
        let op = props.findOccurrences(opponent_players)
        if (props.tab === 'Starters') {
            setPlayers(s.sort((a, b) => b.count - a.count))
        } else if (props.tab === 'Bench') {
            setPlayers(bp.sort((a, b) => b.count - a.count))
        } else {
            setPlayers(op.sort((a, b) => b.count - a.count))
        }
    }, [props.leagues, props.tab])

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
        let p = players
        if (data) {
            p.map(player => {
                return player.isPlayerHidden = true
            })
            p.filter(player => player.id !== '0' && data === `${allPlayers[player.id].full_name} ${allPlayers[player.id].position} ${allPlayers[player.id].team === null ? 'FA' : allPlayers[player.id].team}`)
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

    const showLeagues = (player_id) => {
        let p = players
        p.filter(x => x.id === player_id).map(player => {
            return player.isLeaguesHidden = !player.isLeaguesHidden
        })
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

        let p = players;
        switch (sort_by) {
            case 'Count':
                p = t ? p.sort((a, b) => a.count - b.count) : p.sort((a, b) => b.count - a.count)
                break;
            case 'Age':
                p = t ? p.sort((a, b) => (a.id === '0' ? 0 : allPlayers[a.id].age) - (b.id === '0' ? 0 : allPlayers[b.id].age)) :
                    p.sort((a, b) => (b.id === '0' ? 0 : allPlayers[b.id].age) - (a.id === '0' ? 0 : allPlayers[a.id].age))
                break;
            case 'Record':
                p = t ? p.sort((a, b) => (a.wins / (a.wins + a.losses)) - (b.wins / (b.wins + b.losses))) :
                    p.sort((a, b) => (b.wins / (b.wins + b.losses)) - (a.wins / (a.wins + a.losses)))
                break;
            case 'Value':
                p = t ? p.sort((a, b) => props.matchPlayer_DV(a.id) - props.matchPlayer_DV(b.id))
                    : p.sort((a, b) => props.matchPlayer_DV(b.id) - props.matchPlayer_DV(a.id))
                break;
            case 'Projection':
                p = t ? p.sort((a, b) => props.matchPlayer_Proj(a.id) - props.matchPlayer_Proj(b.id))
                    : p.sort((a, b) => props.matchPlayer_Proj(b.id) - props.matchPlayer_Proj(a.id))
                break;
        }
        SetPage(1)
        setPlayers([...p])
    }

    return <>
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
                list={players.filter(x => x.id !== '0').map(player =>
                    `${allPlayers[player.id].full_name} ${allPlayers[player.id].position} 
                        ${allPlayers[player.id].team === null ? 'FA' : allPlayers[player.id].team}`)}
                placeholder={`Search ${props.tab}`}
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
                        <th className="clickable" onClick={() => sort('Count')}>Count</th>
                        <th colSpan={3}>Player</th>
                        <th className="clickable" onClick={() => sort('Age')}>Age</th>
                        <th colSpan={2} className="clickable" onClick={() => sort('Record')}>Record</th>
                        <th colSpan={2} className="clickable">
                            <p onClick={() => sort('PF')}>PF</p> - <p onClick={() => sort('PA')}>PA</p>
                        </th>
                        <th className="clickable" onClick={() => sort('Value')}>Value</th>
                        <th className="clickable" onClick={() => sort('Projection')}>Proj</th>
                    </tr>
                </tbody>
                <tbody className="slide_up">
                    {players.filter(x => x.id === '0').map((player, index) =>
                        <React.Fragment key={index}>
                            <tr onClick={() => showLeagues(player.id)} className={player.isLeaguesHidden ? 'hover clickable' : 'hover clickable active'}>
                                <td>{player.count}</td>
                                <td colSpan={3}><strong>***Empty***</strong></td>
                                <td colSpan={7}></td>
                            </tr>
                            {player.isLeaguesHidden ? null :
                                <tr>
                                    <td colSpan={11}>
                                        <LineupLeagues
                                            leagues={player.leagues}
                                            user={props.user}
                                        />
                                    </td>
                                </tr>
                            }
                        </React.Fragment>
                    )}
                    {players.filter(x => x.isPlayerHidden === false && x.id !== '0' && !filters.positions.includes(x.position) &&
                        !filters.types.includes(x.type)).slice((page - 1) * 50, ((page - 1) * 50) + 50).map((player, index) =>
                            <React.Fragment key={index}>
                                <tr onClick={() => showLeagues(player.id)} className={player.isLeaguesHidden ? 'hover clickable' : 'hover clickable active'}>
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
                                    <td colSpan={2}>
                                        <p className="record">
                                            {player.wins}-{player.losses}{player.ties === 0 ? null : `-${player.ties}`}
                                        </p>
                                        &nbsp;{
                                            player.wins + player.losses + player.ties === 0 ? null :
                                                <em>{(player.wins / (player.wins + player.losses + player.ties)).toFixed(4)}</em>
                                        }
                                    </td>
                                    <td colSpan={2}>{player.fpts} - {player.fpts_against}</td>
                                    <td>
                                        <em style={{ filter: `invert(${(props.matchPlayer_DV(player.id) / 200) + 50}%) brightness(2)` }}>
                                            {props.matchPlayer_DV(player.id)}
                                        </em>
                                    </td>
                                    <td>
                                        {props.matchPlayer_Proj(player.id)}
                                    </td>
                                </tr>
                                {player.isLeaguesHidden ? null :
                                    <tr>
                                        <td colSpan={11}>
                                            <LineupLeagues
                                                leagues={player.leagues}
                                                user={props.user}
                                                matchPlayer_Proj={props.matchPlayer_Proj}
                                            />
                                        </td>
                                    </tr>
                                }
                            </React.Fragment>
                        )}
                </tbody>
            </table>
        </div>
    </>
}
export default Lineups;