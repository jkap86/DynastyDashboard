import allPlayers from '../allPlayers.json';

const Breakdown = (props) => {

    return <>
        <table className='tertiary'>
            <tbody>
                <tr>
                    <th colSpan={3}>{props.username}</th>
                </tr>
            </tbody>
            <tbody>
                <tr>
                    <td colSpan={3}>
                        <table className='rostercolumn'>
                            <tbody>
                                <tr>
                                    <th>Starter</th>
                                    <th>Projection</th>
                                    <th>Points</th>
                                </tr>
                                {props.starters.map((starter, index) =>
                                    <tr className='hover3' key={index}>
                                        <td className='left'>{starter === '0' ? <em>empty</em> : allPlayers[starter].full_name}</td>
                                        <td>{props.matchPlayer_Proj_W(starter)}</td>
                                        <td className='black'>{starter === '0' ? null : props.players_points[starter]}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <table className='rostercolumn'>
                            <tbody>
                                <tr>
                                    <th>Bench</th>
                                    <th>Projection</th>
                                    <th>Points</th>
                                </tr>
                                {props.bench.sort((a, b) => parseFloat(props.matchPlayer_Proj_W(b)) - parseFloat(props.matchPlayer_Proj_W(a))).map((bp, index) =>
                                    <tr className='hover3' key={index}>
                                        <td className='left'>{allPlayers[bp].full_name}</td>
                                        <td>{props.matchPlayer_Proj_W(bp)}</td>
                                        <td className='black'>{props.players_points[bp]}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    </>
}
export default Breakdown;