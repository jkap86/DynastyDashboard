import React, { useState, useEffect } from "react";
import emoji from '../emoji.png';
import League from "./league";
import Search from "./search";

const Leagues = (props) => {
    const [leagues, setLeagues] = useState([])
    const [sortBy, setSortBy] = useState('index')
    const [sortToggle, setSortToggle] = useState(false)


    useEffect(() => {
        setLeagues([...props.leagues.sort((a, b) => a.index - b.index)])

    }, [props])

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
                l = t ? l.sort((a, b) => props.getValue(a.userRoster) - props.getValue(b.userRoster)) : l.sort((a, b) => props.getValue(b.userRoster) - props.getValue(a.userRoster))
                break;
            case 'Age':
                l = t ? l.sort((a, b) => props.getAge(a.userRoster) > props.getAge(b.userRoster) ? 1 : -1) : l.sort((a, b) => props.getAge(b.userRoster) > props.getAge(a.userRoster) ? 1 : -1)
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
    const win_pct = total_wins + total_losses > 0 ? total_wins / (total_wins + total_losses) : 0

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
                            <select value={props.group_rank} onChange={(e) => props.sendGroupRank(e.target.value)}>
                                <option>Optimal</option>
                                <option>Total</option>
                                <option>Starters</option>
                                <option>Bench</option>
                                <option>QB</option>
                                <option>RB</option>
                                <option>WR</option>
                                <option>TE</option>
                                <option>FLEX</option>
                                <option>Week {props.state.week}</option>
                            </select>
                            Rank {props.group_rank === `Week ${props.state.week}` ? null : `ROS`}
                        </th>
                        <th colSpan={2}>
                            <select value={props.group_value} onChange={(e) => props.sendGroupValue(e.target.value)}>
                                <option>Total</option>
                                <option>Roster</option>
                                <option>Picks</option>
                                <option>Starters</option>
                                <option>Bench</option>
                                <option>QB</option>
                                <option>RB</option>
                                <option>WR</option>
                                <option>TE</option>
                                <option>FLEX</option>
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
                                    {props.getRank(league)}
                                </td>
                                <td colSpan={2}>
                                    {props.getRank_Value(league)}
                                </td>
                            </tr>
                            {league.isRostersHidden ? null :
                                <tr>
                                    <td colSpan={12}>
                                        <League
                                            league={league}
                                            group_age={props.group_age}
                                            group_rank={props.group_rank}
                                            group_value={props.group_value}
                                            getAge={props.getAge}
                                            getValue={props.getValue}
                                            getProj={props.getProj}
                                            matchPlayer_DV={props.matchPlayer_DV}
                                            matchPlayer_Proj={props.matchPlayer_Proj}
                                            matchPlayer_Proj_W={props.matchPlayer_Proj_W}
                                            matchPick={props.matchPick}
                                            sendGroupRank={(data) => props.sendGroupRank(data)}
                                            sendGroupValue={(data) => props.sendGroupValue(data)}
                                            sendGroupAge={(data) => props.sendGroupAge(data)}
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