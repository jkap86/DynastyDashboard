import { useState, useEffect } from "react"

const TransactionLeague = (props) => {
    const [scoring_settings, SetScoring_settings] = useState({})

    useEffect(() => {
        SetScoring_settings(props.scoring_settings)
    }, [props.scoring_settings])



    return <>
        <table className="scoring_settings">
            <tbody>
                <tr>
                    <th colSpan={2}>Passing</th>
                </tr>
                {Object.keys(scoring_settings).filter(x => x.includes('pass')).sort((a, b) => scoring_settings[b] - scoring_settings[a]).map((key, index) =>
                    <tr key={index}>
                        <td className="left">{key}</td>
                        <td>{scoring_settings[key].toFixed(2)}</td>
                    </tr>
                )}
                <tr>
                    <th colSpan={2}>Rushing</th>
                </tr>
                {Object.keys(scoring_settings).filter(x => x.includes('rush')).sort((a, b) => scoring_settings[b] - scoring_settings[a]).map((key, index) =>
                    <tr key={index}>
                        <td className="left">{key}</td>
                        <td>{scoring_settings[key].toFixed(2)}</td>
                    </tr>
                )}
                <tr>
                    <th colSpan={2}>Receiving</th>
                </tr>
                {Object.keys(scoring_settings).filter(x => x.includes('rec') && !x.includes('fum')).sort((a, b) => scoring_settings[b] - scoring_settings[a]).map((key, index) =>
                    <tr key={index}>
                        <td className="left">{key}</td>
                        <td>{scoring_settings[key].toFixed(2)}</td>
                    </tr>
                )}
            </tbody>
        </table>
    </>
}
export default TransactionLeague