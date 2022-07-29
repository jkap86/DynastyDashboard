import axios from "axios";
import { useEffect, useState } from "react";
import Search from "./search";
import player_default from '../player_default.png';
import allPlayers from '../allPlayers.json';
import { read, utils } from 'xlsx';

const PlayerInfo = (props) => {
    const [isLoading, setIsLoading] = useState(false)
    const [projections, setProjections] = useState([])
    const [projections_weekly, setProjections_weekly] = useState([])
    const [dynastyvalues, setDynastyvalues] = useState([])
    const [file, setFile] = useState({ p: false, pw: false, dv: false })
    const [tab, setTab] = useState('Projections')
    const [filters, setFilters] = useState({ positions: [], types: [] })
    const [page, SetPage] = useState(1)

    const matchPlayers = (list) => {
        const l = Object.keys(allPlayers).filter(x => ['QB', 'RB', 'WR', 'TE'].includes(allPlayers[x].position)).map(player => {
            const match = list.find(x => x.searchName === allPlayers[player].search_full_name && (allPlayers[player].team !== null && allPlayers[player].team.slice(0, 2) === x.team.slice(0, 2)))
            const match2 = list.find(x => allPlayers[player].search_full_name !== undefined && (allPlayers[player].team !== null && allPlayers[player].team.slice(0, 2) === x.team.slice(0, 2)) &&
                x.searchName.slice(-5, -2) === allPlayers[player].search_full_name.slice(-5, -2) &&
                x.searchName.slice(0, 3) === allPlayers[player].search_full_name.slice(0, 3))
            return {
                id: player,
                name: allPlayers[player] === undefined ? match !== undefined ? match.name : match2 !== undefined ? match2.searchName : '' : allPlayers[player].full_name,
                searchName: match !== undefined ? match.searchName : match2 !== undefined ? match2.searchName : '',
                position: allPlayers[player] === undefined ? 'Pick' : allPlayers[player].position,
                value: match !== undefined ? match.value : match2 !== undefined ? match2.value : 0,
                updated_value: match !== undefined ? match.updated_value : match2 !== undefined ? match2.updated_value : 0,
                isPlayerHidden: false
            }
        })
        return l
    }

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            const [proj, proj_weekly, dv] = await Promise.all([
                await axios.get('/projections'),
                await axios.get('/projections_weekly'),
                await axios.get('/dynastyvalues')
            ])
            let p = matchPlayers(proj.data)

            setProjections(p.sort((a, b) => parseFloat(b.value) - parseFloat(a.value)))

            let pw = matchPlayers(proj_weekly.data)

            setProjections_weekly(pw.sort((a, b) => parseFloat(b.value) - parseFloat(a.value)))

            let d = matchPlayers(dv.data)
            d = [...d, ...dv.data.filter(x => x.position === 'PI')].flat()

            setDynastyvalues(d.sort((a, b) => parseInt(b.value) - parseInt(a.value)))

            setIsLoading(false)
        }
        fetchData()
    }, [])

    useEffect(() => {
        props.sendProjections(projections)
    }, [projections])

    useEffect(() => {
        props.sendProjections_weekly(projections_weekly)
    }, [projections_weekly])

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
        let pw = projections_weekly
        let d = dynastyvalues
        if (data) {
            p.map(player => {
                return player.isPlayerHidden = true
            })
            p.filter(x => x.name === data).map(player => {
                return player.isPlayerHidden = false
            })
            pw.map(player => {
                return player.isPlayerHidden = true
            })
            pw.filter(x => x.name === data).map(player => {
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
            pw.map(player => {
                return player.isPlayerHidden = false
            })
            d.map(player => {
                return player.isPlayerHidden = false
            })
        }
        SetPage(1)
        setProjections([...p])
        setProjections_weekly([...pw])
        setDynastyvalues([...d])
    }

    const updateValue = (name, team, position, updated_value) => {
        const p = tab === 'Projections' ? projections :
            tab === 'Week Projections' ? projections_weekly :
                dynastyvalues
        p.filter(x => x.name === name && x.team === team && x.position === position).map(player => {
            return player.updated_value = updated_value
        })
        if (tab === 'Projections') {
            setProjections([...p])
        } else if (tab === 'Week Projections') {
            setProjections_weekly([...p])
        } else {
            setDynastyvalues([...p])
        }

    }

    const sort = (sort_by) => {
        let p = tab === 'Projections' ? projections :
            tab === 'Week Projections' ? projections_weekly :
                dynastyvalues
        switch (sort_by) {
            case 'User':
                p = p.sort((a, b) => b.updated_value - a.updated_value)
                break;
            case 'Default':
                p = p.sort((a, b) => b.value - a.value)
                break;
        }
        switch (tab) {
            case 'Projections':
                setProjections([...p])
                break;
            case 'Week Projections':
                setProjections_weekly([...p])
                break;
            case 'Dynasty Values':
                setDynastyvalues([...p])
                break;
        }
    }

    const readFile = (e) => {
        if (e.target.files) {
            const reader = new FileReader()
            reader.onload = (e) => {
                const data = e.target.result
                const workbook = read(data, { type: 'array' })
                const sheetName = workbook.SheetNames[0]
                const worksheet = workbook.Sheets[sheetName]
                let json = utils.sheet_to_json(worksheet)
                json = json.map(player => {
                    const name = player.Name
                    const searchName = name.trim().replace('Jr.', '').replace('III', '').replace('II', '').replace('IV', '').replace(/[^0-9a-z]/gi, '').toLowerCase()
                    const team = player.Team
                    const value = player.Value
                    return {
                        name: name,
                        searchName: searchName,
                        team: team,
                        value: value,
                        updated_value: value
                    }
                })
                console.log(json)
                const upload = matchPlayers(json).sort((a, b) => b.value - a.value)
                switch (tab) {
                    case 'Projections':
                        setFile({
                            ...file,
                            p: upload
                        })
                        props.sendProjections(upload);
                        break;
                    case 'Week Projections':
                        setFile({
                            ...file,
                            pw: upload
                        })
                        props.sendProjections_weekly(upload)
                        break;
                    case 'Dynasty Values':
                        setFile({
                            ...file,
                            dv: upload
                        })
                        props.sendDV(upload)
                        break;
                }
            }
            reader.readAsArrayBuffer(e.target.files[0])
        }
    }

    let players;
    switch (tab) {
        case 'Projections':
            players = file.p ? file.p : projections;
            break;
        case 'Week Projections':
            players = file.pw ? file.pw : projections_weekly;
            break;
        case 'Dynasty Values':
            players = file.dv ? file.dv : dynastyvalues;
            break;
    }

    return isLoading ? <h1>Loading...</h1> :
        <>
            <div className="player_nav">
                <button className={tab === 'Projections' ? 'active clickable' : 'clickable'} onClick={() => setTab('Projections')}>ROS Projections</button>
                <button className={tab === 'Week Projections' ? 'active clickable' : 'clickable'} onClick={() => setTab('Week Projections')}>Week Projections</button>
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
                    list={tab === 'Projections' ? projections.map(player => player.name) :
                        tab === 'Week Projections' ? projections_weekly.map(player => player.name) :
                            dynastyvalues.map(player => player.name)}
                    placeholder={`Search ${tab}`}
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
                            <th colSpan={2}>Player</th>
                            <th>Position</th>
                            <th>Team</th>
                            <th className="clickable" onClick={() => sort('Default')}>{tab !== 'Dynasty Values' ? 'FantasyPos' : 'KTC'}</th>
                            <th className="clickable" onClick={() => sort('User')}>User</th>
                        </tr>
                    </tbody>
                    <tbody className="slide_up">
                        {players.filter(x => x.isPlayerHidden === false && !filters.positions.includes(x.position) &&
                            !filters.types.includes(x.type)).slice((page - 1) * 50, ((page - 1) * 50) + 50).map((player, index) =>
                                <tr className="hover" key={index}>
                                    <td>
                                        <img
                                            className="thumbnail"
                                            alt="headshot"
                                            src={`https://sleepercdn.com/content/nfl/players/thumb/${player.id}.jpg`}
                                            onError={(e) => { return e.target.src = player_default }}
                                        />
                                    </td>
                                    <td>{allPlayers[player.id] === undefined ? player.name : allPlayers[player.id].full_name}</td>
                                    <td>{allPlayers[player.id] === undefined ? null : allPlayers[player.id].position}</td>
                                    <td>{allPlayers[player.id] === undefined ? null : allPlayers[player.id].team}</td>
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