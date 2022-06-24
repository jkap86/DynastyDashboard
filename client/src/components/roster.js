import { useState } from "react";
import allPlayers from '../allPlayers.json';

const Roster = (props) => {
    const [tab, setTab] = useState('Lineup')

    const bench_players = props.roster.players.filter(x => !props.roster.starters.includes(x) &&
        (props.roster.taxi === null || !props.roster.taxi.includes(x)) &&
        (props.roster.reserve === null || !props.roster.reserve.includes(x)))

    const groupsLinup = [
        {
            name: 'Starters',
            players: props.roster.starters
        },
        {
            name: 'Bench',
            players: bench_players,
        },
        {
            name: 'Taxi',
            players: props.roster.taxi
        },
        {
            name: 'IR',
            players: props.roster.reserve
        }

    ]

    const groupsPositions = [
        {
            name: 'QB',
            players: props.roster.players.filter(x => allPlayers[x].position === 'QB')
        },
        {
            name: 'RB',
            players: props.roster.players.filter(x => allPlayers[x].position === 'RB')
        },
        {
            name: 'WR',
            players: props.roster.players.filter(x => allPlayers[x].position === 'WR')
        },
        {
            name: 'TE',
            players: props.roster.players.filter(x => allPlayers[x].position === 'TE')
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
                                                            {group.players.reduce((acc, cur) => acc + parseFloat(props.matchPlayer_Proj(cur)), 0).toLocaleString("en-US")}
                                                        </th>
                                                    </tr>
                                                    {group.players.map((player, index) =>
                                                        <tr className="hover3" key={index}>
                                                            <td className="black">
                                                                <em style={{ filter: `invert(${(props.matchPlayer_DV(player) / 200) + 50}%) brightness(2)` }}>
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
                                                                <em style={{ filter: `invert(${(props.matchPlayer_Proj(player) / 8.5) + 50}%) brightness(2)` }}>
                                                                    {props.matchPlayer_Proj(player)}
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
                                                            {group.players.reduce((acc, cur) => acc + parseFloat(props.matchPlayer_Proj(cur)), 0).toLocaleString("en-US")}
                                                        </th>
                                                    </tr>
                                                    {group.players === null ? null : group.players.map((player, index) =>
                                                        <tr className="hover3" key={index}>
                                                            <td className="black">
                                                                <em style={{ filter: `invert(${(props.matchPlayer_DV(player) / 200) + 50}%) brightness(2)` }}>
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
                                                                <em style={{ filter: `invert(${(props.matchPlayer_Proj(player) / 8.5) + 50}%) brightness(2)` }}>
                                                                    {props.matchPlayer_Proj(player)}
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
                                                        <em style={{ filter: `invert(${(props.matchPick(pick.season, pick.round) / 200) + 50}%) brightness(2)` }}>
                                                            {props.matchPick(pick.season, pick.round)}
                                                        </em>
                                                    </td>
                                                    <td>{pick.season} Round {pick.round}</td>
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

