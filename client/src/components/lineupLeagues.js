import React, { useState, useEffect } from "react";
import emoji from '../emoji.png';
import Breakdown from "./breakdown";

const LineupLeagues = (props) => {
    const [leagues, setLeagues] = useState([])

    useEffect(() => {
        setLeagues(props.leagues.sort((a, b) => a.index - b.index))
    }, [props.leagues])

    const showBreakdown = (league_id) => {
        let l = leagues
        l.filter(x => x.league_id === league_id).map(league => {
            return league.isRostersHidden = !league.isRostersHidden
        })
        setLeagues([...l])
    }

    return <>
        <table className="secondary">
            <tbody className="sticky header2">
                <tr>
                    <th colSpan={3}>League</th>
                    <th colSpan={2}>PF</th>
                    <th colSpan={2}>PA</th>
                    <th colSpan={3}>Opponent</th>
                </tr>
            </tbody>
            <tbody>
                {leagues.map((league, index) =>
                    <React.Fragment key={index}>
                        <tr
                            className={league.isRostersHidden ? 'hover2 clickable' : 'hover2 clickable active'}
                            onClick={() => showBreakdown(league.league_id)}>
                            <td>
                                <img
                                    style={{ animation: `rotation ${Math.random() * 10 + 2}s infinite linear` }}
                                    className="thumbnail"
                                    alt="avatar"
                                    src={league.avatar === null ? emoji : `https://sleepercdn.com/avatars/${league.avatar}`}
                                />
                            </td>
                            <td colSpan={2} className="left">{league.name}</td>
                            <td colSpan={2}>
                                {
                                    league.matchup === undefined ? '-' :
                                        `${league.matchup.points} (${league.matchup.starters.reduce((acc, cur) => acc + parseFloat(props.matchPlayer_Proj_W(cur)), 0).toFixed(1)})`
                                }
                            </td>
                            <td colSpan={2}>
                                {
                                    league.matchup_opponent === undefined ? '-' :
                                        league.matchup_opponent.points
                                }
                                <br />
                                <em>{
                                    league.matchup_opponent === undefined ? null :
                                        `(${league.matchup_opponent.starters.reduce((acc, cur) => acc + props.matchPlayer_Proj_W(cur), 0).toFixed(1)})`
                                }
                                </em>
                            </td>
                            <td>
                                <img
                                    style={{ animation: `rotation ${Math.random() * 10 + 2}s infinite linear` }}
                                    className="thumbnail"
                                    alt="avatar"
                                    src={league.opponent.avatar === null || league.opponent.avatar === undefined ? emoji : `https://sleepercdn.com/avatars/${league.opponent.avatar}`}
                                />
                            </td>
                            <td colSpan={2} className="left">{league.opponent.username}</td>
                        </tr>
                        {league.isRostersHidden ? null :
                            <tr className="tertiary">
                                <td colSpan={5} className="top">
                                    {league.matchup === undefined ? null :
                                        <Breakdown
                                            starters={league.matchup.starters}
                                            bench={league.matchup.players.filter(x => !league.matchup.starters.includes(x))}
                                            players_points={league.matchup.players_points}
                                            username={props.user.display_name}
                                            matchPlayer_Proj_W={props.matchPlayer_Proj_W}
                                        />
                                    }
                                </td>
                                <td colSpan={5} className="top">
                                    {league.matchup === undefined ? null :
                                        <Breakdown
                                            starters={league.matchup_opponent.starters}
                                            bench={league.matchup_opponent.players.filter(x => !league.matchup.starters.includes(x))}
                                            players_points={league.matchup_opponent.players_points}
                                            username={league.opponent.username}
                                            matchPlayer_Proj_W={props.matchPlayer_Proj_W}
                                        />
                                    }
                                </td>
                            </tr>
                        }
                    </React.Fragment>
                )}
            </tbody>
        </table>
    </>
}
export default LineupLeagues;