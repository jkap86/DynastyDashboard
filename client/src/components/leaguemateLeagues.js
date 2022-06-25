import React, { useState, useEffect } from "react";
import emoji from '../emoji.png';
import Roster from "./roster";
import allPlayers from '../allPlayers.json';

const LeaguemateLeagues = (props) => {
    const [group_age, setGroup_age] = useState('Total')
    const [group_value, setGroup_value] = useState('Total')
    const [leagues, setLeagues] = useState([])

    useEffect(() => {
        setLeagues(props.leaguemate.leagues.sort((a, b) => a.index - b.index))
    }, [props.leaguemate])

    const showLeagues = (league_id) => {
        let l = leagues
        l.filter(x => x.league_id === league_id).map(league => {
            return league.isRostersHidden = !league.isRostersHidden
        })
        setLeagues([...l])
    }

    const getAge = (roster) => {
        let r;
        let length;
        if (roster.players !== null) {
            switch (group_age) {
                case 'Total':
                    r = roster.players.filter(x => allPlayers[x].age !== undefined).reduce((acc, cur) => acc + allPlayers[cur].age * parseInt(props.matchPlayer_DV(cur)), 0)
                    length = roster.players.filter(x => allPlayers[x].age !== undefined).reduce((acc, cur) => acc + parseInt(props.matchPlayer_DV(cur)), 0)
                    break;
                case 'Starters':
                    r = roster.starters.filter(x => x !== '0' && allPlayers[x].age !== undefined).reduce((acc, cur) => acc + allPlayers[cur].age * parseInt(props.matchPlayer_DV(cur)), 0)
                    length = roster.starters.filter(x => x !== '0' && allPlayers[x].age !== undefined).reduce((acc, cur) => acc + parseInt(props.matchPlayer_DV(cur)), 0)
                    break;
                case 'Bench':
                    r = roster.players.filter(x => !roster.starters.includes(x) && allPlayers[x].age !== undefined).reduce((acc, cur) => acc + allPlayers[cur].age * parseInt(props.matchPlayer_DV(cur)), 0)
                    length = roster.players.filter(x => !roster.starters.includes(x) && allPlayers[x].age !== undefined).reduce((acc, cur) => acc + parseInt(props.matchPlayer_DV(cur)), 0)
                    break;
                case 'QB':
                    r = roster.players.filter(x => allPlayers[x].position === 'QB').reduce((acc, cur) => acc + allPlayers[cur].age * parseInt(props.matchPlayer_DV(cur)), 0)
                    length = roster.players.filter(x => allPlayers[x].position === 'QB').reduce((acc, cur) => acc + parseInt(props.matchPlayer_DV(cur)), 0)
                    break;
                case 'RB':
                    r = roster.players.filter(x => allPlayers[x].position === 'RB').reduce((acc, cur) => acc + allPlayers[cur].age * parseInt(props.matchPlayer_DV(cur)), 0)
                    length = roster.players.filter(x => allPlayers[x].position === 'RB').reduce((acc, cur) => acc + parseInt(props.matchPlayer_DV(cur)), 0)
                    break;
                case 'WR':
                    r = roster.players.filter(x => allPlayers[x].position === 'WR').reduce((acc, cur) => acc + allPlayers[cur].age * parseInt(props.matchPlayer_DV(cur)), 0)
                    length = roster.players.filter(x => allPlayers[x].position === 'WR').reduce((acc, cur) => acc + parseInt(props.matchPlayer_DV(cur)), 0)
                    break;
                case 'TE':
                    r = roster.players.filter(x => allPlayers[x].position === 'TE').reduce((acc, cur) => acc + allPlayers[cur].age * parseInt(props.matchPlayer_DV(cur)), 0)
                    length = roster.players.filter(x => allPlayers[x].position === 'TE').reduce((acc, cur) => acc + parseInt(props.matchPlayer_DV(cur)), 0)
                    break;
                default:
                    r = 0
                    length = 0
                    break;
            }
        } else {
            r = 0
            length = 0
        }
        return length === 0 ? '-' : (r / length).toFixed(1)
    }

    const getValue = (roster) => {
        let r;
        switch (group_value) {
            case 'Total':
                r = roster.players === null ? null : (roster.players.reduce((acc, cur) => acc + parseInt(props.matchPlayer_DV(cur)), 0) +
                    roster.draft_picks.reduce((acc, cur) => acc + parseInt(props.matchPick(cur.season, cur.round)), 0)).toLocaleString("en-US")
                break;
            case "Roster":
                r = roster.players.reduce((acc, cur) => acc + parseInt(props.matchPlayer_DV(cur)), 0)
                break;
            case "Picks":
                r = roster.draft_picks.reduce((acc, cur) => acc + parseInt(props.matchPick(cur.season, cur.round)), 0)
                break;
            case "Starters":
                r = roster.starters.filter(x => x !== '0').reduce((acc, cur) => acc + parseInt(props.matchPlayer_DV(cur)), 0)
                break;
            case "Bench":
                r = roster.players.filter(x => !roster.starters.includes(x)).reduce((acc, cur) => acc + parseInt(props.matchPlayer_DV(cur)), 0)
                break;
            case "QB":
                r = roster.players.filter(x => allPlayers[x].position === 'QB').reduce((acc, cur) => acc + parseInt(props.matchPlayer_DV(cur)), 0)
                break;
            case "RB":
                r = roster.players.filter(x => allPlayers[x].position === 'RB').reduce((acc, cur) => acc + parseInt(props.matchPlayer_DV(cur)), 0)
                break;
            case "WR":
                r = roster.players.filter(x => allPlayers[x].position === 'WR').reduce((acc, cur) => acc + parseInt(props.matchPlayer_DV(cur)), 0)
                break;
            case "TE":
                r = roster.players.filter(x => allPlayers[x].position === 'TE').reduce((acc, cur) => acc + parseInt(props.matchPlayer_DV(cur)), 0)
                break;
            default:
                r = 0
        }
        return r
    }

    return <>
        <table className="secondary">
            <tbody className="sticky header2">
                <tr>
                    <th colSpan={7}>{props.leaguemate.username}</th>
                    <th colSpan={4}></th>
                    <th colSpan={7}>{props.user.username}</th>
                </tr>
                <tr>
                    <th colSpan={2}>W-L</th>
                    <th colSpan={2}>FP</th>
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
                        Value
                    </th>
                    <th>
                        <select value={group_age} onChange={(e) => setGroup_age(e.target.value)}>
                            <option>Total</option>
                            <option>Starters</option>
                            <option>Bench</option>
                            <option>QB</option>
                            <option>RB</option>
                            <option>WR</option>
                            <option>TE</option>
                        </select>
                        <div className="tooltip">
                            <p>VWA</p>
                            <span className="tooltiptext">
                                Value Weighted Age
                            </span>
                        </div>
                    </th>
                    <th colSpan={4}>League</th>
                    <th colSpan={2}>W-L</th>
                    <th colSpan={2}>FP</th>
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
                        <p>Value</p>
                    </th>
                    <th>
                        <select value={group_age} onChange={(e) => setGroup_age(e.target.value)}>
                            <option>All</option>
                            <option>Starters</option>
                            <option>Bench</option>
                            <option>QB</option>
                            <option>RB</option>
                            <option>WR</option>
                            <option>TE</option>
                        </select>
                        <div className="tooltip">
                            <p>VWA</p>
                            <span className="tooltiptext">
                                Value Weighted Age
                            </span>
                        </div>
                    </th>
                </tr>
            </tbody>
            <tbody>
                {leagues.map((league, index) =>
                    <React.Fragment key={index}>
                        <tr onClick={() => showLeagues(league.league_id)} className={league.isRostersHidden ? 'hover2 clickable' : 'hover2 clickable active'}>
                            <td colSpan={2}>
                                <p className="record">
                                    {league.rosters.find(x => x.username === props.leaguemate.username).wins}-
                                    {league.rosters.find(x => x.username === props.leaguemate.username).losses}
                                    {league.rosters.find(x => x.username === props.leaguemate.username).ties === 0 ? null :
                                        `-${league.rosters.find(x => x.username === props.leaguemate.username).ties} `
                                    }
                                </p>
                                {league.rosters.find(x => x.username === props.leaguemate.username).wins + league.rosters.find(x => x.username === props.leaguemate.username).losses === 0 ? null :
                                    <em> {(league.rosters.find(x => x.username === props.leaguemate.username).wins / (league.rosters.find(x => x.username === props.leaguemate.username).wins + league.rosters.find(x => x.username === props.leaguemate.username).losses)).toFixed(4)}</em>
                                }
                            </td>
                            <td colSpan={2}>
                                {league.rosters.find(x => x.username === props.leaguemate.username).fpts}-
                                {league.rosters.find(x => x.username === props.leaguemate.username).fpts_against}
                            </td>
                            <td colSpan={2}>
                                {league.rosters.find(x => x.username === props.leaguemate.username).players === null ? null : getValue(league.rosters.find(x => x.username === props.leaguemate.username)).toLocaleString("en-US")}
                            </td>
                            <td>
                                {getAge(league.rosters.find(x => x.username === props.leaguemate.username))}
                            </td>
                            <td colSpan={4}>
                                <div className="image_container">
                                    <img
                                        style={{ animation: `rotation ${Math.random() * 10 + 2}s infinite linear` }}
                                        className="thumbnail faded"
                                        alt="avatar"
                                        src={league.avatar === null ? emoji : `https://sleepercdn.com/avatars/${league.avatar}`}
                                    />
                                    <p className="image">{league.name}</p>
                                </div>
                            </td>
                            <td colSpan={2}>
                                <p className="record">
                                    {league.record.wins}-{league.record.losses}{league.record.ties === 0 ? null : `-${league.record.ties}`}
                                </p>
                                {league.record.wins + league.record.losses === 0 ? null :
                                    <em> {(league.record.wins / (league.record.wins + league.record.losses)).toFixed(4)}</em>
                                }
                            </td>
                            <td colSpan={2}>
                                {league.fpts}-
                                {league.fpts_against}
                            </td>
                            <td colSpan={2}>
                                {league.userRoster.players === null ? null : getValue(league.userRoster).toLocaleString("en-US")}
                            </td>
                            <td>
                                {getAge(league.userRoster)}
                            </td>
                        </tr>
                        {league.isRostersHidden === true ? null :
                            <tr className="tertiary">
                                <td colSpan={9} className="top">
                                    <Roster
                                        roster={league.rosters.find(x => x.username === props.leaguemate.username)}
                                        matchPlayer_DV={props.matchPlayer_DV}
                                        matchPlayer_Proj={props.matchPlayer_Proj}
                                        matchPick={props.matchPick}
                                    />
                                </td>
                                <td colSpan={9} className="top">
                                    <Roster
                                        roster={league.userRoster}
                                        matchPlayer_DV={props.matchPlayer_DV}
                                        matchPlayer_Proj={props.matchPlayer_Proj}
                                        matchPick={props.matchPick}
                                    />
                                </td>
                            </tr>
                        }
                    </React.Fragment>
                )}
            </tbody>
        </table>
    </>
}
export default LeaguemateLeagues;