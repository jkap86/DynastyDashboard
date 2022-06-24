import axios from "axios";
import { useEffect, useState } from "react";
import Search from "./search";
import player_default from '../player_default.png';
import allPlayers from '../allPlayers.json'

const PlayerInfo = (props) => {
    const [isLoading, setIsLoading] = useState(false)
    const [projections, setProjections] = useState([])
    const [dynastyvalues, setDynastyvalues] = useState([])
    const [tab, setTab] = useState('Projections')
    const [filters, setFilters] = useState({ positions: [], types: [] })

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            const [proj, dv] = await Promise.all([
                await axios.get('/projections'),
                await axios.get('/dynastyvalues')
            ])
            proj.data.map(player => {
                if (Object.keys(allPlayers).find(x => allPlayers[x].search_full_name === player.searchName && allPlayers[x].position === player.position)) {
                    return player.id = Object.keys(allPlayers).find(x => allPlayers[x].search_full_name === player.searchName && allPlayers[x].position === player.position)
                } else if (Object.keys(allPlayers).find(x => allPlayers[x].search_full_name !== undefined && allPlayers[x].search_full_name.slice(-5, -2) === player.searchName.slice(-5, -2) && allPlayers[x].search_full_name.slice(0, 3) === player.searchName.slice(0, 3))) {
                    return player.id = Object.keys(allPlayers).find(x => allPlayers[x].search_full_name.slice(-5, -2) === player.searchName.slice(-5, -2) && allPlayers[x].search_full_name.slice(0, 3) === player.searchName.slice(0, 3))
                }
            })
            setProjections(proj.data)

            dv.data.map(player => {
                if (Object.keys(allPlayers).find(x => allPlayers[x].search_full_name === player.searchName && allPlayers[x].position === player.position)) {
                    return player.id = Object.keys(allPlayers).find(x => allPlayers[x].search_full_name === player.searchName && allPlayers[x].position === player.position)
                } else if (Object.keys(allPlayers).find(x => allPlayers[x].search_full_name !== undefined && allPlayers[x].search_full_name.slice(-5, -2) === player.searchName.slice(-5, -2) && allPlayers[x].search_full_name.slice(0, 3) === player.searchName.slice(0, 3))) {
                    return player.id = Object.keys(allPlayers).find(x => allPlayers[x].search_full_name.slice(-5, -2) === player.searchName.slice(-5, -2) && allPlayers[x].search_full_name.slice(0, 3) === player.searchName.slice(0, 3))
                }
            })

            setDynastyvalues(dv.data)

            setIsLoading(false)
        }
        fetchData()
    }, [])

    useEffect(() => {
        props.sendProjections(projections)
    }, [projections])

    useEffect(() => {
        props.sendDV(dynastyvalues)
    }, [dynastyvalues])

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

    const getSearched = (data) => {
        let p = projections
        let d = dynastyvalues
        if (data) {
            p.map(player => {
                return player.isPlayerHidden = true
            })
            p.filter(x => x.name === data).map(player => {
                return player.isPlayerHidden = false
            })
            d.map(player => {
                return player.isPlayerHidden = true
            })
            d.filter(x => x.name === data).map(player => {
                return player.isPlayerHidden = false
            })
        } else {
            p.map(player => {
                return player.isPlayerHidden = false
            })
            d.map(player => {
                return player.isPlayerHidden = false
            })
        }
        setProjections([...p])
        setDynastyvalues([...d])
    }

    const updateValue = (name, team, position, updated_value) => {
        const p = tab === 'Projections' ? projections : dynastyvalues
        p.filter(x => x.name === name && x.team === team && x.position === position).map(player => {
            return player.updated_value = updated_value
        })
        setProjections([...p])
    }

    const players = tab === 'Projections' ? projections : dynastyvalues

    return isLoading ? <h1>Loading...</h1> :
        <>
            <div className="player_nav">
                <button className={tab === 'Projections' ? 'active clickable' : 'clickable'} onClick={() => setTab('Projections')}>Projections</button>
                <button className={tab === 'Dynasty Values' ? 'active clickable' : 'clickable'} onClick={() => setTab('Dynasty Values')}>Dynasty Values</button>
            </div>
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
                    {
                        tab === 'Projections' ? null :
                            <label className='script'>
                                Picks
                                <input className="clickable" name='PI' onChange={filterPosition} defaultChecked type="checkbox" />
                            </label>
                    }
                </div>
                <Search
                    list={tab === 'Projections' ? projections.map(player => player.name) : dynastyvalues.map(player => player.name)}
                    placeholder="Search Players"
                    sendSearched={getSearched}
                />
            </div>
            <div className="view_scrollable">
                <table className="main">
                    <tbody className="fade_in sticky">
                        <tr>
                            <th colSpan={2}>Player</th>
                            <th>Position</th>
                            <th>Team</th>
                            <th>{tab === 'Projections' ? 'FantasyPos' : 'KTC'}</th>
                            <th>User</th>
                        </tr>
                    </tbody>
                    <tbody className="slide_up">
                        {players.filter(x => x.isPlayerHidden === false && !filters.positions.includes(x.position) &&
                            !filters.types.includes(x.type)).map((player, index) =>
                                <tr className="hover" key={index}>
                                    <td>
                                        <img
                                            className="thumbnail"
                                            alt="headshot"
                                            src={`https://sleepercdn.com/content/nfl/players/thumb/${player.id}.jpg`}
                                            onError={(e) => { return e.target.src = player_default }}
                                        />
                                    </td>
                                    <td>{player.name}</td>
                                    <td>{player.position}</td>
                                    <td>{player.team}</td>
                                    <td>{player.value}</td>
                                    <td>
                                        <input
                                            type="text"
                                            className={parseFloat(player.updated_value) === parseFloat(player.value) ? 'updated_value' : 'updated_value modified'}
                                            value={player.updated_value}
                                            onChange={(e) => updateValue(player.name, player.team, player.position, e.target.value)}
                                        />
                                    </td>
                                </tr>
                            )}
                    </tbody>
                </table>
            </div>
        </>
}
export default PlayerInfo;