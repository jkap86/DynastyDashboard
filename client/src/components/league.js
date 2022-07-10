import React, { useState, useEffect } from "react";
import emoji from '../emoji.png';
import Roster from "./roster";
import allPlayers from '../allPlayers.json';

const League = (props) => {
    const [rosters, setRosters] = useState([])
    const [sortBy, setSortBy] = useState('index')
    const [sortToggle, setSortToggle] = useState(false)

    useEffect(() => {
        setRosters(props.league.rosters.sort((a, b) => parseFloat(b.winpct) - parseFloat(a.winpct)))
    }, [props])

    const sort = (sort_by) => {
        const t = sortToggle
        const s = sortBy
        if (sort_by === s) {
            setSortToggle(!t)
        } else {
            setSortBy(sort_by)
        }

        let r = rosters
        switch (sort_by) {
            case 'Record':
                r = t ? r.sort((a, b) => parseFloat(a.winpct) - parseFloat(b.winpct)) : r.sort((a, b) => parseFloat(b.winpct) - parseFloat(a.winpct))
                break;
            case 'Points For':
                r = t ? r.sort((a, b) => b.settings.fpts - a.settings.fpts || b.settings.fpts_decimal - a.settings.fpts_decimal) :
                    r.sort((a, b) => a.settings.fpts - b.settings.fpts || a.settings.fpts_decimal - b.settings.fpts_decimal)
                break;
            case 'Points Against':
                r = t ? r.sort((a, b) => b.settings.fpts_against - a.settings.fpts_against || b.settings.fpts_against_decimal - a.settings.fpts_against_decimal) :
                    r.sort((a, b) => a.settings.fpts_against - b.settings.fpts_against || a.settings.fpts_against_decimal - b.settings.fpts_against_decimal)
                break;
            case 'Projection':
                r = t ? r.sort((a, b) => props.getProj(a) - props.getProj(b)) : r.sort((a, b) => props.getProj(b) - props.getProj(a))
                break;
            case 'Value':
                r = t ? r.sort((a, b) => props.getValue(a) - props.getValue(b)) : r.sort((a, b) => props.getValue(b) - props.getValue(a))
                break;
            case 'Age':
                r = t ? r.sort((a, b) => props.getAge(b) - props.getAge(a)) : r.sort((a, b) => props.getAge(a) - props.getAge(b))
                break;
            default:
                r = r.sort((a, b) => parseFloat(a.winpct) - parseFloat(b.winpct))
                break;
        }
        setRosters([...r])
    }

    const showRoster = (roster_id) => {
        let r = rosters
        r.filter(x => x.roster_id === roster_id).map(roster => {
            return roster.isRosterHidden = !roster.isRosterHidden
        })
        setRosters([...r])
    }

    return <>
        <table className="secondary">
            <tbody className="fade_in sticky header2">
                <tr>
                    <th colSpan={2}>Team</th>
                    <th>Record</th>
                    <th>FP</th>
                    <th>
                        <select value={props.group_age} onChange={(e) => props.sendGroupAge(e.target.value)}>
                            <option>Total</option>
                            <option>Starters</option>
                            <option>Bench</option>
                            <option>QB</option>
                            <option>RB</option>
                            <option>WR</option>
                            <option>TE</option>
                            <option>FLEX</option>
                        </select>
                        <div className="tooltip">
                            <p className="clickable" onClick={() => sort('Age')}>VWAA</p>
                            <span className="tooltiptext">
                                Value Weighted Avg Age
                            </span>
                        </div>
                    </th>
                    <th>
                        <select value={props.group_rank} onChange={(e) => props.sendGroupRank(e.target.value)}>
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
                        <p className="clickable" onClick={() => sort('Projection')}>Proj</p>
                    </th>
                    <th>
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
            <tbody>
                {rosters === null ? null : rosters.map((roster, index) =>
                    <React.Fragment key={index}>
                        <tr onClick={() => showRoster(roster.roster_id)} className={roster.isRosterHidden ? 'hover2 clickable' : 'hover2 clickable active'}>
                            <td>
                                <img
                                    style={{ animation: `rotation ${Math.random() * 10 + 2}s infinite ease-out` }}
                                    className="thumbnail"
                                    alt="avatar"
                                    src={roster.avatar === null ? emoji : `https://sleepercdn.com/avatars/${roster.avatar}`}
                                />
                            </td>
                            <td colSpan={1} className="left">{roster.username}</td>
                            <td>{roster.wins}-{roster.losses}{roster.ties === 0 ? null : `-${roster.ties}`}</td>
                            <td>
                                {`${parseFloat(`${roster.settings.fpts}.${roster.settings.fpts_decimal === undefined ? 0 :
                                    roster.settings.fpts_decimal}`)}`}
                                -
                                {roster.settings.fpts_against === undefined ? 0 : `${parseFloat(`${roster.settings.fpts_against}.${roster.settings.fpts_against_decimal === undefined ? 0 :
                                    roster.settings.fpts_against_decimal}`)}`}
                            </td>
                            <td>
                                {props.getAge(roster)}
                            </td>
                            <td>
                                {props.getProj(roster).toLocaleString("en-US")}
                            </td>
                            <td>
                                {props.getValue(roster).toLocaleString("en-US")}
                            </td>
                        </tr>
                        {roster.isRosterHidden ? null :
                            <tr className="tertiary">
                                <td colSpan={7}>
                                    <Roster
                                        roster={roster}
                                        matchPlayer_DV={props.matchPlayer_DV}
                                        matchPlayer_Proj={props.matchPlayer_Proj}
                                        matchPlayer_Proj_W={props.matchPlayer_Proj_W}
                                        matchPick={props.matchPick}
                                        state={props.state}
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
export default League;