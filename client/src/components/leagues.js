import React, { useState, useEffect } from "react";
import emoji from '../emoji.png';
import allPlayers from '../allPlayers.json';
import League from "./league";
import Search from "./search";

const Leagues = (props) => {
    const [group_age, setGroup_age] = useState('Total')
    const [group_rank, setGroup_rank] = useState('Total')
    const [group_value, setGroup_value] = useState('Total')
    const [leagues, setLeagues] = useState([])
    const [sortBy, setSortBy] = useState('index')
    const [sortToggle, setSortToggle] = useState(false)

    useEffect(() => {
        setLeagues([...props.leagues.map(league => {
            return {
                ...league,
                isLeagueHidden: false
            }
        }).sort((a, b) => a.index - b.index)])
    }, [props.leagues])

    const getAge = (roster) => {
        let a;
        let length;
        if (roster.players !== null) {
            switch (group_age) {
                case 'Total':
                    a = roster.players.filter(x => allPlayers[x].age !== undefined).reduce((acc, cur) => acc + allPlayers[cur].age * parseInt(props.matchPlayer_DV(cur)), 0)
                    length = roster.players.filter(x => allPlayers[x].age !== undefined).reduce((acc, cur) => acc + parseInt(props.matchPlayer_DV(cur)), 0)
                    break;
                case 'Starters':
                    a = roster.starters.filter(x => x !== '0' && allPlayers[x].age !== undefined).reduce((acc, cur) => acc + allPlayers[cur].age * parseInt(props.matchPlayer_DV(cur)), 0)
                    length = roster.starters.filter(x => x !== '0' && allPlayers[x].age !== undefined).reduce((acc, cur) => acc + parseInt(props.matchPlayer_DV(cur)), 0)
                    break;
                case 'Bench':
                    a = roster.players.filter(x => !roster.starters.includes(x) && allPlayers[x].age !== undefined).reduce((acc, cur) => acc + allPlayers[cur].age * parseInt(props.matchPlayer_DV(cur)), 0)
                    length = roster.players.filter(x => !roster.starters.includes(x) && allPlayers[x].age !== undefined).reduce((acc, cur) => acc + parseInt(props.matchPlayer_DV(cur)), 0)
                    break;
                case 'QB':
                    a = roster.players.filter(x => allPlayers[x].age !== undefined && allPlayers[x].position === 'QB').reduce((acc, cur) => acc + allPlayers[cur].age * parseInt(props.matchPlayer_DV(cur)), 0)
                    length = roster.players.filter(x => allPlayers[x].age !== undefined && allPlayers[x].position === 'QB').reduce((acc, cur) => acc + parseInt(props.matchPlayer_DV(cur)), 0)
                    break;
                case 'RB':
                    a = roster.players.filter(x => allPlayers[x].age !== undefined && allPlayers[x].position === 'RB').reduce((acc, cur) => acc + allPlayers[cur].age * parseInt(props.matchPlayer_DV(cur)), 0)
                    length = roster.players.filter(x => allPlayers[x].age !== undefined && allPlayers[x].position === 'RB').reduce((acc, cur) => acc + parseInt(props.matchPlayer_DV(cur)), 0)
                    break;
                case 'WR':
                    a = roster.players.filter(x => allPlayers[x].age !== undefined && allPlayers[x].position === 'WR').reduce((acc, cur) => acc + allPlayers[cur].age * parseInt(props.matchPlayer_DV(cur)), 0)
                    length = roster.players.filter(x => allPlayers[x].age !== undefined && allPlayers[x].position === 'WR').reduce((acc, cur) => acc + parseInt(props.matchPlayer_DV(cur)), 0)
                    break;
                case 'TE':
                    a = roster.players.filter(x => allPlayers[x].age !== undefined && allPlayers[x].position === 'TE').reduce((acc, cur) => acc + allPlayers[cur].age * parseInt(props.matchPlayer_DV(cur)), 0)
                    length = roster.players.filter(x => allPlayers[x].age !== undefined && allPlayers[x].position === 'TE').reduce((acc, cur) => acc + parseInt(props.matchPlayer_DV(cur)), 0)
                    break;
                default:
                    break;
            }
        } else {
            length = 0
        }
        return length === 0 ? '-' : (a / length).toFixed(1)
    }

    const getRank = (league) => {
        let p;
        if (league.userRoster.players !== null) {
            let standings = league.rosters.map(roster => {
                if (roster.players !== null) {
                    let proj;
                    switch (group_rank) {
                        case 'Total':
                            proj = roster.players.reduce((acc, cur) => acc + parseFloat(props.matchPlayer_Proj(cur)), 0)
                            break;
                        case 'Starters':
                            proj = roster.starters.filter(x => x !== '0').reduce((acc, cur) => acc + parseFloat(props.matchPlayer_Proj(cur)), 0)
                            break;
                        case 'Bench':
                            proj = roster.players.filter(x => !roster.starters.includes(x)).reduce((acc, cur) => acc + parseFloat(props.matchPlayer_Proj(cur)), 0)
                            break;
                        case 'QB':
                            proj = roster.players.filter(x => allPlayers[x].position === 'QB').reduce((acc, cur) => acc + parseFloat(props.matchPlayer_Proj(cur)), 0)
                            break;
                        case 'RB':
                            proj = roster.players.filter(x => allPlayers[x].position === 'RB').reduce((acc, cur) => acc + parseFloat(props.matchPlayer_Proj(cur)), 0)
                            break;
                        case 'WR':
                            proj = roster.players.filter(x => allPlayers[x].position === 'WR').reduce((acc, cur) => acc + parseFloat(props.matchPlayer_Proj(cur)), 0)
                            break;
                        case 'TE':
                            proj = roster.players.filter(x => allPlayers[x].position === 'TE').reduce((acc, cur) => acc + parseFloat(props.matchPlayer_Proj(cur)), 0)
                            break;
                        case `Week ${props.state.week}`:
                            proj = roster.starters.filter(x => x !== '0').reduce((acc, cur) => acc + parseFloat(props.matchPlayer_Proj_W(cur)), 0)
                            break;
                    }
                    return {
                        ...roster,
                        proj: proj
                    }
                } else {
                    p = '-'
                }
            }).sort((a, b) => b.proj - a.proj)
            p = standings.findIndex(obj => {
                return obj.roster_id === league.userRoster.roster_id
            }) + 1
        } else {
            p = '-'
        }
        return `${p} / ${league.rosters.length}`
    }

    const getValue = (roster) => {
        let v;
        if (roster.players !== null) {
            switch (group_value) {
                case 'Total':
                    v = roster.players.reduce((acc, cur) => acc + parseInt(props.matchPlayer_DV(cur)), 0) +
                        roster.draft_picks.reduce((acc, cur) => acc + parseInt(props.matchPick(cur.season, cur.round)), 0)
                    break;
                case 'Roster':
                    v = roster.players.reduce((acc, cur) => acc + parseInt(props.matchPlayer_DV(cur)), 0)
                    break;
                case 'Picks':
                    v = roster.draft_picks.reduce((acc, cur) => acc + parseInt(props.matchPick(cur.season, cur.round)), 0)
                    break;
                case 'Starters':
                    v = roster.starters.reduce((acc, cur) => acc + parseInt(props.matchPlayer_DV(cur)), 0)
                    break;
                case 'Bench':
                    v = roster.players.filter(x => !roster.starters.includes(x)).reduce((acc, cur) => acc + parseInt(props.matchPlayer_DV(cur)), 0)
                    break;
                case 'QB':
                    v = roster.players.filter(x => allPlayers[x].position === 'QB').reduce((acc, cur) => acc + parseInt(props.matchPlayer_DV(cur)), 0)
                    break;
                case 'RB':
                    v = roster.players.filter(x => allPlayers[x].position === 'RB').reduce((acc, cur) => acc + parseInt(props.matchPlayer_DV(cur)), 0)
                    break;
                case 'WR':
                    v = roster.players.filter(x => allPlayers[x].position === 'WR').reduce((acc, cur) => acc + parseInt(props.matchPlayer_DV(cur)), 0)
                    break;
                case 'TE':
                    v = roster.players.filter(x => allPlayers[x].position === 'TE').reduce((acc, cur) => acc + parseInt(props.matchPlayer_DV(cur)), 0)
                    break;
                default:
                    v = 0
                    break;
            }
        } else {
            v = 0
        }
        return v
    }

    const showRosters = (league_id) => {
        let l = leagues;
        l.filter(x => x.league_id === league_id).map(league => {
            return league.isRostersHidden = !league.isRostersHidden
        })
        setLeagues([...l])
    }

    const sort = (sort_by) => {
        const t = sortToggle
        const s = sortBy
        if (sort_by === s) {
            setSortToggle(!t)
        } else {
            setSortBy(sort_by)
        }

        let l = leagues
        switch (sort_by) {
            case 'League':
                l = t ? l.sort((a, b) => b.name.toLowerCase() > a.name.toLowerCase() ? 1 : -1) : l.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1)
                break;
            case 'Record':
                l = t ? l.sort((a, b) => a.record.winpct - b.record.winpct) : l.sort((a, b) => b.record.winpct - a.record.winpct)
                break;
            case 'Points For':
                l = t ? l.sort((a, b) => a.fpts - b.fpts) : l.sort((a, b) => b.fpts - a.fpts)
                break;
            case 'Points Against':
                l = t ? l.sort((a, b) => a.fpts_against - b.fpts_against) : l.sort((a, b) => b.fpts_against - a.fpts_against)
                break;
            case 'Value':
                l = t ? l.sort((a, b) => getValue(a.userRoster) - getValue(b.userRoster)) : l.sort((a, b) => getValue(b.userRoster) - getValue(a.userRoster))
                break;
            case 'Age':
                l = t ? l.sort((a, b) => getAge(a.userRoster) > getAge(b.userRoster) ? 1 : -1) : l.sort((a, b) => getAge(b.userRoster) > getAge(a.userRoster) ? 1 : -1)
                break;
            default:
                l = l.sort((a, b) => a.index - b.index)
                break;
        }
        setLeagues([...l])
    }

    const getSearched = (league_name) => {
        let l = leagues
        if (league_name) {
            l.map(league => {
                return league.isLeagueHidden = true
            })
            l.filter(x => x.name.trim() === league_name.trim()).map(league => {
                return league.isLeagueHidden = false
            })
        } else {
            l.map(league => {
                return league.isLeagueHidden = false
            })
        }
        setLeagues([...l])
    }

    const total_wins = leagues.filter(x => x.isLeagueHidden === false).reduce((acc, cur) => acc + cur.record.wins, 0)
    const total_losses = leagues.filter(x => x.isLeagueHidden === false).reduce((acc, cur) => acc + cur.record.losses, 0)
    const total_ties = leagues.filter(x => x.isLeagueHidden === false).reduce((acc, cur) => acc + cur.record.ties, 0)
    const win_pct = total_wins + total_losses > 0 ? total_wins / (total_wins + total_losses + total_ties) : 0

    return <>
        <div className="search_wrapper">
            <h2>{leagues.filter(x => x.isLeagueHidden === false).length} Leagues</h2>
            <h2>
                {total_wins}-{total_losses}{total_ties === 0 ? null : `-${total_ties}`}&nbsp;
                <em>{win_pct.toFixed(4)}</em>
            </h2>
            <Search
                list={leagues.map(league => league.name)}
                placeholder={`Search Leagues`}
                sendSearched={getSearched}
                value={''}
            />
        </div>
        <div className="view_scrollable">
            <table className="main">
                <tbody className="fade_in sticky">
                    <tr>
                        <th colSpan={4}>League</th>
                        <th colSpan={2}>Record</th>
                        <th colSpan={2}>FP</th>
                        <th colSpan={2}>
                            <select value={group_age} onChange={(e) => setGroup_age(e.target.value)}>
                                <option>Total</option>
                                <option>Starters</option>
                                <option>Bench</option>
                                <option>QB</option>
                                <option>RB</option>
                                <option>WR</option>
                                <option>TE</option>
                            </select>
                            <p className="clickable" onClick={() => sort('Age')}>VWA</p>
                        </th>
                        <th colSpan={2}>
                            <select value={group_rank} onChange={(e) => setGroup_rank(e.target.value)}>
                                <option>Total</option>
                                <option>Starters</option>
                                <option>Bench</option>
                                <option>QB</option>
                                <option>RB</option>
                                <option>WR</option>
                                <option>TE</option>
                                <option>Week {props.state.week}</option>
                            </select>
                            Rank {group_rank === `Week ${props.state.week}` ? null : `ROS`}
                        </th>
                        <th colSpan={2}>
                            <select value={group_value} onChange={(e) => setGroup_value(e.target.value)}>
                                <option>Total</option>
                                <option>Roster</option>
                                <option>Picks</option>
                                <option>Starters</option>
                                <option>Bench</option>
                                <option>QB</option>
                                <option>RB</option>
                                <option>WR</option>
                                <option>TE</option>
                            </select>
                            <p className="clickable" onClick={() => sort('Value')}>Value</p>
                        </th>
                    </tr>
                </tbody>
                <tbody className="slide_up">
                    {leagues.filter(x => x.isLeagueHidden === false).map((league, index) =>
                        <React.Fragment key={index}>
                            <tr
                                className={league.isRostersHidden ? 'hover clickable' : 'hover clickable active'}
                                onClick={() => showRosters(league.league_id)}
                            >
                                <td colSpan={1}>
                                    <img
                                        style={{ animation: `rotation ${Math.random() * 10 + 2}s infinite ease-out` }}
                                        className="thumbnail"
                                        alt="avatar"
                                        src={league.avatar === null ? emoji : `https://sleepercdn.com/avatars/${league.avatar}`}
                                    />
                                </td>
                                <td colSpan={3} className='left'>
                                    {league.name}
                                </td>
                                <td colSpan={2}>
                                    <p className="record">
                                        {`${league.record.wins}-${league.record.losses}`}
                                        {league.record.ties === 0 ? null : `-${league.record.ties}`}&nbsp;
                                    </p>
                                    <em>{league.record.winpct.toFixed(4)}</em>
                                </td>
                                <td colSpan={2}>
                                    {league.fpts}-{league.fpts_against}
                                </td>
                                <td colSpan={2}>
                                    {getAge(league.userRoster)}
                                </td>
                                <td colSpan={2}>
                                    {getRank(league)}
                                </td>
                                <td colSpan={2}>
                                    {getValue(league.userRoster).toLocaleString("en-US")}
                                </td>
                            </tr>
                            {league.isRostersHidden ? null :
                                <tr>
                                    <td colSpan={14}>
                                        <League
                                            league={league}
                                            group_age={group_age}
                                            group_rank={group_rank}
                                            group_value={group_value}
                                            getAge={getAge}
                                            getValue={getValue}
                                            matchPlayer_DV={props.matchPlayer_DV}
                                            matchPlayer_Proj={props.matchPlayer_Proj}
                                            matchPlayer_Proj_W={props.matchPlayer_Proj_W}
                                            matchPick={props.matchPick}
                                            sendGroupRank={(data) => setGroup_rank(data)}
                                            sendGroupValue={(data) => setGroup_value(data)}
                                            sendGroupAge={(data) => setGroup_age(data)}
                                            state={props.state}
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
export default Leagues;