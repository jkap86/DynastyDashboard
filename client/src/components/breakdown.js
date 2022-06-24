import allPlayers from '../allPlayers.json';

const Breakdown = (props) => {

    return <>
        <table className='tertiary'>
            <tbody>
                <tr>
                    <th colSpan={2}>{props.username}</th>
                </tr>
                <tr>
                    <th>Starters</th>
                    <th>Points</th>
                </tr>
                {props.starters.map((starter, index) =>
                    <tr key={index}>
                        <td className='left'>{starter === '0' ? <em>empty</em> : allPlayers[starter].full_name}</td>
                        <td>{starter === '0' ? null : props.players_points[starter]}</td>
                    </tr>
                )}
            </tbody>
            <tbody>
                <tr>
                    <th>Bench</th>
                    <th>Points</th>
                </tr>
                {props.bench.map((bp, index) =>
                    <tr key={index}>
                        <td className='left'>{allPlayers[bp].full_name}</td>
                        <td>{props.players_points[bp]}</td>
                    </tr>
                )}
            </tbody>
        </table>
    </>
}
export default Breakdown;