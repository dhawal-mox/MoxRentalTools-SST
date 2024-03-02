import { useEffect, useState } from 'react';
import {
    usePlaidLink,
    PlaidLinkOptions,
    PlaidLinkOnSuccess,
  } from 'react-plaid-link';
import { getPlaidIncomeLinkToken } from '../../../lib/plaidLib';
import { useAppContext } from '../../../lib/contextLib';
import { Button } from 'react-bootstrap';
import LaunchLink from './PlaidLinkLauncher';

export default function PlaidPayrollLink() {
    
    const [ linkToken, setLinkToken ] = useState("");
    const { user, setUser } = useAppContext();

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

    // function getPlaidLinkConfig() {
    //     const plaidLinkConfig: PlaidLinkOptions = {
    //         onSuccess: (public_token, metadata) => {
    //             console.log(`Success. public_token=${public_token}. metadata=${metadata}`);
    //         },
    //         onExit: (err, metadata) => {
    //             console.log(`Exit. err=${err}. metadata=${metadata}`);
    //         }, 
    //         onEvent: (eventName, metadata) => {
    //             console.log(`Event. eventName=${eventName}. metadata=${metadata}`);
    //         },
    //         token: linkToken,
    //     };
    //     return plaidLinkConfig;
    // }

    // async function onLoad() {
    //     console.log('inside onLoad)');
    //     const response = await getPlaidIncomeLinkToken(user);
    //     return response.link_token;
    //     // setLinkToken(response.link_token);
    // }

    return (
        <div className="PlaidPayrollLink">
            <LaunchLink token={linkToken} successCallback={linkSuccess} />
        </div>
    );
}