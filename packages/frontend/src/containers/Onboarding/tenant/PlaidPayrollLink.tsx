import { useEffect, useState } from 'react';
import { getPlaidIncomeLinkToken } from '../../../lib/plaidLib';
import { useAppContext } from '../../../lib/contextLib';
import LaunchLink from './PlaidLinkLauncher';

export default function PlaidPayrollLink() {
    
    const [ linkToken, setLinkToken ] = useState("");
    const { user } = useAppContext();

    const loadAndLaunchLink = async() => {
        const t = await fetchLinkToken();
        setLinkToken(t);
        console.log("ready");
    }

    const linkSuccess = (public_token: String) => {
        console.log(`linkSuccess. public_token=${public_token}`);
    }

    const fetchLinkToken = async () => {
        const response = await getPlaidIncomeLinkToken(user);
        console.log(`fetchLinkToken. link_token=${response.link_token}`);
        return response.link_token;
    }

    useEffect(() => {
        loadAndLaunchLink();
    }, []);

    return (
        <div className="PlaidPayrollLink">
            <LaunchLink token={linkToken} successCallback={linkSuccess} />
        </div>
    );
}