import { useState } from "react";
import allPlayers from '../allPlayers.json';

const Roster = (props) => {
    const [tab, setTab] = useState('Lineup')
    const [projType, setProjType] = useState('ROS')

    const bench_players = props.roster.players === null ? [] : props.roster.players.filter(x => !props.roster.starters.includes(x) &&
        (props.roster.taxi === null || !props.roster.taxi.includes(x)) &&
        (props.roster.reserve === null || !props.roster.reserve.includes(x)))

    const groupsLinup = [
        {
            name: 'Starters',
            players: props.roster.starters
        },
        {
            name: 'Bench',
            players: bench_players.sort((a, b) => parseInt(props.matchPlayer_DV(b)) - parseInt(props.matchPlayer_DV(a))),
        },
        {
            name: 'Taxi',
            players: props.roster.taxi === null ? null : props.roster.taxi.sort((a, b) => parseInt(props.matchPlayer_DV(b)) - parseInt(props.matchPlayer_DV(a)))
        },
        {
            name: 'IR',
            players: props.roster.reserve === null ? null : props.roster.reserve.sort((a, b) => parseInt(props.matchPlayer_DV(b)) - parseInt(props.matchPlayer_DV(a)))
        }

    ]

    const groupsPositions = props.roster.players === null ? [] : [
        {
            name: 'QB',
            players: props.roster.players.filter(x => allPlayers[x].position === 'QB').sort((a, b) => parseInt(props.matchPlayer_DV(b)) - parseInt(props.matchPlayer_DV(a)))
        },
        {
            name: 'RB',
            players: props.roster.players.filter(x => allPlayers[x].position === 'RB').sort((a, b) => parseInt(props.matchPlayer_DV(b)) - parseInt(props.matchPlayer_DV(a)))
        },
        {
            name: 'WR',
            players: props.roster.players.filter(x => allPlayers[x].position === 'WR').sort((a, b) => parseInt(props.matchPlayer_DV(b)) - parseInt(props.matchPlayer_DV(a)))
        },
        {
            name: 'TE',
            players: props.roster.players.filter(x => allPlayers[x].position === 'TE').sort((a, b) => parseInt(props.matchPlayer_DV(b)) - parseInt(props.matchPlayer_DV(a)))
        }

    ]

    return <>
        <table className="tertiary">
            <caption>
                <button className={tab === 'Lineup' ? 'active clickable' : 'clickable'} onClick={() => setTab('Lineup')}>Lineup</button>
                <button className={tab === 'Positions' ? 'active clickable' : 'clickable'} onClick={() => setTab('Positions')}>Positions</button>
                <button className={tab === 'Picks' ? 'active clickable' : 'clickable'} onClick={() => setTab('Picks')}>Picks</button>
            </caption>
            <tbody>
                <tr>
                    <th>{props.roster.username}</th>
                </tr>
                <tr>
                    <td className="flex top">
                        {props.roster.players === null ? null :
                            <>
                                {tab === 'Lineup' ?
                                    <>
                                        {groupsLinup.filter(x => x.players !== null).map((group, index) =>
                                            <table key={index} className="rostercolumn">
                                                <tbody>
                                                    <tr>
                                                        <th>
                                                            {group.players.reduce((acc, cur) => acc + parseInt(props.matchPlayer_DV(cur)), 0).toLocaleString("en-US")}
                                                        </th>
                                                        <th>{group.name}</th>
                                                        <th>
                                                            <select value={projType} onChange={(e) => setProjType(e.target.value)}>
                                                                <option>Week {props.state.week}</option>
                                                                <option>ROS</option>
                                                            </select>
                                                            <br />
                                                            {projType === 'ROS' ?
                                                                group.players.reduce((acc, cur) => acc + parseFloat(props.matchPlayer_Proj(cur)), 0).toLocaleString("en-US") :
                                                                group.players.reduce((acc, cur) => acc + parseFloat(props.matchPlayer_Proj_W(cur)), 0).toLocaleString("en-US")
                                                            }
                                                        </th>
                                                    </tr>
                                                    {group.players.map((player, index) =>
                                                        <tr className="hover3" key={index}>
                                                            <td className="black">
                                                                <em className="bold" style={{ filter: `invert(${(props.matchPlayer_DV(player) / 200) + 50}%) brightness(2)` }}>
                                                                    {props.matchPlayer_DV(player)}
                                                                </em>
                                                            </td>
                                                            <td className="left">
                                                                {
                                                                    player === '0' ? <span>empty</span> :
                                                                        `${allPlayers[player].position} ${allPlayers[player].full_name}${allPlayers[player].team === null ? ' FA' : ` ${allPlayers[player].team}`}`

                                                                }
                                                            </td>
                                                            <td className="black">
                                                                <em className="bold" style={{ filter: `invert(${(props.matchPlayer_Proj(player) / 8.5) + 50}%) brightness(2)` }}>
                                                                    {projType === 'ROS' ? props.matchPlayer_Proj(player) : props.matchPlayer_Proj_W(player)}
                                                                </em>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        )}
                                    </>
                                    : null
                                }
                                {tab === 'Positions' ?
                                    <>
                                        {groupsPositions.map((group, index) =>
                                            <table key={index} className="rostercolumn">
                                                <tbody>
                                                    <tr>
                                                        <th>
                                                            {group.players.reduce((acc, cur) => acc + parseInt(props.matchPlayer_DV(cur)), 0).toLocaleString("en-US")}
                                                        </th>
                                                        <th>{group.name}</th>
                                                        <th>
                                                            <select value={projType} onChange={(e) => setProjType(e.target.value)}>
                                                                <option>Week {props.state.week}</option>
                                                                <option>ROS</option>
                                                            </select>
                                                            <br />
                                                            {projType === 'ROS' ?
                                                                group.players.reduce((acc, cur) => acc + parseFloat(props.matchPlayer_Proj(cur)), 0).toLocaleString("en-US") :
                                                                group.players.reduce((acc, cur) => acc + parseFloat(props.matchPlayer_Proj_W(cur)), 0).toLocaleString("en-US")
                                                            }
                                                        </th>
                                                    </tr>
                                                    {group.players === null ? null : group.players.map((player, index) =>
                                                        <tr className="hover3" key={index}>
                                                            <td className="black">
                                                                <em className="bold" style={{ filter: `invert(${(props.matchPlayer_DV(player) / 200) + 50}%) brightness(2)` }}>
                                                                    {props.matchPlayer_DV(player)}
                                                                </em>
                                                            </td>
                                                            <td className="left">
                                                                {
                                                                    player === '0' ? <span>empty</span> : allPlayers[player].position +
                                                                        " " + allPlayers[player].full_name + ` ${allPlayers[player].team === null ? 'FA' : allPlayers[player].team}`
                                                                }
                                                            </td>
                                                            <td className="black">
                                                                <em className="bold" style={{ filter: `invert(${(props.matchPlayer_Proj(player) / 8.5) + 50}%) brightness(2)` }}>
                                                                    {projType === 'ROS' ? props.matchPlayer_Proj(player) : props.matchPlayer_Proj_W(player)}
                                                                </em>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        )}
                                    </>
                                    : null
                                }
                                {tab === 'Picks' ?
                                    <table className="rostercolumn">
                                        <tbody>
                                            <tr>
                                                <th>
                                                    {props.roster.draft_picks.reduce((acc, cur) => acc + parseInt(props.matchPick(cur.season, cur.round)), 0).toLocaleString("en-US")}
                                                </th>
                                                <th>Draft Picks</th>
                                            </tr>
                                            {props.roster.draft_picks.sort((a, b) => a.season - b.season || a.round - b.round).map((pick, index) =>
                                                <tr className="hover3" key={index}>
                                                    <td className='black'>
                                                        <em className="bold" style={{ filter: `invert(${(props.matchPick(pick.season, pick.round) / 200) + 50}%) brightness(2)` }}>
                                                            {props.matchPick(pick.season, pick.round)}
                                                        </em>
                                                    </td>
                                                    <td className="left">
                                                        {pick.season} Round {pick.round}
                                                        {pick.original_username === props.roster.username ? null : <em> ({pick.original_username})</em>}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                    :
                                    null
                                }
                            </>
                        }
                    </td>
                </tr>
            </tbody>
        </table>
    </>
}
export default Roster;

